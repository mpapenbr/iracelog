export interface IGraphTheme {
  antd: {
    theme: string;
    regionGreen: string;
    regionRed: string;
  };
}

export const antChartsTheme = (theme: string): IGraphTheme => {
  switch (theme) {
    case "dark":
    case "dimmed":
      return {
        antd: {
          theme: "dark",
          regionGreen: "green",
          regionRed: "red",
        },
      };
    default:
      return {
        antd: {
          theme: "default",
          regionGreen: "green",
          regionRed: "red",
        },
      };
  }
};
