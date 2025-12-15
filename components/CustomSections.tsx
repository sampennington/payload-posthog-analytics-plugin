'use client'

import React from 'react'
import type { PostHogData, TimePeriod } from '../lib/posthog.types'
import type { DashboardConfig } from '../types'

interface CustomSectionsProps {
  position: 'top' | 'afterCards' | 'afterCharts' | 'bottom'
  data: PostHogData
  period: TimePeriod
  dashboardConfig?: DashboardConfig
}

export const CustomSections: React.FC<CustomSectionsProps> = ({
  position,
  data,
  period,
  dashboardConfig,
}) => {
  const sections = dashboardConfig?.customSections?.filter((section) => section.position === position) ?? []

  return (
    <>
      {sections.map((section, index) => (
        <section.Component key={`${position}-${index}`} data={data} period={period} />
      ))}
    </>
  )
}
