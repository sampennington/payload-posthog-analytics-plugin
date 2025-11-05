import { formatChange } from '../lib/utils'
import React from 'react'

interface AnalyticsCardProps {
  title: string
  value:  number
  change?: number | null
  formatter?: (value: number) => string
  positiveIsGood?: boolean
}

export const AnalyticsCard = ({ title, value, change, positiveIsGood, formatter }: AnalyticsCardProps) => {
  const formattedValue = formatter ? formatter(value) : value
  const changeData = formatChange(change || null)
  const isPositive = positiveIsGood ? changeData.isPositive : !changeData.isPositive

  return (
    <li>
      <div className="card" style={{ flexDirection: 'column' }}>
        <h3 className="card__title">{title}</h3>
        <div style={{ fontSize: '2rem' }}>{formattedValue}</div>
        {change !== undefined && (
          <div style={{ color: isPositive ? 'green' : 'red' }}>
            {changeData.text} from previous period
          </div>
        )}
      </div>
    </li>
  )
}
