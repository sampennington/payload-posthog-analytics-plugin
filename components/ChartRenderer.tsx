'use client'

import React from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
  LineChart,
  Bar,
  BarChart,
} from 'recharts'
import { formatAxisDate, formatTooltipDate } from './utils'
import { formatNumber } from '../lib/utils'
import type { ChartConfig } from '../types'
import type { TimePeriod, TimePeriodData } from '../lib/posthog.types'

interface ChartRendererProps {
  config: ChartConfig
  data: TimePeriodData[]
  period: TimePeriod
}

/**
 * Generic chart renderer that can render area, line, and bar charts
 * based on configuration
 */
export const ChartRenderer: React.FC<ChartRendererProps> = ({ config, data, period }) => {
  const {
    id,
    title,
    type,
    dataKey,
    color = '#10b981',
    gradient = type === 'area',
    height = 250,
    formatter = formatNumber,
  } = config

  const gradientId = `gradient-${id}`

  const commonProps = {
    data,
    margin: { top: 0, right: 0, left: -40, bottom: 0 },
  }

  const commonAxisProps = {
    stroke: 'var(--theme-elevation-500)',
    style: { fontSize: '0.75rem' },
    tick: { fill: 'var(--theme-elevation-600)' },
  }

  const xAxisProps = {
    dataKey: 'date',
    tickFormatter: (value: string, index: number) =>
      formatAxisDate(value, period, index, data.length),
    interval: 'preserveStartEnd' as const,
    ...commonAxisProps,
  }

  const yAxisProps = {
    tickFormatter: formatter,
    ...commonAxisProps,
  }

  const tooltipProps = {
    contentStyle: {
      backgroundColor: 'var(--theme-elevation-50)',
      border: '1px solid var(--theme-elevation-150)',
      borderRadius: '4px',
      color: 'var(--theme-text-dark)',
      padding: '8px 12px',
      fontSize: '0.875rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    labelStyle: {
      color: 'var(--theme-text-light)',
      marginBottom: '4px',
    },
    itemStyle: {
      color: 'var(--theme-text-dark)',
    },
    labelFormatter: (value: string) => formatTooltipDate(value, period),
    formatter: (value: number) => [`${formatter(value)}`],
    separator: '',
  }

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
            )}
            <CartesianGrid strokeDasharray="5 5" stroke="var(--theme-elevation-200)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={gradient ? `url(#${gradientId})` : color}
            />
          </AreaChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="5 5" stroke="var(--theme-elevation-200)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="5 5" stroke="var(--theme-elevation-200)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        )

      default:
        return <div>Unsupported chart type: {type}</div>
    }
  }

  return (
    <div className="dashboard__group" style={{ margin: '0 0 2rem' }}>
      <h3 style={{ marginBottom: '2rem' }}>{title}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      ) : (
        <p>No data available for this period</p>
      )}
    </div>
  )
}
