# Usage Examples

## Basic Usage (Recommended)

Create a client once and call methods on it - no need to pass config around:

```typescript
import { createPostHogClient } from './lib/posthog-api-client'

// Create client - automatically uses environment variables
const client = createPostHogClient()

if (!client) {
  throw new Error('Failed to create PostHog client')
}

const dateRange = {
  dateFrom: '2024-01-01',
  dateTo: '2024-01-07',
}

// Call methods on the client - clean and simple!
const topPages = await client.getTopPages(dateRange)
const visitors = await client.getVisitorsTrend(dateRange, 'day')
const events = await client.getEvents()
```

## Advanced Usage (Custom Config)

Override the default config by passing a custom config to `createPostHogClient`:

```typescript
import { createPostHogClient } from './lib/posthog-api-client'

// Create a custom config
const customConfig = {
  apiKey: 'custom-api-key',
  projectId: 'custom-project',
  apiHost: 'https://eu.posthog.com',
}

// Create client with custom config
const client = createPostHogClient(customConfig)!

const dateRange = {
  dateFrom: '2024-01-01',
  dateTo: '2024-01-07',
}

// Use client normally
const topPages = await client.getTopPages(dateRange)
```

## Multiple Clients

You can create multiple clients with different configs:

```typescript
import { createPostHogClient } from './lib/posthog-api-client'

// Production client
const prodClient = createPostHogClient({
  apiKey: process.env.PROD_POSTHOG_KEY!,
  projectId: process.env.PROD_PROJECT_ID!,
  apiHost: 'https://app.posthog.com',
})

// EU client
const euClient = createPostHogClient({
  apiKey: process.env.EU_POSTHOG_KEY!,
  projectId: process.env.EU_PROJECT_ID!,
  apiHost: 'https://eu.posthog.com',
})

// Use different clients for different regions
const prodData = await prodClient?.getTopPages(dateRange)
const euData = await euClient?.getTopPages(dateRange)
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
POSTHOG_API_KEY=your_personal_api_key
POSTHOG_PROJECT_ID=your_project_id
POSTHOG_API_HOST=https://app.posthog.com  # Optional, defaults to this
```

## How It Works

The client factory pattern provides:

- ✅ **No config passing** - Create once, use everywhere
- ✅ **Type-safe** - All methods are properly typed
- ✅ **Closure-based** - Config is captured and reused
- ✅ **Multiple instances** - Create different clients for different configs
- ✅ **Clean API** - Just `client.getEvents()` instead of `getEvents(config)`
