'use client'

import React from 'react'
import type { PostHogData, TimePeriod } from '../lib/posthog.types'
import type { CardConfig, DashboardConfig } from '../types'
import { AnalyticsCard } from './AnalyticsCard'
import { formatNumber } from '../lib/utils'

export const defaultCards: CardConfig[] = [
  { key: 'visitors', title: 'Visitors', formatter: formatNumber, positiveIsGood: true },
  { key: 'pageViews', title: 'Page Views', formatter: formatNumber, positiveIsGood: true },
]

interface CardsSectionProps {
  data: PostHogData
  period: TimePeriod
  dashboardConfig?: DashboardConfig
}

export const CardsSection: React.FC<CardsSectionProps> = ({ data, period, dashboardConfig }) => {
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
