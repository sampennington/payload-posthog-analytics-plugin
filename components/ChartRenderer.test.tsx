import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChartRenderer } from './ChartRenderer'
import type { ChartConfig } from '../types'
import type { TimePeriodData } from '../lib/posthog.types'

describe('ChartRenderer', () => {
  const mockData: TimePeriodData[] = [
    { date: '2024-01-01', visitors: 100 },
    { date: '2024-01-02', visitors: 150 },
    { date: '2024-01-03', visitors: 200 },
  ]

  describe('Area Chart', () => {
    it('renders area chart with default configuration', () => {
      const config: ChartConfig = {
        id: 'test-area',
        title: 'Test Area Chart',
        type: 'area',
        dataKey: 'visitors',
      }

      const { container } = render(<ChartRenderer config={config} data={mockData} period="7d" />)

      expect(screen.getByText('Test Area Chart')).toBeInTheDocument()
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    })

    it('renders area chart with custom configuration', () => {
      const config: ChartConfig = {
        id: 'custom-area',
        title: 'Custom Area',
        type: 'area',
        dataKey: 'visitors',
        color: '#ff0000',
        gradient: true,
        height: 300,
        formatter: (val) => `${val}K`,
      }

      render(<ChartRenderer config={config} data={mockData} period="30d" />)

      expect(screen.getByText('Custom Area')).toBeInTheDocument()
    })
  })

  describe('Line Chart', () => {
    it('renders line chart', () => {
      const config: ChartConfig = {
        id: 'test-line',
        title: 'Test Line Chart',
        type: 'line',
        dataKey: 'visitors',
        color: '#3b82f6',
      }

      render(<ChartRenderer config={config} data={mockData} period="7d" />)

      expect(screen.getByText('Test Line Chart')).toBeInTheDocument()
    })
  })

  describe('Bar Chart', () => {
    it('renders bar chart', () => {
      const config: ChartConfig = {
        id: 'test-bar',
        title: 'Test Bar Chart',
        type: 'bar',
        dataKey: 'visitors',
        color: '#8b5cf6',
      }

      render(<ChartRenderer config={config} data={mockData} period="7d" />)

      expect(screen.getByText('Test Bar Chart')).toBeInTheDocument()
    })
  })

  describe('Empty Data', () => {
    it('shows message when no data available', () => {
      const config: ChartConfig = {
        id: 'empty-chart',
        title: 'Empty Chart',
        type: 'area',
        dataKey: 'visitors',
      }

      const { container } = render(<ChartRenderer config={config} data={[]} period="7d" />)

      expect(screen.getByText('Empty Chart')).toBeInTheDocument()
      expect(screen.getByText('No data available for this period')).toBeInTheDocument()
      expect(container.querySelector('.recharts-responsive-container')).not.toBeInTheDocument()
    })
  })
})
