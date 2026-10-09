# Alfred: AI Scheduling Assistant

Alfred is a voice-and-chat AI assistant that builds, manages and re-plans your schedule through natural conversation. Tell Alfred what you need to do, and it creates the events and to-dos, syncs them to Google Calendar, and calls you with reminders.

**Demo video:** https://youtu.be/VkQwMyP7-Y8

## Why

Students and busy people juggle calendars, notes and to-do apps, and the plan breaks the moment priorities change. Alfred replaces that manual juggling with one conversation.

## Features

- **Voice and chat scheduling:** talk to Alfred in the browser or over a phone call to create, edit and delete events and to-dos.
- **Dynamic re-planning:** Alfred adjusts the schedule when plans change.
- **Google Calendar sync:** events are inserted, patched and deleted in Google Calendar.
- **Reminder calls:** outbound calls through Vapi keep you accountable.
- **Unified views:** home, chat, calendar and to-do pages for the same schedule.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Radix UI, Framer Motion |
| Auth | Clerk |
| Voice AI | Vapi (web and phone calls, tool calls via webhooks) |
| Backend | Next.js API routes, Hono, Firebase Functions |
| Data | Firebase Firestore, Firebase Admin SDK |
| Integrations | Google Calendar API |

## How it works

1. The user talks to Alfred by voice or chat.
2. The Vapi assistant turns the request into a structured tool call (create event, edit to-do, and so on).
3. The tool call hits a webhook under `app/api/alfred/*`, which writes to Firestore and syncs Google Calendar.
4. The schedule views read from Firestore. Reminder calls are triggered through `app/api/vapi/*`.

Data model:

```
events/{userId}/all/{eventId}
todos/{userId}/all/{todoId}
users/{userId}/schedule/{itemId}
```

## Getting started

```bash
git clone https://github.com/aseel332/mr-daily.git
cd mr-daily
npm install
npm run dev
```

Create `.env.local` with your Firebase (client and admin), Clerk and Vapi keys (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `VAPI_API_KEY`, `VAPI_PHONE_NUMBER_ID`). Use a tunnel such as `ngrok http 3000` so Vapi can reach your local webhooks.

## Roadmap

- [x] Voice-based scheduling
- [x] Event and to-do creation
- [x] Autonomous schedule builder
- [x] Google Calendar integration
- [ ] Smarter follow-up system
- [ ] Team and workspace features
