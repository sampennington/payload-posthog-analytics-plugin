type TableRow = Record<string, unknown>

interface TableColumn<T extends TableRow> {
  key: keyof T
  label: string
  formatter?: ((value: string | number) => string) | ((value: number) => string)
}

interface TableProps<T extends TableRow> {
  columns: Array<TableColumn<T>>
  rows: T[]
  title: string
}

export const Table = <T extends TableRow>({ columns, rows, title }: TableProps<T>) => {
  return (
    <div className="collection-list__tables" style={{ marginBottom: '2rem' }}>
      <div className="table-wrap">
        <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
        <div className="table">
          <table cellPadding="0" cellSpacing="0">
            <thead>
              <tr>
                {columns.map((column, idx) => (
                  <th key={idx}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr className={`row-${index + 1}`} key={index}>
                  {columns.map((column, colIndex) => {
                    const value = row[column.key]
                    const displayValue = column.formatter
                      ? column.formatter(value as number)
                      : String(value)
                    return <td key={colIndex}>{displayValue}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
