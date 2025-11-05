'use client'

import React, { useState } from 'react'
import {
  type PageData,
  type SourceData,
  type EventData,
  TimePeriod,
} from '../lib/posthog.types'
import { SelectInput } from '@payloadcms/ui'
import { AnalyticsCard } from './AnalyticsCard'
import { Table } from './Table'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { formatAxisDate, formatTooltipDate } from './utils'
import { formatNumber } from '../lib/utils'
import { useAnalytics } from '../lib/use-analytics'


export const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('7d')

  const {loading, data, error } = useAnalytics({ period })

  if (loading) {
    return <div>Loading analytics...</div>
  }

  if (error || !data) {
    return <div>{error || 'Unable to load analytics data'}</div>
  }

  const { stats, timeseries, pages, sources, events } = data

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
          onChange={(option) => !Array.isArray(option) && setPeriod((option).value as TimePeriod)}
        />
      </div>
      <div className="dashboard__group">
        <h2 className="dashboard__label">Overview</h2>
        <ul className="dashboard__card-list" style={{ marginBottom: '2rem' }}>
          <AnalyticsCard
            title={'Visitors'}
            value={stats.visitors.value}
            change={stats.visitors.change}
            formatter={formatNumber}
            positiveIsGood={true}
          />
          <AnalyticsCard
            title={'Page Views'}
            value={stats.pageViews.value}
            change={stats.pageViews.change}
            formatter={formatNumber}
            positiveIsGood={true}
          />
        </ul>
      </div>

      <div className="dashboard__group" style={{ margin: '0 0 2rem' }}>
        <h3 style={{ marginBottom: '2rem' }}>Visitors Over Time</h3>
        {timeseries.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeseries} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="var(--theme-elevation-200)" />
              <XAxis
                dataKey="date"
                tickFormatter={(value, index) =>
                  formatAxisDate(value, period, index, timeseries.length)
                }
                tick={{ fill: 'var(--theme-elevation-600)' }}
                stroke="var(--theme-elevation-500)"
                style={{ fontSize: '0.75rem' }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--theme-elevation-500)"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: 'var(--theme-elevation-600)' }}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--theme-elevation-50)',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: '4px',
                  color: 'var(--theme-text-dark)',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{
                  color: 'var(--theme-text-light)',
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: 'var(--theme-text-dark)',
                }}
                labelFormatter={(value) => formatTooltipDate(value, period)}
                formatter={(value: number) => [`${formatNumber(value)} visitors`]}
                separator=""
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitors)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p>No data available for this period</p>
        )}
      </div>

      <div className="dashboard__group">
        {pages.length > 0 && (
          <Table<PageData>
            title="Top Pages"
            columns={[
              { key: 'page', label: 'Page' },
              { key: 'visitors', label: 'Visitors', formatter: formatNumber },
              { key: 'pageViews', label: 'Pageviews', formatter: formatNumber },
            ]}
            rows={pages}
          />
        )}
        {sources.length > 0 && (
          <Table<SourceData>
            title="Top Sources"
            columns={[
              { key: 'source', label: 'Source' },
              { key: 'visitors', label: 'Visitors', formatter: formatNumber },
            ]}
            rows={sources}
          />
        )}
        {events && events.length > 0 && (
          <Table<EventData>
            title="Custom Events"
            columns={[
              { key: 'event', label: 'Event' },
              { key: 'uniqueUsers', label: 'Unique Users', formatter: formatNumber },
              { key: 'count', label: 'Total Events', formatter: formatNumber },
            ]}
            rows={events}
          />
        )}
      </div>
    </div>
  )
}
