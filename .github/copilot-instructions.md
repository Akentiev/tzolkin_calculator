# Tzolkin Tracker - AI Coding Instructions

## Architecture Overview

**No-build React App via CDN**. This is a **browser-only React 18 app** using Babel Standalone for JSX compilation. No webpack, no npm scripts for frontend. All libraries loaded via CDN in [index.html](../index.html).

- **Frontend**: React 18 (CDN UMD) + Tailwind CSS (CDN) + marked + DOMPurify + lucide-react (UMD)
- **Backend**: Serverless functions in `api/` (Vercel-compatible format)
- **Database**: Supabase (`user_days` table)
- **AI**: Anthropic Claude API via serverless endpoints

### Component Loading Order

JSX files are loaded as `<script type="text/babel">` in [index.html](../index.html). **Order matters**: dependencies must load before dependents. Current load order (last = root):
```
WaveVisualization → WaveHistoryScreen → TutorialScreen → WaveHistory → HomeScreen → CurrentWave → FullCalendarScreen → ProfileScreen → BottomNavigation → App.jsx
```

## Critical Patterns

### 1. Tzolkin Calculation (`calculateKin`)

The **single source of truth** for Kin/Tone/Seal calculation is `calculateKin()` in [App.jsx](../App.jsx#L90-L115):
- Uses **leap year adjustment** (skips Feb 29 in calculations)
- Anchored to: `2026-01-14` = Kin 36 (Tone 10, Seal 16)
- Returns `{ kin, tone, seal }` where `tone` is 1-13, `seal` is 0-19
- **Never** calculate Kin manually. Always use this function.

### 2. Syucai Calculation (`calculateSyucai`)

Chinese numerology system in [ProfileScreen.jsx](../ProfileScreen.jsx#L20-L35):
- **Consciousness Number**: Sum of birth day digits reduced to 1-9
- **Mission Number**: Sum of full birthdate (day+month+year) reduced to 1-9
- Used alongside Tzolkin for personality profiling
- Returns `{ consciousness, mission }` both 1-9

**Personal Day Calculation**: Current day's numerology [WaveHistoryScreen.jsx](../WaveHistoryScreen.jsx):
- Formula: `sumDigits(day) + sumDigits(month) + consciousness number` → reduce to 1-9
- Shows daily Syucai cycle in wave history view
- Only displayed when user has set birth date

### 3. Global State via `window`

Globals defined in [App.jsx](../App.jsx):
- `window.tgHapticLight()` - Safe wrapper for Telegram haptic feedback
- `window.LucideReact` - Icon library (UMD format)
- `calculateKin` is defined in App.jsx scope, NOT global. Components access it via closure or pass through props.

### 3. Energy Data Format

**Energy field has dual representation**:
- **In Supabase**: stored as `integer` (1-5)
- **In UI state**: stored as `string` ('Высокая', 'Подъём', 'Средняя', 'Спад', 'Низкая', 'Апатия')

Use helper functions in [App.jsx](../App.jsx#L141-L154):
- `energyToNumber(label)` - UI label → number for DB
- `numberToEnergy(num)` - DB number → UI label

### 5. AI Integration Architecture

**Three AI endpoints**:

1. **[api/analyze-day.js](../api/analyze-day.js)** - Two modes:
   - **Mode: `structure`** (Secretary) - Extracts structured data from notes
   - **Mode: default** (Advisor) - Returns coaching advice in Markdown
   - **Personalization**: Accepts `userProfile` param to analyze resonances between birth Kin/current day Kin, consciousness number/tone phase
   - **Personal Day**: Calculates daily Syucai number (1-9) using `day + month + consciousness`
   - **Seal Names**: Uses readable seal names (e.g., "Красный Дракон") instead of indices
   - **Triple Resonance Analysis**: 
     1. Birth Kin ↔ Day Kin
     2. Tone ↔ Consciousness Number
     3. Personal Day ↔ Mission Number

2. **[api/analyze-wave.js](../api/analyze-wave.js)** - Full 13-day pattern analysis

3. **[api/analyze-profile.js](../api/analyze-profile.js)** - Generates personality portrait combining Tzolkin + Syucai (3-5 sentences)

All endpoints return Markdown (except `structure` mode → JSON). Auto-sanitized before display.

### 6. Markdown Rendering

**All AI responses use safe Markdown rendering**:
```jsx
const renderMarkdown = (markdown) => {
  const cleaned = stripLeadingEmojiFromHeadings(markdown);
  return { __html: DOMPurify.sanitize(marked.parse(cleaned)) };
};
// Usage: <div dangerouslySetInnerHTML={renderMarkdown(text)} />
```

Pattern in: [HomeScreen.jsx](../HomeScreen.jsx#L21-L52), [WaveHistory.jsx](../WaveHistory.jsx#L2-L19)

### 7. Supabase Data Layer

**Single table**: `user_days`

Schema:
```
user_id (string) - Generated once, stored in localStorage
date (string) - Format: YYYY-MM-DD
kin, tone, seal (number) - Calculated from date
energy (integer 1-5) - Stored as number
resonance, action, project, insight (string) - User selections
notes (string) - Free text
ai_summary (string) - Auto-generated on save
ai_events (json) - Array of strings
```

**Upsert pattern**: Always use `{ onConflict: 'user_id,date' }` when saving.

**User Profile**: Stored in `localStorage` as `userProfile` key:
```js
{ name, birthDate, tzolkinBirth, syucai, aiPortrait }
```

## Development Workflows

### Local Development

**Frontend only** (API endpoints will fail):
```powershell
python -m http.server 8000
# or
npx serve .
```
Open `http://localhost:8000`. **Never** use `file://` - Babel + modules require HTTP server.

**Full stack** (with serverless):
Deploy to Vercel or compatible platform. Set `CLAUDE_API_KEY` environment variable.

### Testing AI Features

AI endpoints (`/api/analyze-day`, `/api/analyze-wave`) **only work when deployed**. Local frontend development will show AI buttons but they'll fail - this is expected behavior.

## Code Conventions

### Component Props Pattern

Components receive flattened props from App.jsx. No prop drilling via context. See [HomeScreen.jsx](../HomeScreen.jsx#L3) props signature for typical pattern.

### Styling Approach

- **Glassmorphism**: Use `.glass-card` or `.glass-card-strong` classes
- **Tailwind via CDN**: Configure in [index.html](../index.html#L7) `<script>` tag
- **Dynamic accent colors**: Seal colors passed as props, converted with `hexToRgba()` helper
- **Space theme**: Animated starfield background in [index.html](../index.html#L39-L93) CSS

### Icons

lucide-react loaded as UMD. Access via `window.LucideReact`:
```jsx
const { Calendar, ChevronDown } = window.LucideReact || {};
// Always provide fallback: {Calendar ? <Calendar /> : <span>📅</span>}
```

## Common Pitfalls

1. **Don't** add npm scripts for frontend build - this is a browser-compile project
2. **Don't** import React - use `const { useState } = React;` (React is global)
3. **Don't** calculate Kin manually - always use `calculateKin()` function
4. **Don't** forget energy number ↔ label conversion when saving to DB
5. **Don't** expect API routes to work locally - deploy to test AI features
6. **Don't** use emoji in AI prompts - they render poorly (see [api/analyze-day.js](../api/analyze-day.js#L42))

## File References

- Main entry: [index.html](../index.html)
- Root component: [App.jsx](../App.jsx)
- Tzolkin math: [App.jsx](../App.jsx#L90-L115)
- Daily tracking UI: [HomeScreen.jsx](../HomeScreen.jsx)
- Wave visualization: [CurrentWave.jsx](../CurrentWave.jsx), [WaveHistory.jsx](../WaveHistory.jsx)
- Profile & Syucai: [ProfileScreen.jsx](../ProfileScreen.jsx)
- AI endpoints: [api/analyze-day.js](../api/analyze-day.js), [api/analyze-wave.js](../api/analyze-wave.js), [api/analyze-profile.js](../api/analyze-profile.js)
