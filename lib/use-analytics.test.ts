import { renderHook, waitFor } from '@testing-library/react'
import { useAnalytics } from './use-analytics'
import { mockAnalyticsData } from '../test/mocks/posthog-data'
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('useAnalytics', () => {
  describe('initial fetch', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should fetch data on mount with default period', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockAnalyticsData)
      expect(result.current.error).toBeNull()
    })

    it('should fetch data with custom period', async () => {
      const { result } = renderHook(() => useAnalytics({ period: '30d' }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data?.stats.visitors.value).toBe(4500)
      expect(result.current.data?.stats.pageViews.value).toBe(7500)
      expect(result.current.error).toBeNull()
    })
  })

  describe('autoFetch option', () => {
    it('should not fetch when autoFetch is false', async () => {
      const { result } = renderHook(() => useAnalytics({ autoFetch: false }))

      // Wait a bit to ensure no fetch happens
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should fetch when refetch is called manually', async () => {
      const { result } = renderHook(() => useAnalytics({ autoFetch: false }))

      expect(result.current.data).toBeNull()

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockAnalyticsData)
      expect(result.current.error).toBeNull()
    })
  })

  describe('period changes', () => {
    it('should refetch when period changes', async () => {
      const { result, rerender } = renderHook(
        ({ period }: { period: '7d' | '30d' }) => useAnalytics({ period }),
        { initialProps: { period: '7d' } },
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data?.stats.visitors.value).toBe(1500)

      rerender({ period: '30d' })

      await waitFor(() => {
        expect(result.current.data?.stats.visitors.value).toBe(4500)
      })
    })
  })

  describe('error handling', () => {
    it('should handle API errors', async () => {
      server.use(
        http.get('/api/analytics/data', () => {
          return new HttpResponse(null, { status: 500 })
        }),
      )

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toBe('Failed to fetch analytics data')
    })

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/analytics/data', () => {
          return HttpResponse.error()
        }),
      )

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeTruthy()
    })

    it('should clear error on successful refetch', async () => {
      server.use(
        http.get('/api/analytics/data', () => {
          return new HttpResponse(null, { status: 500 })
        }),
      )

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      server.resetHandlers()

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toEqual(mockAnalyticsData)
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('refetch function', () => {
    it('should refetch data when called', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const firstData = result.current.data

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(firstData)
    })

    it('should complete refetch successfully', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialData = result.current.data

      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.data).toEqual(initialData)
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('data structure', () => {
    it('should have correct number of timeseries data points', async () => {
      const { result } = renderHook(() => useAnalytics({ period: '7d' }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data?.timeseries).toHaveLength(7)
    })

    it('should have top pages data', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data?.pages.length).toBeGreaterThan(0)
      expect(result.current.data?.pages[0].page).toBe('/')
      expect(result.current.data?.pages[0].visitors).toBe(500)
    })

    it('should have traffic sources data', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data?.sources.length).toBeGreaterThan(0)
      expect(result.current.data?.sources[0].source).toBe('google.com')
      expect(result.current.data?.sources[0].visitors).toBe(600)
    })

    it('should have custom events data', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data?.events.length).toBeGreaterThan(0)
      expect(result.current.data?.events[0].event).toBe('button_click')
      expect(result.current.data?.events[0].count).toBe(450)
      expect(result.current.data?.events[0].uniqueUsers).toBe(120)
    })
  })
})
