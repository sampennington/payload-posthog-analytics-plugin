import type {
  PostHogConfig,
  DateRange,
  TrendQuery,
  PostHogTrendResponse,
  PostHogEventsResponse,
} from './posthog.types'

export function createPostHogConfig(): PostHogConfig {
  const apiKey = process.env.POSTHOG_API_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiHost = process.env.POSTHOG_API_HOST || 'https://app.posthog.com'

  if (!apiKey || !projectId) {
    throw new Error('PostHog not configured. Please add POSTHOG_API_KEY and POSTHOG_PROJECT_ID to your .env file.')
  }

  return {
    apiKey,
    projectId,
    apiHost,
  }
}

function createHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}


export function createPostHogClient(providedConfig?: PostHogConfig | null) {
  const config = providedConfig ?? createPostHogConfig()

  async function getTrend(query: TrendQuery): Promise<PostHogTrendResponse | null> {
    const apiQuery = {
      events: query.events,
      date_from: query.dateFrom,
      date_to: query.dateTo,
      interval: query.interval,
      breakdown: query.breakdown,
    }

    const response = await fetch(
      `${config.apiHost}/api/projects/${config.projectId}/insights/trend/`,
      {
        method: 'POST',
        headers: createHeaders(config.apiKey),
        body: JSON.stringify(apiQuery),
        ...(typeof (globalThis as any).EdgeRuntime !== 'undefined' && { next: { revalidate: 300 } }),
      },
    )

    if (!response.ok) {
      console.error(`PostHog API error (trend): ${response.status} ${response.statusText}`)
      return null
    }

    return response.json() as Promise<PostHogTrendResponse>
  }

  async function getVisitorsTrend(
    dateRange: DateRange,
    interval: 'hour' | 'day' | 'week' | 'month',
  ): Promise<PostHogTrendResponse | null> {
    return getTrend({
      events: [{ id: '$pageview', math: 'dau' }],
      ...dateRange,
      interval,
    })
  }

  async function getPageviewsTotal(dateRange: DateRange): Promise<PostHogTrendResponse | null> {
    return getTrend({
      events: [{ id: '$pageview', math: 'total' }],
      ...dateRange,
    })
  }

  async function getTopPages(dateRange: DateRange): Promise<PostHogTrendResponse | null> {
    return getTrend({
      events: [{ id: '$pageview' }],
      breakdown: '$current_url',
      ...dateRange,
    })
  }

  async function getTrafficSources(dateRange: DateRange): Promise<PostHogTrendResponse | null> {
    return getTrend({
      events: [{ id: '$pageview' }],
      breakdown: '$referrer',
      ...dateRange,
    })
  }

  async function getEvents(): Promise<PostHogEventsResponse | null> {
    const response = await fetch(
      `${config.apiHost}/api/projects/${config.projectId}/events/`,
      {
        method: 'GET',
        headers: createHeaders(config.apiKey),
      },
    )

    if (!response.ok) {
      console.error(`PostHog API error (events): ${response.status} ${response.statusText}`)
      return null
    }

    return response.json() as Promise<PostHogEventsResponse>
  }

  return {
    getTrend,
    getVisitorsTrend,
    getPageviewsTotal,
    getTopPages,
    getTrafficSources,
    getEvents,
  }
}
