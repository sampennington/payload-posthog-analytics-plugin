# PostHog API Client

A TypeScript client for fetching analytics data from PostHog's API. This client can be used standalone in any Next.js application.

## Features

- 🔒 Server-side only (keeps API keys secure)
- 📊 Fetch trends, pageviews, traffic sources, and custom events
- ⚡ Built-in Next.js caching support
- 🎯 Type-safe with TypeScript
- 🧪 Fully tested

## Installation

Copy the following files into your project:

```
lib/
├── posthog-api-client.ts
└── posthog.types.ts
```

## Configuration

### Environment Variables

Add your PostHog credentials to `.env.local`:

```bash
POSTHOG_PROJECT_ID=your_project_id
POSTHOG_API_KEY=your_personal_api_key
```

**Finding your credentials:**
- Project ID: PostHog Settings → Project → Project ID
- API Key: PostHog Settings → Personal API Keys → Create new key

### Create Client Instance

```typescript
import { createPostHogClient } from './lib/posthog-api-client'

const client = createPostHogClient({
  apiKey: process.env.POSTHOG_API_KEY!,
  projectId: process.env.POSTHOG_PROJECT_ID!,
})
```

⚠️ **Security Note**: Only use this client in server-side code (API routes, Server Components, etc). Never expose API keys to the browser.

## API Reference

### `getTrend(query)`

Fetch trend data for any PostHog event.

**Parameters:**
```typescript
{
  eventName: string        // Event to track (e.g., '$pageview')
  dateFrom: string         // ISO date string
  dateTo: string          // ISO date string
  interval?: 'day' | 'week' | 'month'  // Default: 'day'
  properties?: Array<{    // Optional filters
    key: string
    value: string | string[]
    operator: 'exact' | 'is_not' | 'contains'
    type: 'event' | 'person'
  }>
}
```

**Example:**
```typescript
const pageviews = await client.getTrend({
  eventName: '$pageview',
  dateFrom: '2024-01-01T00:00:00.000Z',
  dateTo: '2024-01-07T23:59:59.999Z',
  interval: 'day',
})

console.log(pageviews)
// {
//   result: [{
//     label: '$pageview',
//     count: 1500,
//     data: [100, 150, 200, ...],
//     days: ['2024-01-01', '2024-01-02', ...],
//     labels: ['2024-01-01', '2024-01-02', ...]
//   }]
// }
```

### `getPageViews(dateFrom, dateTo)`

Get pageview counts broken down by URL path.

**Example:**
```typescript
const pages = await client.getPageViews(
  '2024-01-01T00:00:00.000Z',
  '2024-01-08T00:00:00.000Z'
)

console.log(pages)
// {
//   result: [{
//     label: '/about',
//     count: 245,
//     breakdown_value: '/about'
//   }, ...]
// }
```

### `getTrafficSources(dateFrom, dateTo)`

Get visitor counts by referrer domain.

**Example:**
```typescript
const sources = await client.getTrafficSources(
  '2024-01-01T00:00:00.000Z',
  '2024-01-08T00:00:00.000Z'
)

console.log(sources)
// {
//   result: [{
//     label: 'google.com',
//     count: 456,
//     breakdown_value: 'google.com'
//   }, {
//     label: 'Direct / None',
//     count: 234,
//     breakdown_value: null
//   }, ...]
// }
```

**Note**: Direct traffic (no referrer) appears as `null` in `breakdown_value` and "Direct / None" in `label`.

### `getCustomEvents(eventName, dateFrom, dateTo)`

Track custom events like button clicks, form submissions, etc.

**Example:**
```typescript
const buttonClicks = await client.getCustomEvents(
  'button_click',
  '2024-01-01T00:00:00.000Z',
  '2024-01-08T00:00:00.000Z'
)

console.log(buttonClicks)
// {
//   result: [{
//     label: 'button_click',
//     count: 89,
//     aggregated_value: 72  // Unique users who triggered event
//   }]
// }
```

## Usage Examples

### Basic Analytics Dashboard

```typescript
// app/api/analytics/route.ts
import { NextResponse } from 'next/server'
import { createPostHogClient } from '@/lib/posthog-api-client'

export async function GET() {
  const client = createPostHogClient({
    apiKey: process.env.POSTHOG_API_KEY!,
    projectId: process.env.POSTHOG_PROJECT_ID!,
  })

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [pageviews, pages, sources] = await Promise.all([
    client.getTrend({
      eventName: '$pageview',
      dateFrom: weekAgo.toISOString(),
      dateTo: now.toISOString(),
    }),
    client.getPageViews(weekAgo.toISOString(), now.toISOString()),
    client.getTrafficSources(weekAgo.toISOString(), now.toISOString()),
  ])

  return NextResponse.json({
    pageviews,
    pages,
    sources,
  })
}
```

### Filtering Events by Properties

```typescript
// Get pageviews only from blog posts
const blogPageviews = await client.getTrend({
  eventName: '$pageview',
  dateFrom: '2024-01-01T00:00:00.000Z',
  dateTo: '2024-01-08T00:00:00.000Z',
  properties: [
    {
      key: '$current_url',
      value: '/blog',
      operator: 'contains',
      type: 'event',
    },
  ],
})
```

### Tracking Multiple Custom Events

```typescript
const events = await Promise.all([
  client.getCustomEvents('cta_click', dateFrom, dateTo),
  client.getCustomEvents('form_submit', dateFrom, dateTo),
  client.getCustomEvents('video_play', dateFrom, dateTo),
])

const analytics = events.map((event) => ({
  name: event.result[0]?.label,
  totalEvents: event.result[0]?.count || 0,
  uniqueUsers: event.result[0]?.aggregated_value || 0,
}))
```

### Server Component Usage (Next.js 13+)

```typescript
// app/dashboard/page.tsx
import { createPostHogClient } from '@/lib/posthog-api-client'

export default async function DashboardPage() {
  const client = createPostHogClient({
    apiKey: process.env.POSTHOG_API_KEY!,
    projectId: process.env.POSTHOG_PROJECT_ID!,
  })

  const pages = await client.getPageViews(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  )

  return (
    <div>
      <h1>Top Pages</h1>
      <ul>
        {pages.result.map((page) => (
          <li key={page.breakdown_value}>
            {page.label}: {page.count} views
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Response Types

All methods return typed responses. See `posthog.types.ts` for complete type definitions.

### PostHogTrendResponse
```typescript
{
  result: [{
    label: string              // Event name
    count: number              // Total count
    data: number[]             // Values per interval
    days: string[]             // Date labels
    labels: string[]           // Formatted labels
    aggregated_value?: number  // For unique counts
  }]
}
```

### PostHogBreakdownResponse
```typescript
{
  result: [{
    label: string                    // Display label
    count: number                    // Total count
    breakdown_value: string | null   // Raw value (null for direct traffic)
  }]
}
```

## Caching

The client automatically caches responses for 5 minutes using Next.js's `fetch` cache:

```typescript
{
  next: { revalidate: 300 }  // 5 minutes
}
```

To disable caching for a specific request, modify the fetch options in the client code.

## Error Handling

```typescript
try {
  const data = await client.getTrend({ ... })
} catch (error) {
  if (error instanceof Error) {
    console.error('PostHog API error:', error.message)
  }
  // Handle error appropriately
}
```

**Common errors:**
- `401`: Invalid API key
- `404`: Project not found
- `429`: Rate limit exceeded
- `500`: PostHog server error

## Date Handling

Always use ISO 8601 format for dates:

```typescript
// ✅ Correct
const dateFrom = new Date('2024-01-01').toISOString()
// "2024-01-01T00:00:00.000Z"

// ❌ Incorrect
const dateFrom = '2024-01-01'  // May cause timezone issues
```

**Helper for date ranges:**

```typescript
function getLast7Days() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    dateFrom: weekAgo.toISOString(),
    dateTo: now.toISOString(),
  }
}
```

## TypeScript Support

Import types for full type safety:

```typescript
import type {
  PostHogConfig,
  PostHogTrendQuery,
  PostHogTrendResponse,
  PostHogBreakdownResponse,
} from './lib/posthog.types'

const config: PostHogConfig = {
  apiKey: process.env.POSTHOG_API_KEY!,
  projectId: process.env.POSTHOG_PROJECT_ID!,
}

const query: PostHogTrendQuery = {
  eventName: '$pageview',
  dateFrom: '2024-01-01T00:00:00.000Z',
  dateTo: '2024-01-08T00:00:00.000Z',
}
```

## Limitations

- **Server-side only**: Cannot be used in browser/client components
- **Rate limits**: PostHog API has rate limits (check your plan)
- **Next.js specific**: Uses Next.js fetch extensions (remove `next` property for other frameworks)
- **No streaming**: All data fetched at once (use pagination for large datasets)

## Testing

The client is fully tested with MSW (Mock Service Worker). See `lib/__tests__/posthog-api-client.test.ts` for examples.

## Related Files

- `posthog-api-client.ts` - Main client implementation
- `posthog.types.ts` - TypeScript type definitions
- `posthog.ts` - Higher-level data transformation utilities

## License

ISC
