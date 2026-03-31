# Alfred — Your AI Chief of Staff

Alfred is an AI-powered personal assistant that helps you **instantly create, manage, and adapt your schedule through natural conversation**. Instead of manually organizing tasks across multiple apps, you simply talk to Alfred — and it handles the rest.

---

## 🚀 Problem

Managing daily schedules is fragmented and time-consuming. Students and busy individuals constantly switch between calendars, notes, and to-do apps, making it difficult to keep up with changing priorities.

---

## 💡 Solution

Alfred acts as a **conversational AI planner** that:
- Builds your schedule instantly
- Updates it dynamically when plans change
- Follows up with reminders and calls

You don’t plan your day — **Alfred plans it for you.**

---

## ✨ Features

- 🗣️ **Voice & Chat-Based Scheduling**  
  Talk naturally to create events and tasks

- 📅 **Automatic Calendar Management**  
  Instantly creates and updates events

- 🔁 **Dynamic Re-planning**  
  Adjusts your schedule when priorities change

- 📞 **Reminder Calls & Notifications**  
  Proactive follow-ups to keep you accountable

- 🧠 **Context-Aware Planning**  
  Alfred asks smart questions to optimize your day

---

## 🧱 Tech Stack

### Frontend
- **React / Next.js** — Web app framework
- **Tailwind CSS** — UI styling

### Backend
- **Next.js API Routes** — Server-side logic
- **Firebase Firestore** — Database for events, todos, users
- **Firebase Admin SDK** — Secure server-side operations

### AI & Voice
- **OpenAI API (GPT-4o)** — Conversational intelligence
- **Vapi** — Voice AI + call handling (outbound & web calls)

### Infrastructure
- **Ngrok** — Local webhook tunneling for development
- **Vercel (planned)** — Deployment

---

## 🏗️ Architecture Overview

1. User interacts with Alfred (voice or web)
2. AI processes intent using OpenAI
3. Alfred triggers structured actions:
   - Create event
   - Create todo
4. Vapi handles tool calls → Webhook
5. Backend APIs store data in Firestore
6. Firebase Functions (planned) maintain final schedule

---

## 📂 Database Structure
events/{userId}/all/{eventId}
todos/{userId}/all/{todoId}
users/{userId}/schedule/{itemId}


- Events & todos stored per user
- Final schedule aggregates active items
- Designed for scalability and real-time updates

---

## 🔄 Key Workflows

### Event Creation
- User says: “Meeting tomorrow at 5”
- AI extracts structured data
- Tool call → webhook → Firestore

### Todo Creation
- User says: “Finish assignment”
- Stored with optional priority and due date

### Scheduling (Planned)
- Firebase Functions auto-update user schedule
- Syncs events + todos into one timeline

---

## 📊 Current Focus

- Improve **autonomous schedule generation**
- Optimize **AI cost per user**
- Increase **user retention through follow-ups**
- Expand **voice-first interactions**

---

## 🎯 Target Users

- Undergraduate students  
- Graduate students  
- Busy individuals with dynamic schedules  

---

## 💰 Business Model (Planned)

- Freemium model
- Pro plan: $10–$25/month
- Premium features:
  - Advanced scheduling
  - Unlimited reminders/calls
  - Smart prioritization

---

## 🚧 Roadmap

- [x] Voice-based scheduling (Vapi)
- [x] Event & todo creation
- [X] Autonomous schedule builder
- [X] Calendar integrations (Google/Apple)
- [ ] Smarter follow-up system
- [ ] Team/workspace features

---

## 🧪 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Start ngrok for webhook testing
ngrok http 3000
