import { TimePeriodData } from "../../lib/posthog.types"
import { BarChartComponent } from "./Bar"
import { LineChartComponent } from "./Line"
import { AreaChartComponent } from "./Area"

export type ChartProps = {
  data: TimePeriodData[]
  dataKey: string
  color: string
  gradient?: boolean
  gradientId: string
  commonProps: any
  xAxisProps: any
  yAxisProps: any
  tooltipProps: any
}

export const charts = {
  area: AreaChartComponent,
  line: LineChartComponent,
  bar: BarChartComponent,
};
