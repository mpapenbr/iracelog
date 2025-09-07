export interface IGraphTheme {
  antd: {
    theme: string;
    regionGreen: string;
    regionRed: string;
    trackWetness: string[];
  };
}

export const antChartsTheme = (theme: string): IGraphTheme => {
  switch (theme) {
    case "dark":
      return {
        antd: {
          theme: "classicDark",
          regionGreen: "green",
          regionRed: "red",
          trackWetness: [
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0)",
            "#00bfff",
            "#0080ff",
            "#0040ff",
            "#0000ff",
            "#4000ff",
            "#8000ff",
          ],
        },
      };
    case "dimmed":
      return {
        antd: {
          theme: "dark",
          regionGreen: "green",
          regionRed: "red",
          trackWetness: [
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0)",
            "#00bfff",
            "#0080ff",
            "#0040ff",
            "#0000ff",
            "#4000ff",
            "#8000ff",
          ],
        },
      };
    default:
      return {
        antd: {
          theme: "classic",
          regionGreen: "green",
          regionRed: "red",
          trackWetness: [
            "rgba(0,0,0,0)",
            "rgba(0,0,0,0)",
            "#00bfff",
            "#0080ff",
            "#0040ff",
            "#0000ff",
            "#4000ff",
            "#8000ff",
          ],
        },
      };
  }
};
