import type { TimePeriod, PostHogData } from './lib/posthog.types'
import type React from 'react'

/**
 * Configuration for a stat card
 */
export interface CardConfig {
  /**
   * Key to identify the card and pull data from stats
   */
  key: string
  /**
   * Display title for the card
   */
  title: string
  /**
   * Optional formatter for the value
   */
  formatter?: (value: number) => string
  /**
   * Whether positive change is good (affects color)
   * @default true
   */
  positiveIsGood?: boolean
}

/**
 * Configuration for a chart
 */
export interface ChartConfig {
  /**
   * Unique identifier for the chart
   */
  id: string
  /**
   * Chart title
   */
  title: string
  /**
   * Chart type
   */
  type: 'area' | 'line' | 'bar'
  /**
   * Key in the timeseries data to plot
   */
  dataKey: string
  /**
   * Chart color (hex or CSS color)
   * @default '#10b981'
   */
  color?: string
  /**
   * Whether to apply gradient fill (only for area charts)
   * @default true for area, false for others
   */
  gradient?: boolean
  /**
   * Chart height in pixels
   * @default 250
   */
  height?: number
  /**
   * Optional formatter for Y-axis values
   */
  formatter?: (value: number) => string
}

/**
 * Configuration for a data table
 */
export interface TableConfig {
  /**
   * Unique identifier for the table
   */
  id: string
  /**
   * Table title
   */
  title: string
  /**
   * Key in PostHogData to get rows from
   */
  dataKey: 'pages' | 'sources' | 'events'
  /**
   * Column definitions
   */
  columns: Array<{
    key: string
    label: string
    formatter?: (value: any) => string
  }>
}

/**
 * Dashboard customization options
 */
export interface DashboardConfig {
  /**
   * Configure which stat cards to show
   * If not provided, shows default cards (visitors, pageViews)
   */
  cards?: CardConfig[]

  /**
   * Configure which charts to show
   * If not provided, shows default visitor chart
   */
  charts?: ChartConfig[]

  /**
   * Configure which tables to show
   * If not provided, shows all default tables (pages, sources, events)
   */
  tables?: TableConfig[]

  /**
   * Custom render functions to completely replace entire sections
   */
  renderCards?: (data: PostHogData, period: TimePeriod) => React.ReactNode
  renderCharts?: (data: PostHogData, period: TimePeriod) => React.ReactNode
  renderTables?: (data: PostHogData, period: TimePeriod) => React.ReactNode

  /**
   * Custom sections to add at specific positions
   */
  customSections?: Array<{
    position: 'top' | 'afterCards' | 'afterCharts' | 'bottom'
    Component: React.ComponentType<{ data: PostHogData; period: TimePeriod }>
  }>
}

export interface AnalyticsPluginOptions {
  /**
   * Enable or disable the analytics plugin
   * @default true
   */
  enabled?: boolean

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

  /**
   * Dashboard customization
   * Configure cards, charts, tables, and custom components
   */
  dashboard?: DashboardConfig
}
