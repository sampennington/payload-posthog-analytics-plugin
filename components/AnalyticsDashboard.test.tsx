import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { mockAnalyticsData } from '../test/mocks/posthog-data'
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('AnalyticsDashboard', () => {
  describe('empty data', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/analytics/data', () => {
          return HttpResponse.json({
            ...mockAnalyticsData,
            pages: [],
            sources: [],
            events: [],
          })
        }),
      )
    })

    it('should hide tables when data is empty', async () => {
      render(<AnalyticsDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
      })

      expect(screen.queryByText('/')).not.toBeInTheDocument()
      expect(screen.queryByText('google.com')).not.toBeInTheDocument()
      expect(screen.queryByText('button_click')).not.toBeInTheDocument()
    })

    it('should show message when timeseries is empty', async () => {
      server.use(
        http.get('/api/analytics/data', () => {
          return HttpResponse.json({
            ...mockAnalyticsData,
            timeseries: [],
          })
        }),
      )

      render(<AnalyticsDashboard />)

      await waitFor(() => {
        expect(screen.getByText('No data available for this period')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should display error message when API fails', async () => {
      server.use(
        http.get('/api/analytics/data', () => {
          return new HttpResponse(null, { status: 500 })
        }),
      )

      render(<AnalyticsDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch analytics data')).toBeInTheDocument()
      })

      expect(screen.queryByText('/')).not.toBeInTheDocument()
      expect(screen.queryByText('google.com')).not.toBeInTheDocument()
    })
  })

  describe('fetches correct data', () => {
    it('should display all data from API response', async () => {
      render(<AnalyticsDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
      })

      // Stats changes
      expect(screen.getByText('+16% from previous period')).toBeInTheDocument()
      expect(screen.getByText('+20% from previous period')).toBeInTheDocument()

      // Pages
      expect(screen.getByText('/')).toBeInTheDocument()
      expect(screen.getByText('/about')).toBeInTheDocument()
      expect(screen.getByText('/contact')).toBeInTheDocument()

      // Sources
      expect(screen.getByText('google.com')).toBeInTheDocument()
      expect(screen.getByText('Direct')).toBeInTheDocument()

      // Events
      expect(screen.getByText('button_click')).toBeInTheDocument()
      expect(screen.getByText('form_submit')).toBeInTheDocument()
      expect(screen.getByText('video_play')).toBeInTheDocument()
    })

    it('should fetch data with correct period parameter', async () => {
      let requestUrl = ''

      server.use(
        http.get('/api/analytics/data', ({ request }) => {
          requestUrl = request.url
          return HttpResponse.json(mockAnalyticsData)
        }),
      )

      render(<AnalyticsDashboard />)

      await waitFor(() => {
        expect(requestUrl).toContain('period=7d')
      })
    })
  })

  describe('different time periods', () => {
    it('should display data for default 7d period', async () => {
      server.use(
        http.get('/api/analytics/data', ({ request }) => {
          const url = new URL(request.url)
          const period = url.searchParams.get('period')

          if (period === '30d') {
            return HttpResponse.json({
              ...mockAnalyticsData,
              stats: {
                visitors: { value: 4500, change: 12.3 },
                pageViews: { value: 7500, change: 18.7 },
              },
            })
          }

          return HttpResponse.json(mockAnalyticsData)
        }),
      )

      render(<AnalyticsDashboard />)

      await waitFor(() => {
        expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
      })

      expect(screen.getByText('+16% from previous period')).toBeInTheDocument()
    })
  })
})
