import { Line } from "@ant-design/plots";
import * as React from "react";
import { useAppSelector } from "../../stores";
import { antChartsTheme } from "../antcharts/color";

interface IColor {
  red: number;
  green: number;
  blue: number;
}

export const Speedmap: React.FC = () => {
  const payload = useAppSelector((state) => state.speedmap);
  const carClasses = useAppSelector((state) => state.carClasses);
  const trackInfo = useAppSelector((state) => state.eventInfo.track);
  const globalSettings = useAppSelector((state) => state.userSettings.global);

  const carClassLookup = carClasses.reduce((prev, cur) => {
    prev.set(cur.id.toString(), cur.name);
    return prev;
  }, new Map<string, string>());

  const { minVal, maxVal, numItems } = Object.entries(payload.data).reduce(
    (prev, cur) => ({
      minVal: Math.min(prev.minVal, ...cur[1].chunkSpeeds),
      maxVal: Math.min(prev.maxVal, ...cur[1].chunkSpeeds),
      numItems: cur[1].chunkSpeeds.length,
    }),
    { minVal: 1000, maxVal: 0, numItems: 0 },
  );

  const lowColor: IColor = { red: 0, green: 127, blue: 0 };
  const highColor: IColor = { red: 255, green: 0, blue: 100 };
  const boxWidth = 800;
  const boxHeight = 50;
  const baseLine = boxHeight - 20; // this is where the line is drawn.
  const margin = 30;
  const chunkWidth = boxWidth / numItems;
  const computeColor = (pct: number): IColor => {
    const help = (a: number, b: number) => (a < b ? a + pct * (b - a) : a - pct * (a - b));
    return {
      red: help(lowColor.red, highColor.red),
      green: help(lowColor.green, highColor.green),
      blue: help(lowColor.blue, highColor.blue),
    };
  };

  // https://stackoverflow.com/questions/22218140/calculate-the-color-at-a-given-point-on-a-gradient-between-two-colors
  // const data = range(0, numItems);
  // MP 2022-10-08: stays as code, but not used right now. Graph feels better
  const BoxedSpeedmap = () => (
    <>
      {Object.entries(payload.data).map((v) => (
        <svg key={v[0]} width={boxWidth + margin} height={boxHeight + margin}>
          {v[1].chunkSpeeds.map((d, idx) => {
            const offset = chunkWidth * idx;
            const pct = (d - minVal) / (maxVal - minVal);
            const col = computeColor(pct);
            const colValue = `rgb(${col.red}, ${col.green}, ${col.blue})`;
            // console.log(`${idx}: ${pct} ${colValue}`);
            return (
              <g key={idx} transform={`translate(${offset} 0 )`}>
                <rect width={chunkWidth} height={20} style={{ fill: `${colValue}` }} />
              </g>
            );
          })}
        </svg>
      ))}
    </>
  );

  const SpeedChart = () => {
    const plotdata: { x: string; y: number; carClass: string }[] = [];
    Object.entries(payload.data)
      // .sort((a, b) => carClassLookup.get(a[0])!.localeCompare(carClassLookup.get(b[0])!))
      .sort((a, b) => a[1].laptime - b[1].laptime)
      .forEach((e) => {
        e[1].chunkSpeeds.forEach((v, idx) => {
          plotdata.push({
            x: Math.round(idx * payload.chunkSize).toString(), // antd-charts need strings for x, otherwise strange graph effects
            y: Math.round(v),
            carClass: carClassLookup.get(e[0]) ?? "Class " + e[0],
          });
        });
      });
    const graphTheme = antChartsTheme(globalSettings.theme);
    // console.log(plotdata);
    const config = {
      // width: 800,

      theme: graphTheme.antd.theme,
      height: 400,
      data: plotdata,
      xField: "x",
      yField: "y",
      seriesField: "carClass",
      colorField: "carClass",
      style: {
        lineWidth: 2,
      },
      axis: {
        y: {
          nice: true,

          gridLineWidth: 1,
          gridLineDash: [0, 0],
        },
        x: {
          style: {
            labelTransform: "rotate(0)",
          },
        },
      },
      animate: false,
    };
    return <Line {...config} />;
  };
  return (
    <>
      {/* <BoxedSpeedmap /> */}
      <SpeedChart />
    </>
  );
};
