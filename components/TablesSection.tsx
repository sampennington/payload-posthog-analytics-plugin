'use client'

import React from 'react'
import type { PostHogData, TimePeriod } from '../lib/posthog.types'
import type { TableConfig, DashboardConfig } from '../types'
import { Table } from './Table'
import { formatNumber } from '../lib/utils'

export const defaultTables: TableConfig[] = [
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

interface TablesSectionProps {
  data: PostHogData
  period: TimePeriod
  dashboardConfig?: DashboardConfig
}

export const TablesSection: React.FC<TablesSectionProps> = ({ data, period, dashboardConfig }) => {
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
