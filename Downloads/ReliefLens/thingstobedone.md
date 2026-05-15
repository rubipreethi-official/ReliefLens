The problem right now is how aria replied see this  /*The user also mentioned they are "almost drowning," which indicates high urgency/critical condition.

According to the TRIAGE FLOW:
1. Reassure (Done in first turn, but can be integrated).
2. Disaster type known: "flood".
3. Give 1-2 life-saving tips: For floods, move to higher ground or avoid walking through moving water.
4. Location known: "Madurai".
5. People count known: "Four".

All required information for `extract_incident_data` has been collected:
- What: Flood, people drowning (critical).
- Where: Madurai.
- Who: 4 people, critical condition.

Now I should call the tool `extract_incident_data` and provide a supportive spoken response.

Wait, the prompt says "ONLY call extract_incident_data when ALL info is collected."
I have:
- Type: Flood
- Location: Madurai
- Count: 4
- Condition: Almost drowning

I have enough info.

Plan:
1. Give life-saving tips.
2. Call `extract_incident_data`.
3. Respond to user.*/

but I'll give you an example of how it should reply in this condition you make it generic for other disasters and make it customized for each disaster Itshould be like /* "Calm down I'm here to help you I'll inform the authorities about your situation and will get back to you as soon as possible... Stay safe for now and avoid any further risks.. I'm preparing the incident card don't worry..In the generated card in dashboard click super critical to send autonomous mail to the rescue forces.. Meanwhile try going to upstairs to prevent getting drownes*/
meanwhile the cards should get generated in the background and it should not be spoken out here the information should be seen as report from dashboard page which is perfectly working now. Also the Database is still not created in my database project name ReliefLens cluster 0