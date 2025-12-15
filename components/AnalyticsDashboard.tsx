'use client'

import React, { useState } from 'react'
import { TimePeriod } from '../lib/posthog.types'
import { SelectInput } from '@payloadcms/ui'
import { useAnalytics } from '../lib/use-analytics'
import type { DashboardConfig } from '../types'
import { CardsSection } from './CardsSection'
import { ChartsSection } from './ChartsSection'
import { TablesSection } from './TablesSection'
import { CustomSections } from './CustomSections'

export interface AnalyticsDashboardProps {
  dashboardConfig?: DashboardConfig
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
