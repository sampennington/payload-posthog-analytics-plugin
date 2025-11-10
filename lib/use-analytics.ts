'use client'

import { useEffect, useState } from 'react'
import { TimePeriod, PostHogData } from './posthog.types'

interface UseAnalyticsOptions {
  period?: TimePeriod
  autoFetch?: boolean
}

interface UseAnalyticsResult {
  data: PostHogData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsResult => {
  const { period = '7d', autoFetch = true } = options

  const [data, setData] = useState<PostHogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/analytics/data?period=${period}`)

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [period, autoFetch])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
