# payload-posthog-analytics

A comprehensive analytics dashboard plugin for Payload CMS with PostHog integration. Adds a beautiful analytics view to your Payload admin panel with visitor stats, page views, traffic sources, and custom events.

## Features

- **Analytics Dashboard**: Beautiful admin view with charts and tables
- **PostHog Integration**: Fetch data from PostHog API
- **Reverse Proxy Support**: Bypass ad blockers by proxying PostHog requests
- **Time Period Selection**: View data for last 24 hours, 7 days, 30 days, or 12 months
- **Metrics Tracking**:
  - Unique visitors (Daily Active Users)
  - Page views
  - Top pages
  - Traffic sources
  - Custom events
- **Visual Charts**: Line charts showing visitor trends over time
- **Data Tables**: Sortable tables for pages, sources, and events

## Installation

```bash
npm install payload-posthog-analytics
# or
pnpm add payload-posthog-analytics
# or
yarn add payload-posthog-analytics
```

## Setup

### 1. Configure Environment Variables

Add these variables to your `.env` file:

```env
POSTHOG_PROJECT_ID=your_project_id
POSTHOG_API_KEY=your_personal_api_key
POSTHOG_API_HOST=https://app.posthog.com  # Optional, defaults to this value
```

**Note:** You need a PostHog **Personal API Key** (not the public token) to fetch analytics data. Get it from PostHog Settings → Personal API Keys.

### 2. Add Plugin to Payload Config

In your `payload.config.ts`:

```typescript
import { analyticsPlugin } from 'payload-posthog-analytics'

export default buildConfig({
  plugins: [
    analyticsPlugin({
      adminView: {
        path: '/analytics',
        label: 'Analytics',
      },
    }),
    // ... other plugins
  ],
})
```

### 3. Configure Next.js Rewrites (Optional but Recommended)

To bypass ad blockers, add the reverse proxy to your `next.config.js`:

```javascript
import { getAnalyticsRewrites } from 'payload-posthog-analytics'

const nextConfig = {
  async rewrites() {
    return getAnalyticsRewrites()
  },
}

export default nextConfig
```

### 4. Regenerate Import Map

After adding the plugin, regenerate your Payload import map:

```bash
pnpm payload generate:importmap
```

## Usage

Once configured, navigate to `/admin/analytics` in your Payload admin panel to view your analytics dashboard.

## Plugin Options

```typescript
interface AnalyticsPluginOptions {
  enabled?: boolean // Enable/disable plugin (default: true)

  posthog?: {
    projectId?: string
    apiKey?: string
    apiHost?: string // Default: https://app.posthog.com
  }

  adminView?: {
    path?: string        // Default: /analytics
    label?: string       // Default: Analytics
    requireAuth?: boolean // Default: true
  }

  reverseProxy?: {
    enabled?: boolean     // Default: true
    ingestPath?: string   // Default: /ingest
  }
}
```

### Example with Custom Options

```typescript
analyticsPlugin({
  enabled: process.env.NODE_ENV === 'production',
  posthog: {
    projectId: process.env.POSTHOG_PROJECT_ID,
    apiKey: process.env.POSTHOG_API_KEY,
    apiHost: 'https://eu.posthog.com', // EU region
  },
  adminView: {
    path: '/dashboard/analytics',
    label: 'Site Analytics',
  },
  reverseProxy: {
    ingestPath: '/ph',
  },
})
```

## API

The plugin automatically adds a REST endpoint to your Payload app:

```
GET /api/analytics/data?period=7d
```

**Query Parameters:**
- `period`: `day` | `7d` | `30d` | `12mo`

**Response:**
```json
{
  "stats": {
    "visitors": { "value": 1234, "change": null },
    "pageViews": { "value": 5678, "change": null }
  },
  "timeseries": [
    { "date": "2024-10-21T00:00:00Z", "visitors": 123 }
  ],
  "pages": [...],
  "sources": [...],
  "events": [...]
}
```

## TypeScript

This package includes TypeScript definitions. Import types like this:

```typescript
import type {
  AnalyticsPluginOptions,
  PostHogData,
  TimePeriod
} from 'payload-posthog-analytics'
```

## Requirements

- Payload CMS ^3.0.0
- React ^18.0.0 or ^19.0.0
- PostHog account with Personal API Key

## Troubleshooting

### Analytics not showing
- Verify your `POSTHOG_API_KEY` and `POSTHOG_PROJECT_ID` are correct
- Check browser console for errors
- Ensure you're using a **Personal API Key**, not the public project key

### Ad blockers blocking requests
- Make sure you've configured the reverse proxy in `next.config.js`
- Test with ad blocker disabled to confirm

### Import errors
- Run `pnpm payload generate:importmap` after installation
- Restart your dev server

## Contributing

Contributions are welcome! Please open an issue or pull request.

## License

MIT

## Credits

Built for Payload CMS with ❤️
