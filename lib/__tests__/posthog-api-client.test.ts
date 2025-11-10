import {
  createPostHogClient,
} from '../posthog-api-client'
import type { PostHogConfig } from '../posthog.types'
import {
  mockTrendResponse,
  mockTopPagesResponse,
  mockTrafficSourcesResponse,
  mockEventsResponse,
} from './mocks/posthog-data'

const testConfig: PostHogConfig = {
  apiKey: 'test-api-key',
  projectId: 'test-project-123',
  apiHost: 'https://app.posthog.com',
}

const testDateRange = {
  dateFrom: '2024-01-01',
  dateTo: '2024-01-07',
}

const client = createPostHogClient(testConfig)!

describe('PostHog API Client', () => {
  describe('getTrend', () => {
    it('should fetch trend data successfully', async () => {

      const result = await client.getTrend({
        events: [{ id: '$pageview', math: 'dau' }],
        ...testDateRange,
        interval: 'day',
      })

      expect(result).toEqual(mockTrendResponse)
      expect(result?.result).toHaveLength(1)
      expect(result?.result[0].count).toBe(1500)
    })

    it('should include all query parameters', async () => {
      const query = {
        events: [{ id: '$pageview', math: 'total' }],
        dateFrom: '2024-01-01',
        dateTo: '2024-01-07',
        interval: 'day' as const,
        breakdown: '$current_url',
      }

      const result = await client.getTrend(query)

      expect(result).toBeDefined()
      expect(result).toEqual(mockTopPagesResponse)
    })
  })

  describe('getVisitorsTrend', () => {
    it('should fetch visitors trend data', async () => {
      const result = await client.getVisitorsTrend(testDateRange, 'day')

      expect(result).toEqual(mockTrendResponse)
      expect(result?.result[0].label).toBe('$pageview')
    })

    it('should support different intervals', async () => {
      const client = createPostHogClient(testConfig)!
      const intervals: Array<'hour' | 'day' | 'week' | 'month'> = ['hour', 'day', 'week', 'month']

      for (const interval of intervals) {
        const result = await client.getVisitorsTrend(testDateRange, interval)
        expect(result).toBeDefined()
      }
    })
  })

  describe('getPageviewsTotal', () => {
    it('should fetch total pageviews', async () => {
      const result = await client.getPageviewsTotal(testDateRange)

      expect(result).toEqual(mockTrendResponse)
      expect(result?.result[0].count).toBe(1500)
    })
  })

  describe('getTopPages', () => {
    it('should fetch top pages with breakdown', async () => {
      const result = await client.getTopPages(testDateRange)

      expect(result).toEqual(mockTopPagesResponse)
      expect(result?.result).toHaveLength(3)
      expect(result?.result[0].breakdown_value).toBe('https://example.com/')
      expect(result?.result[0].count).toBe(500)
    })

    it('should return pages in order by count', async () => {
      const result = await client.getTopPages(testDateRange)

      expect(result?.result[0].count).toBeGreaterThanOrEqual(result?.result[1].count!)
      expect(result?.result[1].count).toBeGreaterThanOrEqual(result?.result[2].count!)
    })
  })

  describe('getTrafficSources', () => {
    it('should fetch traffic sources with breakdown', async () => {
      const result = await client.getTrafficSources(testDateRange)

      expect(result).toEqual(mockTrafficSourcesResponse)
      expect(result?.result).toHaveLength(2)
      expect(result?.result[0].breakdown_value).toBe('https://google.com')
    })

    it('should handle direct traffic (empty breakdown)', async () => {
      const result = await client.getTrafficSources(testDateRange)

      const directTraffic = result?.result.find((r) => r.breakdown_value === '')
      expect(directTraffic).toBeDefined()
      expect(directTraffic?.label).toBe('Direct')
    })
  })

  describe('getEvents', () => {
    it('should fetch custom events', async () => {
      const result = await client.getEvents()

      expect(result).toEqual(mockEventsResponse)
      expect(result?.results).toHaveLength(3)
    })

    it('should include event counts and unique users', async () => {
      const result = await client.getEvents()

      const firstEvent = result?.results[0]
      expect(firstEvent?.event).toBe('button_click')
      expect(firstEvent?.count).toBe(450)
      expect(firstEvent?.distinct_id_count).toBe(120)
    })
  })
})
