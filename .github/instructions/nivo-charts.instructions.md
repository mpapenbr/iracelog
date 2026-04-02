---
description: "Use when: working with Nivo chart components in src/components/nivo/, creating new charts, or modifying chart data formatting and styling"
applyTo: "src/components/nivo/**"
---

# Nivo Chart Component Patterns

## Data Structure Convention

**Always pre-format data in containers**, not chart components:

```typescript
// In containers: Transform complex Redux state → simple props
const chartData = carStints.map((stint) => ({
  car: stint.carNumber,
  "Stint 1": stint.duration,
  "Stint 2": stint.nextDuration,
}));

// In components: Receive clean, chart-ready data
interface ChartProps {
  data: Array<{ car: string; [key: string]: string | number }>;
}
```

## Component Structure Template

Follow this exact pattern for all Nivo components:

```typescript
import { useToken } from 'antd/es/theme/internal';
import { ResponsiveBar } from '@nivo/bar';
import { Empty } from 'antd';

interface MyChartProps {
  data: DataType[];
  showCars: string[];
  rangeTimeFormatter: (sec: number) => string;
}

export const MyChart = ({ data, showCars, rangeTimeFormatter }: MyChartProps) => {
  const { token } = useToken(); // For theme consistency

  // Early data transformation
  const filteredData = data.filter(d => showCars.includes(d.car));

  if (filteredData.length === 0) {
    return <Empty description="No data available" />;
  }

  // Custom tooltip component
  const CustomTooltip = (props: any) => (
    <div style={{ background: token.colorBgContainer, padding: '8px' }}>
      {/* tooltip content */}
    </div>
  );

  const calcHeight = Math.min(1200, Math.max(150, filteredData.length * 30));

  return (
    <ResponsiveBar
      data={filteredData}
      height={calcHeight}
      margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
      theme={{
        axis: {
          ticks: { text: { fill: token.colorTextLabel } },
          line: { stroke: token.colorTextLabel }
        },
        tooltip: { container: { background: token.colorBgContainer } }
      }}
      tooltip={CustomTooltip}
    />
  );
};
```

## Color & Theming Rules

**Use centralized color schemes** from [src/components/live/colors.ts](src/components/live/colors.ts):

- `catPastel1` — Soft 9-color palette for drivers
- `catPaired` — 12-color palette for cars
- `cat10Colors` — D3 category colors

**Theme integration with Ant Design:**

```typescript
const { token } = useToken();
// Always use token.colorTextLabel, token.colorBgContainer, etc.
```

## Performance Optimization

**Canvas vs SVG rendering:**

```typescript
// Use canvas for large datasets
{dataSize > 300 ? <ResponsiveBarCanvas /> : <ResponsiveBar />}
```

## Data Transformation Utilities

**Time formatting** (import from [src/utils/output.ts](src/utils/output.ts)):

- `secAsMMSS(sec)` → "5:30"
- `lapTimeString(sec)` → "1:05.23"
- `secAsHHMMSS(sec)` → "1:05:30"

**Race utilities** (import from [src/components/live/util.ts](src/components/live/util.ts)):

- `getCarStints(carStints, carNum)`
- `findDriverByStint(carOcc, stint)`

## Common Configuration

**Standard margins:** `{ top: 20, right: 130, bottom: 50, left: 60 }`

**Examples to reference:**

- [carStints.tsx](src/components/nivo/carStints.tsx) — Bar chart with custom tooltips
- [carPitstops.tsx](src/components/nivo/carPitstops.tsx) — Canvas optimization pattern
- [racePositionGraph.tsx](src/components/nivo/racePositionGraph.tsx) — Line chart with theme integration
