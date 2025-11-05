
export function formatAxisDate(
  dateStr: string,
  period: string,
  _index?: number,
  _total?: number,
): string {
  const date = new Date(dateStr)

  if (period === 'day') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  } else if (period === '12mo') {
    const month = date.getMonth()
    if (month === 0) {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short' })
  } else if (period === '30d') {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
  }
}

export function formatTooltipDate(dateStr: string, period: string): string {
  const date = new Date(dateStr)
  if (period === 'day') {
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    )
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}
