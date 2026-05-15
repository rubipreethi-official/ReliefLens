import { getCollection } from '../db.js'
import { gemmaGenerateJson } from './gemmaServer.js'
import type { GeocodedLocation } from './geocode.js'

export interface ScrapedContact {
  name: string
  designation: string
  roleOrOrganization: string
  phone: string
  email: string
  category: string
  sourceUrl?: string
  regions: string[]
  countryCode: string
  scrapedAt: string
}

interface ScrapePlan {
  sources: Array<{ url: string; reason: string }>
}

interface ExtractedContactsPayload {
  contacts: Array<{
    name: string
    designation: string
    organization: string
    phone: string
    email: string
    category: string
  }>
}

const FALLBACK_SOURCES: Record<string, string[]> = {
  IN: [
    'https://ndma.gov.in/',
    'https://www.ndrf.gov.in/',
    'https://www.nhp.gov.in/',
  ],
  US: ['https://www.fema.gov/', 'https://www.redcross.org/'],
  DEFAULT: ['https://reliefweb.int/', 'https://www.who.int/emergencies'],
}

async function fetchPageSnippet(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ReliefLens/1.0 (disaster-relief-research)' },
    })
    clearTimeout(timeout)
    if (!res.ok) return ''
    const html = await res.text()
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000)
  } catch {
    return ''
  }
}

export async function scrapeEmergencyContacts(location: GeocodedLocation): Promise<ScrapedContact[]> {
  console.log(`[Scraper] Starting scrape for: ${location.address} (${location.region}, ${location.country})`);
  
  let plan: ScrapePlan = { sources: [] };
  try {
    plan = await gemmaGenerateJson<ScrapePlan>(
    `You are a disaster relief intelligence planner. Given a user location, list 3-6 authoritative public URLs 
    (government disaster management, civil defence, national emergency numbers, Red Cross/NGO helplines) 
    likely to contain emergency contacts for that region. Prefer .gov and official NGO domains.`,
    `Location: ${location.address}
Region: ${location.region}
Country: ${location.country} (${location.countryCode})
Coordinates: ${location.lat}, ${location.lng}

Return JSON: { "sources": [{ "url": "https://...", "reason": "..." }] }`
  )
    console.log(`[Scraper] AI generated ${plan.sources?.length || 0} potential sources.`);
  } catch (err) {
    console.error(`[Scraper] Failed to generate scrape plan:`, err);
  }

  const fallback = FALLBACK_SOURCES[location.countryCode] || FALLBACK_SOURCES.DEFAULT
  const urls = [
    ...new Set([
      ...(plan.sources?.map((s) => s.url) || []),
      ...fallback,
    ]),
  ].slice(0, 6)

  const allContacts: ScrapedContact[] = []
  const now = new Date().toISOString()

  for (const url of urls) {
    console.log(`[Scraper] Fetching snippet from: ${url}`);
    const snippet = await fetchPageSnippet(url)
    if (!snippet) {
      console.warn(`[Scraper] No content retrieved from ${url}`);
      continue
    }
    console.log(`[Scraper] Retrieved ${snippet.length} chars from ${url}. Extracting contacts...`);

    try {
      const extracted = await gemmaGenerateJson<ExtractedContactsPayload>(
        `Extract emergency contacts from web page text for disaster relief in ${location.country}.
        Only include entries you can infer from the text or well-known official numbers for that country.
        Categories: Official Support, Medical, NGO, Fire, Police, Disaster Management.`,
        `Source URL: ${url}
Region context: ${location.region}, ${location.country}

Page text:
${snippet}

Return JSON: { "contacts": [{ "name", "designation", "organization", "phone", "email", "category" }] }`
      )

      for (const c of extracted.contacts || []) {
        if (!c.phone && !c.email) continue
        const contact: ScrapedContact = {
          name: c.name || 'Emergency Contact',
          designation: c.designation || c.category,
          roleOrOrganization: c.organization || c.category,
          phone: c.phone || '',
          email: c.email || '',
          category: c.category || 'Official Support',
          sourceUrl: url,
          regions: [location.region, location.country],
          countryCode: location.countryCode,
          scrapedAt: now,
        }
        allContacts.push(contact)
      }
      console.log(`[Scraper] Successfully extracted ${extracted.contacts?.length || 0} contacts from ${url}`);
    } catch (err) {
      console.error(`[Scraper] Contact extraction failed for ${url}:`, err)
    }
  }

  if (allContacts.length === 0) {
    console.log(`[Scraper] No contacts found in snippets. Synthesizing fallback contacts for ${location.country}...`);
    try {
      const synthesized = await gemmaGenerateJson<ExtractedContactsPayload>(
        `Provide verified-style emergency disaster relief contacts for the given region.
        Use real national emergency numbers where known (e.g. India 112, US 911).`,
        `Country: ${location.country} (${location.countryCode}), Region: ${location.region}
Return JSON with at least 4 contacts: police, fire, disaster management, and one NGO.`
      )
      for (const c of synthesized.contacts || []) {
        allContacts.push({
          name: c.name || 'Emergency Line',
          designation: c.designation || 'Hotline',
          roleOrOrganization: c.organization || 'Emergency Services',
          phone: c.phone || '',
          email: c.email || '',
          category: c.category || 'Official Support',
          sourceUrl: 'gemma-curated',
          regions: [location.region, location.country],
          countryCode: location.countryCode,
          scrapedAt: now,
        })
      }
    } catch (err) {
      console.error(`[Scraper] AI Synthesis failed:`, err);
    }
  }

  // Double check, if still zero (AI hit limit or failed), use static hardcoded fallback
  if (allContacts.length === 0) {
    console.log(`[Scraper] All AI methods failed. Using hardcoded static emergency numbers for ${location.countryCode}...`);
    const staticContacts = [
      { name: 'National Emergency Number', phone: '112', org: 'Gov' },
      { name: 'Police', phone: '100', org: 'Official' },
      { name: 'Fire Station', phone: '101', org: 'Official' },
      { name: 'Ambulance', phone: '102', org: 'Medical' },
      { name: 'Disaster Management Authority', phone: '108', org: 'Gov' },
    ]
    for (const sc of staticContacts) {
      allContacts.push({
        name: sc.name,
        designation: 'Emergency Hotline',
        roleOrOrganization: sc.org,
        phone: sc.phone,
        email: '',
        category: 'Official Support',
        sourceUrl: 'static-fallback',
        regions: [location.region, location.country],
        countryCode: location.countryCode,
        scrapedAt: now,
      })
    }
  }

  console.log(`[Scraper] Saving ${allContacts.length} contacts to database...`);
  try {
    const col = await getCollection<ScrapedContact>('emergency_contacts')
    for (const contact of allContacts) {
      await col.updateOne(
        { email: contact.email, phone: contact.phone, roleOrOrganization: contact.roleOrOrganization },
        { $set: contact },
        { upsert: true }
      )
    }
    console.log(`[Scraper] Successfully saved contacts to MongoDB.`);
  } catch (err) {
    console.error(`[Scraper] Database error while saving contacts:`, err);
  }

  return allContacts
}

export async function getContactsForLocation(
  region: string,
  countryCode?: string
): Promise<ScrapedContact[]> {
  const col = await getCollection<ScrapedContact>('emergency_contacts')
  const filter: Record<string, unknown> = {
    $or: [
      { regions: { $regex: region, $options: 'i' } },
      { roleOrOrganization: { $regex: region, $options: 'i' } },
    ],
  }
  if (countryCode) filter.countryCode = countryCode
  return col.find(filter).limit(20).toArray()
}
