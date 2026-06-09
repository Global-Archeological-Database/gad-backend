# Global Archaeological Database — Project Rules

This is a production application being built for millions of users. 
Every decision must consider scale, cost, and security.

## ABSOLUTE PROHIBITIONS (Never violate these)
- Never install @google-cloud/vertexai
- Never hardcode API keys in any file that gets committed to git
- Never commit .env files
- Never use res.sendFile() on index.html without config injection first
- Never delete a file without explicit approval
- Never run firebase deploy without running npm start locally first
- Never use the .appspot.com storage bucket (use .firebasestorage.app)

## Before Proposing ANY Change
1. Read the relevant files first
2. State what you found
3. Describe the exact change proposed
4. List what could break
5. Wait for approval on destructive changes

## Communication Pattern
- State findings before acting
- One clear next step at a time
- If uncertain, ask — do not guess
- If a fix doesn't work after 2 attempts, stop and report what you found

## Tech Stack (Locked)
- Backend: Express.js + Firebase Admin SDK + @google/generative-ai
- Frontend (future): Next.js 14 + TypeScript + Tailwind + shadcn/ui
- Database: Cloud Firestore
- Storage: Firebase Storage (.firebasestorage.app bucket)
- Hosting: Firebase App Hosting (backend) + Vercel (frontend)