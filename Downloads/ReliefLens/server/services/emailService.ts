import nodemailer from 'nodemailer'
import { SERVER_CONFIG } from '../config.js'
import type { ScrapedContact } from './contactScraper.js'

export interface IncidentEmailPayload {
  incidentId: string
  severity: string
  incidentType: string
  location: string
  description: string
  affectedCount?: number
  urgencyFlags?: string[]
  lat?: number
  lng?: number
}

function buildIncidentHtml(payload: IncidentEmailPayload): string {
  return `
    <h2>ReliefLens — Super Critical Speed Report</h2>
    <p><strong>Incident ID:</strong> ${payload.incidentId}</p>
    <p><strong>Severity:</strong> ${payload.severity.toUpperCase()}</p>
    <p><strong>Type:</strong> ${payload.incidentType}</p>
    <p><strong>Location:</strong> ${payload.location}</p>
    ${payload.lat != null ? `<p><strong>Coordinates:</strong> ${payload.lat}, ${payload.lng}</p>` : ''}
    <p><strong>Affected:</strong> ${payload.affectedCount ?? 'Unknown'}</p>
    <p><strong>Urgency:</strong> ${(payload.urgencyFlags || []).join(', ') || 'None listed'}</p>
    <hr />
    <p>${payload.description}</p>
    <p><em>Sent automatically by ReliefLens tactical node.</em></p>
  `
}

export async function sendCriticalReport(
  contacts: ScrapedContact[],
  payload: IncidentEmailPayload
): Promise<{ sent: string[]; failed: string[] }> {
  if (!SERVER_CONFIG.gmailUser || !SERVER_CONFIG.gmailAppPassword) {
    throw new Error(
      'Gmail not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD (or GOOGLE_APP_PASSWORD) to .env.local.'
    )
  }

  const recipients = contacts.filter((c) => c.email).slice(0, 5)
  if (recipients.length === 0) {
    throw new Error('No official email contacts found for your region. Run contact scrape first.')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SERVER_CONFIG.gmailUser,
      pass: SERVER_CONFIG.gmailAppPassword,
    },
  })

  const sent: string[] = []
  const failed: string[] = []
  const html = buildIncidentHtml(payload)

  for (const contact of recipients) {
    try {
      await transporter.sendMail({
        from: `ReliefLens Tactical <${SERVER_CONFIG.gmailUser}>`,
        to: contact.email,
        subject: `[CRITICAL] ReliefLens Incident — ${payload.incidentType} — ${payload.location}`,
        html: `<p>Dear ${contact.name} (${contact.roleOrOrganization}),</p>${html}`,
        text: `Critical incident report from ReliefLens.\n${JSON.stringify(payload, null, 2)}`,
      })
      sent.push(contact.email)
    } catch {
      failed.push(contact.email)
    }
  }

  return { sent, failed }
}
