import type { AdminViewConfig, Config, Plugin } from 'payload'
import { analyticsDataEndpoint } from './endpoints/data'

// Inline types to avoid import issues with Node.js ESM
export interface AnalyticsPluginOptions {
  enabled?: boolean
  posthog?: {
    projectId?: string
    apiKey?: string
    apiHost?: string
  }
  adminView?: {
    path?: string
    label?: string
    requireAuth?: boolean
  }
  reverseProxy?: {
    enabled?: boolean
    ingestPath?: string
  }
}

// Re-export types from lib (this is a type-only export, so it's safe)
export type {
  TimePeriodData,
  PageData,
  SourceData,
  EventData,
  StatsData,
  PostHogData,
  TimePeriod,
} from './lib/posthog.types'

/**
 * PostHog Analytics Plugin for Payload CMS
 *
 * Adds an analytics dashboard to your Payload admin panel with PostHog integration.
 *
 * @example
 * ```ts
 * import { analyticsPlugin } from '@/plugins/analytics'
 *
 * export default buildConfig({
 *   plugins: [
 *     analyticsPlugin({
 *       adminView: {
 *         path: '/analytics',
 *         label: 'Analytics',
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
    const options: Required<AnalyticsPluginOptions> = {
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
    }

    if (!options.enabled) {
      return incomingConfig
    }

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
