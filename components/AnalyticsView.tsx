import React from 'react'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, type StepNavItem, SetStepNav } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'

export const AnalyticsView: React.FC<AdminViewServerProps> = ({
  initPageResult,
  params,
  searchParams,
}) => {
  if (!initPageResult.req.user) {
    return <p>You must be logged in to view this page.</p>
  }

  const steps: StepNavItem[] = [
    {
      url: '/analytics',
      label: 'Analytics',
    },
  ]

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <SetStepNav nav={steps} />
      <Gutter>
        <h1 style={{ margin: '1rem 0 2rem' }}>Analytics Dashboard</h1>
        <AnalyticsDashboard />
      </Gutter>
    </DefaultTemplate>
  )
}

export default AnalyticsView
