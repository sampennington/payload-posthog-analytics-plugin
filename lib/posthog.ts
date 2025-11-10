import { createPostHogClient } from './posthog-api-client'
import type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
  PostHogTrendResult,
  PostHogEvent,
} from './posthog.types'
import {
  getDateRange,
  getPreviousPeriodRange,
  calculateChange,
  parseTimeseries,
  getTotalVisitors,
  extractAggregatedValue,
} from './utils'

export type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
}


export async function getPostHogData(period: TimePeriod = '7d'): Promise<PostHogData | null> {
  const client = createPostHogClient()

  if (!client) {
    return null
  }

  const dateRange = getDateRange(period)
  const previousRange = getPreviousPeriodRange(period)

  try {
    const interval = period === 'day' ? 'hour' : period === '12mo' ? 'month' : 'day'

    const [
      visitorsData,
      pageViewsData,
      topPagesData,
      sourcesData,
      eventsData,
      previousVisitorsData,
      previousPageViewsData,
    ] = await Promise.all([
      client.getVisitorsTrend(dateRange, interval),
      client.getPageviewsTotal(dateRange),
      client.getTopPages(dateRange),
      client.getTrafficSources(dateRange),
      client.getEvents(),
      client.getVisitorsTrend(previousRange, interval),
      client.getPageviewsTotal(previousRange),
    ])

    const timeseries = parseTimeseries(visitorsData)
    const totalVisitors = getTotalVisitors(timeseries)
    const totalPageviews = extractAggregatedValue(pageViewsData)

    const previousTimeseries = parseTimeseries(previousVisitorsData)
    const previousTotalVisitors = getTotalVisitors(previousTimeseries)
    const previousTotalPageviews = extractAggregatedValue(previousPageViewsData)

    const stats: StatsData = {
      visitors: {
        value: totalVisitors,
        change: calculateChange(totalVisitors, previousTotalVisitors),
      },
      pageViews: {
        value: totalPageviews,
        change: calculateChange(totalPageviews, previousTotalPageviews),
      },
    }

    const pages: PageData[] =
      topPagesData?.result?.slice(0, 10).map((item: PostHogTrendResult) => {
        let page = item.breakdown_value || 'Unknown'
        try {
          const url = new URL(page)
          page = url.pathname || '/'
        } catch {
          // If it's not a valid URL, keep as is
        }
        return {
          page,
          visitors: item.count || 0,
          pageViews: item.count || 0,
        }
      }) || []

    const sources: SourceData[] =
      sourcesData?.result?.slice(0, 10).map((item: PostHogTrendResult) => ({
        source: item.breakdown_value || 'Direct',
        visitors: item.count || 0,
      })) || []

    const events: EventData[] =
      eventsData?.results?.slice(0, 10).map((item: PostHogEvent) => ({
        event: item.event || 'Unknown',
        count: item.count || 0,
        uniqueUsers: item.distinct_id_count || 0,
      })) || []

    return {
      stats,
      timeseries,
      pages,
      sources,
      events,
    }
  } catch (e) {
    console.error('Error fetching PostHog data:', e)
    return null
  }
}
