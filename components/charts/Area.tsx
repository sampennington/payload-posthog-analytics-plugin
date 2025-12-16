"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartProps } from "./common";

export const AreaChartComponent: React.FC<ChartProps> = ({
  data,
  dataKey,
  color,
  gradient,
  gradientId,
  commonProps,
  xAxisProps,
  yAxisProps,
  tooltipProps,
}) => {
  return (
    <AreaChart {...commonProps}>
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
      )}
      <CartesianGrid
        strokeDasharray="5 5"
        stroke="var(--theme-elevation-200)"
      />
      <XAxis {...xAxisProps} />
      <YAxis {...yAxisProps} />
      <Tooltip {...tooltipProps} />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2}
        fillOpacity={1}
        fill={gradient ? `url(#${gradientId})` : color}
      />
    </AreaChart>
  );
};
