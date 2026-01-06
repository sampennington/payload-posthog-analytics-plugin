# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```bash
npm run build          # Compile TypeScript to dist/
npm test               # Run all tests (requires NODE_OPTIONS=--experimental-vm-modules)
npm test -- --watch    # Watch mode
npm test -- <pattern>  # Run specific test file (e.g., npm test -- utils.test)
npm run clean          # Remove dist/
npm run prepack        # Clean + build (runs before npm publish)
```

## Architecture

This is a Payload CMS plugin that adds a PostHog analytics dashboard to the admin panel.

### Data Flow

```
PostHog API
    ↓
lib/posthog-api-client.ts  (factory pattern, creates API client)
    ↓
lib/posthog.ts             (getPostHogData - aggregates 7 parallel API calls)
    ↓
endpoints/data.ts          (GET /api/analytics/data?period=7d)
    ↓
lib/use-analytics.ts       (React hook for client-side fetching)
    ↓
components/AnalyticsDashboard.tsx → Section components → Charts/Tables
```

### Key Patterns

**Factory Pattern** (`lib/posthog-api-client.ts`): `createPostHogClient()` encapsulates PostHog config via closure. Methods like `getVisitorsTrend()`, `getTopPages()` use this config without passing it explicitly.

**Module-level Config** (`index.ts:33`): `dashboardConfig` stores plugin options at module level so the server component `AnalyticsView` can pass config to the client `AnalyticsDashboard`.

**Configuration-driven UI**: Dashboard sections (cards, charts, tables) are configurable via plugin options. Users can override with custom render functions or inject custom sections.

### Plugin Integration

The plugin modifies Payload config in `index.ts`:
- Registers admin view at configurable path (default: `/analytics`)
- Adds REST endpoint `/api/analytics/data`
- Uses Payload's component string reference pattern: `'payload-posthog-analytics/components/AnalyticsView#AnalyticsView'`

### Testing

Uses Jest + MSW for API mocking. Test files are co-located with source (`*.test.ts`).

- `test/mocks/server.ts` - MSW server setup
- `test/mocks/posthog-data.ts` - Mock PostHog responses
- `test/setup.ts` - Jest setup with MSW handlers

Tests use fake timers for date-dependent logic:
```typescript
jest.useFakeTimers()
jest.setSystemTime(new Date('2024-01-15T12:00:00Z'))
```

### Environment Variables

```
POSTHOG_PROJECT_ID  - Required
POSTHOG_API_KEY     - Required (Personal API Key, not public token)
POSTHOG_API_HOST    - Optional (defaults to https://app.posthog.com)
```
