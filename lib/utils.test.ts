import {
  getDateRange,
  getPreviousPeriodRange,
  formatNumber,
  calculateChange,
  formatChange,
  parseTimeseries,
  getTotalVisitors,
  extractAggregatedValue,
} from './utils'
import type { PostHogTrendResponse, TimePeriodData } from './posthog.types'
import { jest } from '@jest/globals'

describe('utils', () => {
  describe('formatNumber', () => {
    it('should format numbers less than 1000 as-is', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(1)).toBe('1')
      expect(formatNumber(50)).toBe('50')
      expect(formatNumber(999)).toBe('999')
    })

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K')
      expect(formatNumber(1500)).toBe('1.5K')
      expect(formatNumber(5000)).toBe('5.0K')
      expect(formatNumber(12345)).toBe('12.3K')
      expect(formatNumber(999999)).toBe('1000.0K')
    })

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M')
      expect(formatNumber(1500000)).toBe('1.5M')
      expect(formatNumber(5000000)).toBe('5.0M')
      expect(formatNumber(12345678)).toBe('12.3M')
    })
  })

  describe('calculateChange', () => {
    it('should calculate positive percentage change', () => {
      expect(calculateChange(150, 100)).toBe(50)
      expect(calculateChange(200, 100)).toBe(100)
      expect(calculateChange(110, 100)).toBe(10)
    })

    it('should calculate negative percentage change', () => {
      expect(calculateChange(50, 100)).toBe(-50)
      expect(calculateChange(75, 100)).toBe(-25)
      expect(calculateChange(90, 100)).toBe(-10)
    })

    it('should handle zero previous value', () => {
      expect(calculateChange(100, 0)).toBe(100)
      expect(calculateChange(0, 0)).toBeNull()
    })

    it('should handle zero current value', () => {
      expect(calculateChange(0, 100)).toBe(-100)
    })

    it('should handle decimal values', () => {
      expect(calculateChange(150.5, 100)).toBe(50.5)
      expect(calculateChange(105, 100)).toBe(5)
    })
  })

  describe('formatChange', () => {
    it('should format positive changes with + prefix', () => {
      expect(formatChange(50)).toEqual({ text: '+50%', isPositive: true })
      expect(formatChange(100)).toEqual({ text: '+100%', isPositive: true })
      expect(formatChange(15.5)).toEqual({ text: '+16%', isPositive: true })
    })

    it('should format negative changes without + prefix', () => {
      expect(formatChange(-50)).toEqual({ text: '-50%', isPositive: false })
      expect(formatChange(-25)).toEqual({ text: '-25%', isPositive: false })
      expect(formatChange(-15.5)).toEqual({ text: '-15%', isPositive: false })
    })

    it('should handle zero change', () => {
      expect(formatChange(0)).toEqual({ text: '0%', isPositive: false })
    })

    it('should handle null change', () => {
      expect(formatChange(null)).toEqual({ text: '0%', isPositive: false })
    })

    it('should round to nearest integer', () => {
      expect(formatChange(10.4)).toEqual({ text: '+10%', isPositive: true })
      expect(formatChange(10.5)).toEqual({ text: '+11%', isPositive: true })
      expect(formatChange(-10.4)).toEqual({ text: '-10%', isPositive: false })
      expect(formatChange(-10.5)).toEqual({ text: '-10%', isPositive: false })
    })
  })

  describe('parseTimeseries', () => {
    it('should parse valid trend data into timeseries', () => {
      const trendData: PostHogTrendResponse = {
        result: [
          {
            label: '$pageview',
            count: 1500,
            data: [100, 150, 200],
            labels: ['2024-01-01', '2024-01-02', '2024-01-03'],
            days: ['2024-01-01', '2024-01-02', '2024-01-03'],
          },
        ],
      }

      const result = parseTimeseries(trendData)

      expect(result).toEqual([
        { date: '2024-01-01', visitors: 100 },
        { date: '2024-01-02', visitors: 150 },
        { date: '2024-01-03', visitors: 200 },
      ])
    })

    it('should return empty array for null data', () => {
      expect(parseTimeseries(null)).toEqual([])
    })

    it('should return empty array when result is missing', () => {
      expect(parseTimeseries({ result: [] })).toEqual([])
    })

    it('should return empty array when data is missing', () => {
      const trendData: PostHogTrendResponse = {
        result: [
          {
            label: '$pageview',
            count: 0,
            data: undefined as any,
            labels: [],
            days: [],
          },
        ],
      }

      expect(parseTimeseries(trendData)).toEqual([])
    })
  })

  describe('getTotalVisitors', () => {
    it('should sum all visitors from timeseries', () => {
      const timeseries: TimePeriodData[] = [
        { date: '2024-01-01', visitors: 100 },
        { date: '2024-01-02', visitors: 150 },
        { date: '2024-01-03', visitors: 200 },
      ]

      expect(getTotalVisitors(timeseries)).toBe(450)
    })

    it('should return 0 for empty timeseries', () => {
      expect(getTotalVisitors([])).toBe(0)
    })

    it('should handle single data point', () => {
      const timeseries: TimePeriodData[] = [{ date: '2024-01-01', visitors: 100 }]

      expect(getTotalVisitors(timeseries)).toBe(100)
    })

    it('should handle zero values', () => {
      const timeseries: TimePeriodData[] = [
        { date: '2024-01-01', visitors: 0 },
        { date: '2024-01-02', visitors: 0 },
      ]

      expect(getTotalVisitors(timeseries)).toBe(0)
    })
  })

  describe('extractAggregatedValue', () => {
    it('should extract aggregated_value when present', () => {
      const trendData: PostHogTrendResponse = {
        result: [
          {
            label: '$pageview',
            count: 1000,
            aggregated_value: 1500,
            data: [],
            labels: [],
            days: [],
          },
        ],
      }

      expect(extractAggregatedValue(trendData)).toBe(1500)
    })

    it('should fall back to count when aggregated_value is missing', () => {
      const trendData: PostHogTrendResponse = {
        result: [
          {
            label: '$pageview',
            count: 1000,
            data: [],
            labels: [],
            days: [],
          },
        ],
      }

      expect(extractAggregatedValue(trendData)).toBe(1000)
    })

    it('should return 0 for null data', () => {
      expect(extractAggregatedValue(null)).toBe(0)
    })

    it('should return 0 when result is empty', () => {
      expect(extractAggregatedValue({ result: [] })).toBe(0)
    })

    it('should return 0 when both aggregated_value and count are missing', () => {
      const trendData: PostHogTrendResponse = {
        result: [
          {
            label: '$pageview',
            data: [],
            labels: [],
            days: [],
          } as any,
        ],
      }

      expect(extractAggregatedValue(trendData)).toBe(0)
    })
  })

  describe('getDateRange', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return correct range for day period', () => {
      const result = getDateRange('day')

      expect(result.dateTo).toBe('2024-01-15T12:00:00.000Z')
      expect(new Date(result.dateFrom).getDate()).toBe(14)
    })

    it('should return correct range for 7d period', () => {
      const result = getDateRange('7d')

      expect(result.dateTo).toBe('2024-01-15T12:00:00.000Z')
      expect(new Date(result.dateFrom).getDate()).toBe(8)
    })

    it('should return correct range for 30d period', () => {
      const result = getDateRange('30d')

      expect(result.dateTo).toBe('2024-01-15T12:00:00.000Z')
      const fromDate = new Date(result.dateFrom)
      expect(fromDate.getMonth()).toBe(11)
      expect(fromDate.getDate()).toBe(16)
    })

    it('should return correct range for 12mo period', () => {
      const result = getDateRange('12mo')

      expect(result.dateTo).toBe('2024-01-15T12:00:00.000Z')
      const fromDate = new Date(result.dateFrom)
      expect(fromDate.getFullYear()).toBe(2023)
      expect(fromDate.getMonth()).toBe(0) // January
      expect(fromDate.getDate()).toBe(15)
    })

    it('should default to 7d for unknown period', () => {
      const result = getDateRange('unknown' as any)

      expect(result.dateTo).toBe('2024-01-15T12:00:00.000Z')
      expect(new Date(result.dateFrom).getDate()).toBe(8)
    })
  })

  describe('getPreviousPeriodRange', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return previous day period', () => {
      const result = getPreviousPeriodRange('day')

      const fromDate = new Date(result.dateFrom)
      const toDate = new Date(result.dateTo)

      expect(fromDate.getDate()).toBe(13) // 2 days before
      expect(toDate.getDate()).toBe(14) // 1 day before
    })

    it('should return previous 7d period', () => {
      const result = getPreviousPeriodRange('7d')

      // Should be from 14 days ago to 7 days ago
      const fromDate = new Date(result.dateFrom)
      const toDate = new Date(result.dateTo)

      expect(fromDate.getDate()).toBe(1) // 14 days before (Jan 1)
      expect(toDate.getDate()).toBe(8) // 7 days before (Jan 8)
    })

    it('should return previous 30d period', () => {
      const result = getPreviousPeriodRange('30d')

      const fromDate = new Date(result.dateFrom)
      const toDate = new Date(result.dateTo)

      expect(fromDate.getMonth()).toBe(10) // November (60 days back from Jan 15)
      expect(toDate.getMonth()).toBe(11) // December (30 days back)
    })

    it('should return previous 12mo period', () => {
      const result = getPreviousPeriodRange('12mo')

      const fromDate = new Date(result.dateFrom)
      const toDate = new Date(result.dateTo)

      expect(fromDate.getFullYear()).toBe(2022)
      expect(toDate.getFullYear()).toBe(2023)
    })

    it('should default to 7d for unknown period', () => {
      const result = getPreviousPeriodRange('unknown' as any)

      const fromDate = new Date(result.dateFrom)
      const toDate = new Date(result.dateTo)

      expect(fromDate.getDate()).toBe(1)
      expect(toDate.getDate()).toBe(8)
    })
  })
})
