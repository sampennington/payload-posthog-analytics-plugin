export interface AnalyticsPluginOptions {
  /**
   * Enable or disable the analytics plugin
   * @default true
   */
  enabled?: boolean

  /**
   * PostHog configuration
   * If not provided, will read from environment variables:
   * - POSTHOG_PROJECT_ID
   * - POSTHOG_API_KEY
   * - POSTHOG_API_HOST (optional, defaults to https://app.posthog.com)
   */
  posthog?: {
    projectId?: string
    apiKey?: string
    apiHost?: string
  }

  /**
   * Admin view configuration
   */
  adminView?: {
    /**
     * Path where the analytics view will be accessible
     * @default '/analytics'
     */
    path?: string
    /**
     * Label shown in the admin UI
     * @default 'Analytics'
     */
    label?: string
    /**
     * Require authentication to view analytics
     * @default true
     */
    requireAuth?: boolean
  }

  /**
   * Reverse proxy configuration for bypassing ad blockers
   * Note: This only provides the rewrite rules. You still need to add them
   * to your next.config.js using the exported getAnalyticsRewrites() helper.
   */
  reverseProxy?: {
    /**
     * Enable reverse proxy configuration
     * @default true
     */
    enabled?: boolean
    /**
     * Path for the ingest proxy
     * @default '/ingest'
     */
    ingestPath?: string
  }
}
