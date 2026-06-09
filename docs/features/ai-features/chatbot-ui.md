---
status: done
priority: medium
---

# AI Chatbot — Frontend UI

**Status**: `done` ✅
**Last Updated**: 2026-06-09

## Overview
Floating chatbot widget accessible from any page. Provides an AI-powered archaeological assistant using Gemini 2.5 Flash with an archaeologist persona.

## Implementation

### Component: `ChatbotWidget.tsx`
- **Trigger**: Floating action button (bottom-right corner, circular with chat icon)
- **UI**: Sheet-based panel (slides in from right)
- **Header**: "Archaeological Assistant" title with close button
- **Messages**: Scrollable message list with `ChatMessage` components
- **Input**: Text input with Enter key to send
- **Typing Indicator**: Animated dots while waiting for AI response

### State Management
- `uiStore.ts` (Zustand): `isChatOpen` boolean toggles sheet visibility
- Local state: `messages` array, `input` value, `isLoading` flag

### Data Flow
1. User clicks FAB → opens sheet
2. User types message → `handleSend()` called
3. Converts local `{role, content}` messages to Gemini format `{role, parts: [{text}]}`
4. Calls `aiApi.chat()` → `POST /api/ai/chatbot`
5. Appends user message + AI reply to local state
6. Trims history to last 20 messages to prevent context overflow

### Auth Handling
- Chatbot uses `optionalAuth` on backend (per ADR-006)
- If user is authenticated, their Firebase ID token is sent
- If not authenticated, request proceeds without auth
- Backend sets `req.user = null` for unauthenticated requests

### Styling
- Matches app theme (warm tones: `#FDFAF5` background, `#D4C5A9` borders)
- `framer-motion` for typing indicator animation
- Responsive sheet width (full on mobile, 400px on desktop)

## Acceptance Criteria
- [x] Floating button visible on all pages
- [x] Sheet opens/closes smoothly
- [x] Messages displayed with proper formatting
- [x] Typing indicator during AI response
- [x] Enter key sends message
- [x] History preserved during session
- [x] Works for both authenticated and anonymous users
- [x] History trimmed to prevent context overflow

## Files
- `src/components/ai/ChatbotWidget.tsx` — Main widget component
- `src/components/ai/ChatMessage.tsx` — Individual message component
- `src/store/uiStore.ts` — Zustand store for chat open state
- `src/lib/api.ts` — `aiApi.chat()` API call
