"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartProps } from "./common";

export const BarChartComponent: React.FC<ChartProps> = ({
  dataKey,
  color,
  commonProps,
  xAxisProps,
  yAxisProps,
  tooltipProps,
}) => {
  return (
    <BarChart {...commonProps}>
      <CartesianGrid
        strokeDasharray="5 5"
        stroke="var(--theme-elevation-200)"
      />
      <XAxis {...xAxisProps} />
      <YAxis {...yAxisProps} />
      <Tooltip {...tooltipProps} />
      <Bar dataKey={dataKey} fill={color} />
    </BarChart>
  );
};
