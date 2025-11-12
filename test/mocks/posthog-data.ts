import { http, HttpResponse } from 'msw'
import type { PostHogTrendResponse, PostHogEventsResponse, PostHogData } from '../../lib/posthog.types'

const API_HOST = 'https://app.posthog.com'
const PROJECT_ID = 'test-project-123'

export const mockTrendResponse: PostHogTrendResponse = {
  result: [
    {
      label: '$pageview',
      count: 1500,
      data: [100, 150, 200, 250, 300, 250, 250],
      labels: [
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
        '2024-01-06',
        '2024-01-07',
      ],
      days: [
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
        '2024-01-06',
        '2024-01-07',
      ],
    },
  ],
}

export const mockTopPagesResponse: PostHogTrendResponse = {
  result: [
    {
      label: 'https://example.com/',
      count: 500,
      breakdown_value: 'https://example.com/',
      data: [50, 60, 70, 80, 90, 75, 75],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
      days: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
    },
    {
      label: 'https://example.com/about',
      count: 300,
      breakdown_value: 'https://example.com/about',
      data: [30, 35, 40, 45, 50, 50, 50],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
      days: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
    },
    {
      label: 'https://example.com/contact',
      count: 200,
      breakdown_value: 'https://example.com/contact',
      data: [20, 25, 30, 35, 40, 25, 25],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
      days: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
    },
  ],
}

export const mockTrafficSourcesResponse: PostHogTrendResponse = {
  result: [
    {
      label: 'https://google.com',
      count: 600,
      breakdown_value: 'https://google.com',
      data: [60, 70, 80, 90, 100, 100, 100],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
      days: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
    },
    {
      label: 'Direct',
      count: 400,
      breakdown_value: '',
      data: [40, 50, 60, 70, 80, 50, 50],
      labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
      days: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
    },
  ],
}

export const mockEventsResponse: PostHogEventsResponse = {
  results: [
    {
      id: '1',
      distinct_id: 'user-1',
      properties: {},
      event: 'button_click',
      timestamp: '2024-01-01T00:00:00Z',
      count: 450,
      distinct_id_count: 120,
    },
    {
      id: '2',
      distinct_id: 'user-2',
      properties: {},
      event: 'form_submit',
      timestamp: '2024-01-01T00:00:00Z',
      count: 230,
      distinct_id_count: 85,
    },
    {
      id: '3',
      distinct_id: 'user-3',
      properties: {},
      event: 'video_play',
      timestamp: '2024-01-01T00:00:00Z',
      count: 180,
      distinct_id_count: 65,
    },
  ],
}

export const mockAnalyticsData: PostHogData = {
  stats: {
    visitors: {
      value: 1500,
      change: 15.5,
    },
    pageViews: {
      value: 2500,
      change: 20.3,
    },
  },
  timeseries: [
    { date: '2024-01-01', visitors: 100 },
    { date: '2024-01-02', visitors: 150 },
    { date: '2024-01-03', visitors: 200 },
    { date: '2024-01-04', visitors: 250 },
    { date: '2024-01-05', visitors: 300 },
    { date: '2024-01-06', visitors: 250 },
    { date: '2024-01-07', visitors: 250 },
  ],
  pages: [
    { page: '/', visitors: 500, pageViews: 800 },
    { page: '/about', visitors: 300, pageViews: 450 },
    { page: '/contact', visitors: 200, pageViews: 250 },
  ],
  sources: [
    { source: 'google.com', visitors: 600 },
    { source: 'Direct', visitors: 400 },
  ],
  events: [
    { event: 'button_click', count: 450, uniqueUsers: 120 },
    { event: 'form_submit', count: 230, uniqueUsers: 85 },
    { event: 'video_play', count: 180, uniqueUsers: 65 },
  ],
}

export const handlers = [
  http.post(`${API_HOST}/api/projects/${PROJECT_ID}/insights/trend/`, async ({ request }) => {
    const body = await request.json() as any

    if (body.breakdown === '$current_url') {
      return HttpResponse.json(mockTopPagesResponse)
    }

    if (body.breakdown === '$referrer') {
      return HttpResponse.json(mockTrafficSourcesResponse)
    }

    return HttpResponse.json(mockTrendResponse)
  }),

  http.get(`${API_HOST}/api/projects/${PROJECT_ID}/events/`, () => {
    return HttpResponse.json(mockEventsResponse)
  }),

  http.get('/api/analytics/data', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period')

    // Simulate different data for different periods
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
]
