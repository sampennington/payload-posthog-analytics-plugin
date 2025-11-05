export interface PostHogTrendResponse {
  result: PostHogTrendResult[]
  next?: string
  timezone?: string
  is_cached?: boolean
}

export interface PostHogTrendResult {
  action?: {
    id: string
    name: string
    type: string
  }
  label: string
  count: number
  data: number[]
  labels: string[]
  days: string[]
  breakdown_value?: string
  aggregated_value?: number
}

export interface PostHogEventsResponse {
  results: PostHogEvent[]
  next?: string
}

export interface PostHogEvent {
  id: string
  distinct_id: string
  properties: Record<string, unknown>
  event: string
  timestamp: string
  person?: {
    id: string
    distinct_ids: string[]
    properties: Record<string, unknown>
  }
  elements?: PostHogElement[]
  count?: number
  distinct_id_count?: number
}

export interface PostHogElement {
  tag_name: string
  text?: string
  href?: string
  attr_class?: string[]
  attr_id?: string
  nth_child?: number
  nth_of_type?: number
  attributes: Record<string, string>
}

export interface TimePeriodData {
  date: string
  visitors: number
}

export interface PageData {
  page: string
  visitors: number
  pageViews: number
  [key: string]: string | number
}

export interface SourceData {
  source: string
  visitors: number
  [key: string]: string | number
}

export interface EventData {
  event: string
  count: number
  uniqueUsers: number
  [key: string]: string | number
}

export interface StatsData {
  visitors: { value: number; change: number | null }
  pageViews: { value: number; change: number | null }
}

export interface PostHogData {
  stats: StatsData
  timeseries: TimePeriodData[]
  pages: PageData[]
  sources: SourceData[]
  events: EventData[]
}

// ============================================================================
// API Request Types
// ============================================================================

export interface DateRange {
  dateFrom: string
  dateTo: string
}

export interface TrendQuery {
  events: Array<{ id: string; math?: string }>
  dateFrom: string
  dateTo: string
  interval?: 'hour' | 'day' | 'week' | 'month'
  breakdown?: string
}

export type TimePeriod = 'day' | '7d' | '30d' | '12mo'

// ============================================================================
// Configuration Types
// ============================================================================

export interface PostHogConfig {
  apiKey: string
  projectId: string
  apiHost: string
}
