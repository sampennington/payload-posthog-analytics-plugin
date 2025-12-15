'use client'

import React from 'react'
import type { PostHogData, TimePeriod } from '../lib/posthog.types'
import type { ChartConfig, DashboardConfig } from '../types'
import { ChartRenderer } from './ChartRenderer'
import { formatNumber } from '../lib/utils'

export const defaultCharts: ChartConfig[] = [
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

interface ChartsSectionProps {
  data: PostHogData
  period: TimePeriod
  dashboardConfig?: DashboardConfig
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ data, period, dashboardConfig }) => {
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
