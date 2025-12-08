import type { AdminViewConfig, Config, Plugin } from 'payload'
import { analyticsDataEndpoint } from './endpoints/data'

// Re-export all types
export type {
  AnalyticsPluginOptions,
  DashboardConfig,
  CardConfig,
  ChartConfig,
  TableConfig,
} from './types'

export type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
} from './lib/posthog.types'

// Re-export reusable components for custom dashboards
export { AnalyticsCard } from './components/AnalyticsCard'
export { Table } from './components/Table'
export { ChartRenderer } from './components/ChartRenderer'
export { useAnalytics } from './lib/use-analytics'
export { formatNumber } from './lib/utils'

import type { AnalyticsPluginOptions } from './types'

// Module-level storage for dashboard config
let dashboardConfig: AnalyticsPluginOptions['dashboard'] | undefined

/**
 * Get the current dashboard configuration
 * This is used by the AnalyticsDashboard component
 */
export const getDashboardConfig = () => dashboardConfig

/**
 * PostHog Analytics Plugin for Payload CMS
 *
 * Adds an analytics dashboard to your Payload admin panel with PostHog integration.
 *
 * @example
 * ```ts
 * import { analyticsPlugin } from 'payload-posthog-analytics'
 *
 * export default buildConfig({
 *   plugins: [
 *     analyticsPlugin({
 *       adminView: {
 *         path: '/analytics',
 *         label: 'Analytics',
 *       },
 *       dashboard: {
 *         cards: [
 *           { key: 'visitors', title: 'Unique Visitors' },
 *           { key: 'pageViews', title: 'Page Views' },
 *         ],
 *         charts: [
 *           {
 *             id: 'visitors-chart',
 *             title: 'Visitor Trends',
 *             type: 'area',
 *             dataKey: 'visitors',
 *             color: '#10b981',
 *           },
 *         ],
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export const analyticsPlugin = (
  pluginOptions: AnalyticsPluginOptions = {},
): Plugin => {
  return (incomingConfig: Config): Config => {
    const options: Required<Omit<AnalyticsPluginOptions, 'dashboard'>> & Pick<AnalyticsPluginOptions, 'dashboard'> = {
      enabled: pluginOptions.enabled ?? true,
      posthog: pluginOptions.posthog ?? {},
      adminView: {
        path: pluginOptions.adminView?.path ?? '/analytics',
        label: pluginOptions.adminView?.label ?? 'Analytics',
        requireAuth: pluginOptions.adminView?.requireAuth ?? true,
      },
      reverseProxy: {
        enabled: pluginOptions.reverseProxy?.enabled ?? true,
        ingestPath: pluginOptions.reverseProxy?.ingestPath ?? '/ingest',
      },
      dashboard: pluginOptions.dashboard,
    }

    if (!options.enabled) {
      return incomingConfig
    }

    // Store dashboard config for access by client components
    dashboardConfig = options.dashboard

    const config = { ...incomingConfig }

    config.admin = {
      ...config.admin,
      components: {
        ...config.admin?.components,
        views: {
          ...config.admin?.components?.views,
          [(options.adminView.label || "").toLowerCase()]: {
            Component: '@/plugins/analytics/components/AnalyticsView#AnalyticsView',
            path: options.adminView.path,
          } as AdminViewConfig,
        },
      },
    }

    config.endpoints = [
      ...(config.endpoints || []),
      analyticsDataEndpoint,
    ]

    return config
  }
}

/**
 * Helper function to generate Next.js rewrites for PostHog reverse proxy
 * This helps bypass ad blockers by proxying PostHog requests through your domain.
 *
 * Add this to your next.config.js:
 *
 * @example
 * ```js
 * import { getAnalyticsRewrites } from './src/plugins/analytics'
 *
 * const nextConfig = {
 *   async rewrites() {
 *     return [
 *       ...getAnalyticsRewrites(),
 *       // your other rewrites
 *     ]
 *   },
 * }
 * ```
 */
export const getAnalyticsRewrites = (options?: {
  ingestPath?: string
  posthogHost?: string
  posthogAssetsHost?: string
}) => {
  const ingestPath = options?.ingestPath || '/ingest'
  const posthogHost = options?.posthogHost || 'https://us.i.posthog.com'
  const posthogAssetsHost = options?.posthogAssetsHost || 'https://us-assets.i.posthog.com'

  return [
    {
      source: `${ingestPath}/static/:path*`,
      destination: `${posthogAssetsHost}/static/:path*`,
    },
    {
      source: `${ingestPath}/:path*`,
      destination: `${posthogHost}/:path*`,
    },
  ]
}
