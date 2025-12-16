"use client";

import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartProps } from "./common";

export const LineChartComponent: React.FC<ChartProps> = ({
  dataKey,
  color,
  commonProps,
  xAxisProps,
  yAxisProps,
  tooltipProps,
}) => {
  return (
    <LineChart {...commonProps}>
      <CartesianGrid
        strokeDasharray="5 5"
        stroke="var(--theme-elevation-200)"
      />
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
  );
};
