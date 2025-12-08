import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
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

  describe('custom dashboard configuration', () => {
    describe('custom cards', () => {
      it('should render only configured cards', async () => {
        const customConfig = {
          cards: [
            { key: 'visitors', title: 'Custom Visitors Title' },
          ],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Custom Visitors Title')).toBeInTheDocument()
        expect(screen.queryByText('Page Views')).not.toBeInTheDocument()
      })

      it('should render no cards when empty array provided', async () => {
        const customConfig = {
          cards: [],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      })
    })

    describe('custom charts', () => {
      it('should render configured charts', async () => {
        const customConfig = {
          charts: [
            {
              id: 'custom-chart',
              title: 'My Custom Chart',
              type: 'line' as const,
              dataKey: 'visitors',
            },
          ],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('My Custom Chart')).toBeInTheDocument()
      })

      it('should render no charts when empty array provided', async () => {
        const customConfig = {
          charts: [],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.queryByText('Visitors Over Time')).not.toBeInTheDocument()
      })
    })

    describe('custom tables', () => {
      it('should render only configured tables', async () => {
        const customConfig = {
          tables: [
            {
              id: 'pages-only',
              title: 'My Pages',
              dataKey: 'pages' as const,
              columns: [
                { key: 'page', label: 'Page Path' },
              ],
            },
          ],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('My Pages')).toBeInTheDocument()
        expect(screen.queryByText('Top Sources')).not.toBeInTheDocument()
      })

      it('should render no tables when empty array provided', async () => {
        const customConfig = {
          tables: [],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.queryByText('Top Pages')).not.toBeInTheDocument()
        expect(screen.queryByText('Top Sources')).not.toBeInTheDocument()
        expect(screen.queryByText('Custom Events')).not.toBeInTheDocument()
      })
    })

    describe('custom render functions', () => {
      it('should use custom renderCards function', async () => {
        const customConfig = {
          renderCards: () => <div>Custom Cards Section</div>,
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Custom Cards Section')).toBeInTheDocument()
        expect(screen.queryByText('Overview')).not.toBeInTheDocument()
      })

      it('should use custom renderCharts function', async () => {
        const customConfig = {
          renderCharts: () => <div>Custom Charts Section</div>,
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Custom Charts Section')).toBeInTheDocument()
        expect(screen.queryByText('Visitors Over Time')).not.toBeInTheDocument()
      })

      it('should use custom renderTables function', async () => {
        const customConfig = {
          renderTables: () => <div>Custom Tables Section</div>,
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Custom Tables Section')).toBeInTheDocument()
        // The custom render replaces all tables
        const tableWrap = document.querySelector('.table-wrap')
        expect(tableWrap).not.toBeInTheDocument()
      })
    })

    describe('custom sections', () => {
      it('should render custom section at top position', async () => {
        const customConfig = {
          customSections: [
            {
              position: 'top' as const,
              Component: () => <div>Top Custom Section</div>,
            },
          ],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Top Custom Section')).toBeInTheDocument()
      })

      it('should render custom section after cards', async () => {
        const customConfig = {
          customSections: [
            {
              position: 'afterCards' as const,
              Component: () => <div>After Cards Section</div>,
            },
          ],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('After Cards Section')).toBeInTheDocument()
      })

      it('should render multiple custom sections', async () => {
        const customConfig = {
          customSections: [
            {
              position: 'top' as const,
              Component: () => <div>Section 1</div>,
            },
            {
              position: 'bottom' as const,
              Component: () => <div>Section 2</div>,
            },
          ],
        }

        render(<AnalyticsDashboard dashboardConfig={customConfig} />)

        await waitFor(() => {
          expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('Section 1')).toBeInTheDocument()
        expect(screen.getByText('Section 2')).toBeInTheDocument()
      })
    })
  })
})
