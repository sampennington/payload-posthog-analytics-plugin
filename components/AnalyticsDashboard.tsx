'use client'

import React, { useState } from 'react'
import { TimePeriod, type PostHogData, type StatsData } from '../lib/posthog.types'
import { SelectInput } from '@payloadcms/ui'
import { AnalyticsCard } from './AnalyticsCard'
import { Table } from './Table'
import { ChartRenderer } from './ChartRenderer'
import { formatNumber } from '../lib/utils'
import { useAnalytics } from '../lib/use-analytics'
import type { CardConfig, ChartConfig, TableConfig, DashboardConfig } from '../types'

export interface AnalyticsDashboardProps {
  dashboardConfig?: DashboardConfig
}

const defaultCards: CardConfig[] = [
  { key: 'visitors', title: 'Visitors', formatter: formatNumber, positiveIsGood: true },
  { key: 'pageViews', title: 'Page Views', formatter: formatNumber, positiveIsGood: true },
]

const defaultCharts: ChartConfig[] = [
  {
    id: 'visitors-over-time',
    title: 'Visitors Over Time',
    type: 'area',
    dataKey: 'visitors',
    color: '#10b981',
    gradient: true,
    height: 250,
    formatter: formatNumber,
  },
]

const defaultTables: TableConfig[] = [
  {
    id: 'top-pages',
    title: 'Top Pages',
    dataKey: 'pages',
    columns: [
      { key: 'page', label: 'Page' },
      { key: 'visitors', label: 'Visitors', formatter: formatNumber },
      { key: 'pageViews', label: 'Pageviews', formatter: formatNumber },
    ],
  },
  {
    id: 'top-sources',
    title: 'Top Sources',
    dataKey: 'sources',
    columns: [
      { key: 'source', label: 'Source' },
      { key: 'visitors', label: 'Visitors', formatter: formatNumber },
    ],
  },
  {
    id: 'custom-events',
    title: 'Custom Events',
    dataKey: 'events',
    columns: [
      { key: 'event', label: 'Event' },
      { key: 'uniqueUsers', label: 'Unique Users', formatter: formatNumber },
      { key: 'count', label: 'Total Events', formatter: formatNumber },
    ],
  },
]

interface SectionProps {
  data: PostHogData
  period: TimePeriod
  dashboardConfig?: DashboardConfig
}

const CardsSection: React.FC<SectionProps> = ({ data, period, dashboardConfig }) => {
  const cardsConfig = dashboardConfig?.cards ?? defaultCards

  if (dashboardConfig?.renderCards) {
    return <>{dashboardConfig.renderCards(data, period)}</>
  }

  if (cardsConfig.length === 0) return null

  return (
    <div className="dashboard__group">
      <h2 className="dashboard__label">Overview</h2>
      <ul className="dashboard__card-list" style={{ marginBottom: '2rem' }}>
        {cardsConfig.map((cardConfig) => {
          const statValue = (data.stats as any)[cardConfig.key]
          if (!statValue) return null

          return (
            <AnalyticsCard
              key={cardConfig.key}
              title={cardConfig.title}
              value={statValue.value}
              change={statValue.change}
              formatter={cardConfig.formatter}
              positiveIsGood={cardConfig.positiveIsGood}
            />
          )
        })}
      </ul>
    </div>
  )
}

const ChartsSection: React.FC<SectionProps> = ({ data, period, dashboardConfig }) => {
  const chartsConfig = dashboardConfig?.charts ?? defaultCharts

  if (dashboardConfig?.renderCharts) {
    return <>{dashboardConfig.renderCharts(data, period)}</>
  }

  if (chartsConfig.length === 0) return null

  return (
    <>
      {chartsConfig.map((chartConfig) => (
        <ChartRenderer
          key={chartConfig.id}
          config={chartConfig}
          data={data.timeseries}
          period={period}
        />
      ))}
    </>
  )
}

const TablesSection: React.FC<SectionProps> = ({ data, period, dashboardConfig }) => {
  const tablesConfig = dashboardConfig?.tables ?? defaultTables

  if (dashboardConfig?.renderTables) {
    return <>{dashboardConfig.renderTables(data, period)}</>
  }

  if (tablesConfig.length === 0) return null

  return (
    <div className="dashboard__group">
      {tablesConfig.map((tableConfig) => {
        const tableData = data[tableConfig.dataKey]
        if (!tableData || tableData.length === 0) return null

        return (
          <Table<any>
            key={tableConfig.id}
            title={tableConfig.title}
            columns={tableConfig.columns}
            rows={tableData}
          />
        )
      })}
    </div>
  )
}

interface CustomSectionsProps {
  position: 'top' | 'afterCards' | 'afterCharts' | 'bottom'
  data: PostHogData
  period: TimePeriod
  dashboardConfig?: DashboardConfig
}

const CustomSections: React.FC<CustomSectionsProps> = ({ position, data, period, dashboardConfig }) => {
  const sections = dashboardConfig?.customSections?.filter((section) => section.position === position) ?? []

  return (
    <>
      {sections.map((section, index) => (
        <section.Component key={`${position}-${index}`} data={data} period={period} />
      ))}
    </>
  )
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ dashboardConfig }) => {
  const [period, setPeriod] = useState<TimePeriod>('7d')
  const { loading, data, error } = useAnalytics({ period })

  if (loading) {
    return <div>Loading analytics...</div>
  }

  if (error || !data) {
    return <div>{error || 'Unable to load analytics data'}</div>
  }

  const options = [
    { value: 'day', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '12mo', label: 'Last 12 months' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__group" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        <SelectInput
          name={'time-select'}
          path={'time-select'}
          label={'Time Period:'}
          options={options}
          value={period}
          onChange={(option) => !Array.isArray(option) && setPeriod(option.value as TimePeriod)}
        />
      </div>

      <CustomSections position="top" data={data} period={period} dashboardConfig={dashboardConfig} />
      <CardsSection data={data} period={period} dashboardConfig={dashboardConfig} />
      <CustomSections position="afterCards" data={data} period={period} dashboardConfig={dashboardConfig} />
      <ChartsSection data={data} period={period} dashboardConfig={dashboardConfig} />
      <CustomSections position="afterCharts" data={data} period={period} dashboardConfig={dashboardConfig} />
      <TablesSection data={data} period={period} dashboardConfig={dashboardConfig} />
      <CustomSections position="bottom" data={data} period={period} dashboardConfig={dashboardConfig} />
    </div>
  )
}
