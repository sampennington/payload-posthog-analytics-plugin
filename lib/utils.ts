import { TimePeriod, DateRange, PostHogTrendResponse, TimePeriodData } from "./posthog.types"

export function getDateRange(period: TimePeriod): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let dateFrom: Date

  switch (period) {
    case 'day':
      dateFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '12mo':
      dateFrom = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
      break
    default:
      dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: now.toISOString(),
  }
}

export function getPreviousPeriodRange(period: TimePeriod): DateRange {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let currentFrom: Date
  let previousFrom: Date

  switch (period) {
    case 'day':
      currentFrom = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      previousFrom = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
      break
    case '7d':
      currentFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      previousFrom = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      currentFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      previousFrom = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
      break
    case '12mo':
      currentFrom = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
      previousFrom = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate())
      break
    default:
      currentFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      previousFrom = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  }

  return {
    dateFrom: previousFrom.toISOString(),
    dateTo: currentFrom.toISOString(),
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function calculateChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null
  }
  return ((current - previous) / previous) * 100
}

export function formatChange(change: number | null): { text: string; isPositive: boolean } {
  if (change === null || change === 0) {
    return { text: '0%', isPositive: false }
  }

  const isPositive = change > 0
  const text = `${isPositive ? '+' : ''}${Math.round(change)}%`
  return { text, isPositive }
}

export function parseTimeseries(trendData: PostHogTrendResponse | null): TimePeriodData[] {
  if (!trendData?.result?.[0]?.data) {
    return []
  }

  return trendData.result[0].data.map((value: number, index: number) => ({
    date: trendData.result[0].labels[index],
    visitors: value,
  }))
}

export function getTotalVisitors(timeseries: TimePeriodData[]): number {
  return timeseries.reduce((sum, item) => sum + item.visitors, 0)
}

export function extractAggregatedValue(trendData: PostHogTrendResponse | null): number {
  return trendData?.result?.[0]?.aggregated_value || trendData?.result?.[0]?.count || 0
}
