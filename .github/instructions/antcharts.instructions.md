---
description: "Use when: working with Ant Design Charts components in src/components/antcharts/, creating new charts, or modifying chart data formatting and styling"
applyTo: "src/components/antcharts/**,src/components/live/**,src/components/speedmap/**,src/components/weather/**"
---

# Ant Design Charts Component Patterns

## Architecture Pattern (Key Difference from Nivo)

**Antcharts are SMART components** with direct Redux integration:

```typescript
// Container → minimal props (filters only)
<LapcChart showCars={['#1', '#2']} limitLastLaps={10} filterSecs={120} />

// Component → selects and transforms ALL data internally
const carLaps = useAppSelector((state) => state.carLaps);
const userSettings = useAppSelector((state) => state.userSettings.global);
```

Unlike Nivo (dumb components), antcharts handle **all data transformation internally**.

## Component Structure Template

Follow this exact pattern for all Ant Design Charts components:

```typescript
import { Line, LineConfig } from "@ant-design/plots";
import { Empty } from "antd";
import React from "react";
import { useAppSelector } from "../../stores";
import { assignCarColors } from "../live/colorAssignment";
import { antChartsTheme } from "./color";
import { globalWamp } from "../../commons/globals";

interface MyProps {
  showCars: string[];
  limitLastLaps: number;
  filterSecs: number;
  height?: number;
}

const MyChart: React.FC<MyProps> = (props: MyProps) => {
  // 1. Select ALL data from Redux
  const availableCars = useAppSelector((state) => state.availableCars);
  const carLaps = useAppSelector((state) => state.carLaps);
  const globalSettings = useAppSelector((state) => state.userSettings.global);

  // 2. Early validation
  if (props.showCars.length === 0) {
    return <Empty description="Select cars" />;
  }

  // 3. Data transformation functions
  const dataForCar = (carNum: string) => {
    // Filter, transform, and format data for this car
    return filteredData.map(item => ({
      carNum: `#${carNum}`,
      lapNoStr: "" + item.lapNo,  // STRING for X-axis (antd bug #797)
      lapNo: item.lapNo,          // Number for filtering
      value: item.someValue
    }));
  };

  // 4. Combine data for all cars
  const graphData = props.showCars
    .map(carNum => dataForCar(carNum))
    .flatMap(a => [...a]);

  // 5. Color assignment
  const assignedCarColors = assignCarColors(availableCars);
  const localColors = props.showCars
    .map((carNum) => assignedCarColors.get(carNum) ?? "black");

  // 6. Theme and configuration
  const graphTheme = antChartsTheme(globalSettings.theme);
  const config: LineConfig = {
    data: graphData,
    height: props.height ?? 500,
    limitInPlot: true,
    xField: "lapNoStr",        // String field for X-axis
    yField: "value",           // Numeric field for Y-axis
    seriesField: "carNum",     // Series grouping
    colorField: "carNum",      // Color mapping
    theme: graphTheme.antd.theme,
    color: localColors,
    animate: false,            // Always disable for performance
    autoFit: true,

    // Performance: conditional interactions based on live/historical
    interaction: globalWamp.currentLiveId ? {} : { brushFilter: true },
    interactions: globalWamp.currentLiveId ? [] : [
      { type: "brush" },
      { type: "element-highlight" }
    ],

    // Axes configuration
    axis: {
      y: {
        nice: true,
        labelFormatter: (d: number) => formatValue(d), // Custom formatter
        gridLineWidth: 1,
        gridLineDash: [0, 0]
      },
      x: { style: { labelTransform: "rotate(0)" } }
    },

    // Scale configuration
    scale: {
      y: { nice: true },
      color: { range: localColors }
    },

    // Optional slider for historical data only
    slider: globalWamp.currentLiveId ? undefined : { x: { start: 0, end: 1 } },
  };

  return <Line {...config} />;
};

export default MyChart;
```

## Critical Data Formatting Rules

**X-axis values MUST be strings** due to Ant Design Charts bug #797:

```typescript
// CORRECT:
data.map((item) => ({
  lapNoStr: "" + item.lapNo, // String for X-axis
  lapNo: item.lapNo, // Keep number for filtering
  value: item.value,
}));

// WRONG:
{
  lapNo: item.lapNo;
} // Number will cause rendering issues
```

## Color & Theming Rules

**Use centralized theme system** from [color.ts](src/components/antcharts/color.ts):

```typescript
import { antChartsTheme } from "./color";
import { assignCarColors } from "../live/colorAssignment";

const graphTheme = antChartsTheme(globalSettings.theme);
const assignedCarColors = assignCarColors(availableCars);
const localColors = showCars.map((carNum) =>
  assignedCarColors.get(carNum) ?? "black"
);

// In config:
theme: graphTheme.antd.theme,  // "classic" | "dark" | "classicDark"
color: localColors,            // Assigned car colors array
```

## Performance Optimization Rules

**Always optimize for live vs historical data:**

```typescript
// Disable animations (performance)
animate: false,

// Conditional interactions
interaction: globalWamp.currentLiveId ? {} : { brushFilter: true },

// Data limiting for live streams
if (globalWamp.currentLiveId && props.limitLastLaps > 0) {
  // Slice to last N laps only
}

// Slider only for historical data
slider: globalWamp.currentLiveId ? undefined : { x: { start: 0, end: 1 } },
```

## Data Transformation Utilities

**Statistical analysis** (import from [src/components/live/statsutil.ts](src/components/live/statsutil.ts)):

- `statsDataFor(values: number[])` — Min, max, quartiles for Y-axis scaling

**Time formatting** (import from [src/utils/output.ts](src/utils/output.ts)):

- `lapTimeString(sec)` → "1:05.23"
- `secAsMMSS(sec)` → "5:30"

**Race utilities** (import from [src/components/live/util.ts](src/components/live/util.ts)):

- `getCarStints(carStints, carNum)` — Extract car's stints

## Props Interface Convention

**Always use `MyProps` (not `<ComponentName>Props`):**

```typescript
interface MyProps {
  showCars: string[]; // Filtered car selection
  limitLastLaps: number; // Data limiting (0 = all laps)
  filterSecs: number; // Time range filter
  height?: number; // Optional height override
}
```

## Configuration Examples

**Tooltip standardization:**

```typescript
tooltip: {
  title: (d) => `Lap ${d.lapNo}`,
  items: [{
    channel: "y",
    field: "value",
    name: "Value",
    valueFormatter: customFormatter,
  }],
}
```

**Y-axis with statistics:**

```typescript
const work = statsDataFor(allValues);
scale: {
  y: { nice: true, domainMin: work.min, domainMax: work.max }
}
```

## Examples to Reference

- [deltagraph.tsx](src/components/antcharts/deltagraph.tsx) — Delta-to-reference pattern
- [lapchart.tsx](src/components/antcharts/lapchart.tsx) — Lap time analysis with stint integration
- [leadergraph.tsx](src/components/antcharts/leadergraph.tsx) — Gap analysis with position tracking
