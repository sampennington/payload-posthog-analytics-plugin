/**
 * PostHog API Client
 *
 * A clean wrapper around PostHog's REST API for querying analytics data.
 * Note: The posthog-node SDK doesn't support analytics queries, only event capture.
 */

import type {
  PostHogConfig,
  DateRange,
  TrendQuery,
  PostHogTrendResponse,
  PostHogEventsResponse,
} from './posthog.types'

export class PostHogAPIClient {
  private config: PostHogConfig

  constructor(config: PostHogConfig) {
    this.config = config
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Fetch trend data (timeseries) from PostHog
   */
  async getTrend(query: TrendQuery): Promise<PostHogTrendResponse | null> {
    const apiQuery = {
      events: query.events,
      date_from: query.dateFrom,
      date_to: query.dateTo,
      interval: query.interval,
      breakdown: query.breakdown,
    }

    const response = await fetch(
      `${this.config.apiHost}/api/projects/${this.config.projectId}/insights/trend/`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(apiQuery),
        next: { revalidate: 300 },
      },
    )

    if (!response.ok) {
      console.error(`PostHog API error (trend): ${response.status} ${response.statusText}`)
      return null
    }

    return response.json() as Promise<PostHogTrendResponse>
  }

  /**
   * Fetch unique visitors over time (Daily Active Users)
   */
  async getVisitorsTrend(
    dateRange: DateRange,
    interval: 'hour' | 'day' | 'week' | 'month',
  ): Promise<PostHogTrendResponse | null> {
    return this.getTrend({
      events: [{ id: '$pageview', math: 'dau' }],
      ...dateRange,
      interval,
    })
  }

  /**
   * Fetch total pageview count
   */
  async getPageviewsTotal(dateRange: DateRange): Promise<PostHogTrendResponse | null> {
    return this.getTrend({
      events: [{ id: '$pageview', math: 'total' }],
      ...dateRange,
    })
  }

  /**
   * Fetch top pages breakdown
   */
  async getTopPages(dateRange: DateRange): Promise<PostHogTrendResponse | null> {
    return this.getTrend({
      events: [{ id: '$pageview' }],
      breakdown: '$current_url',
      ...dateRange,
    })
  }

  /**
   * Fetch traffic sources breakdown
   */
  async getTrafficSources(dateRange: DateRange): Promise<PostHogTrendResponse | null> {
    return this.getTrend({
      events: [{ id: '$pageview' }],
      breakdown: '$referrer',
      ...dateRange,
    })
  }

  /**
   * Fetch custom events
   */
  async getEvents(): Promise<PostHogEventsResponse | null> {
    const response = await fetch(
      `${this.config.apiHost}/api/projects/${this.config.projectId}/events/`,
      {
        method: 'GET',
        headers: this.headers,
        next: { revalidate: 300 },
      },
    )

    if (!response.ok) {
      console.error(`PostHog API error (events): ${response.status} ${response.statusText}`)
      return null
    }

    return response.json() as Promise<PostHogEventsResponse>
  }
}

/**
 * Create a PostHog API client instance
 */
export function createPostHogAPIClient(): PostHogAPIClient | null {
  const apiKey = process.env.POSTHOG_API_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiHost = process.env.POSTHOG_API_HOST || 'https://app.posthog.com'

  if (!apiKey || !projectId) {
    console.error(
      'PostHog not configured. Please add POSTHOG_API_KEY and POSTHOG_PROJECT_ID to your .env file.',
    )
    return null
  }

  return new PostHogAPIClient({
    apiKey,
    projectId,
    apiHost,
  })
}
