import { lapTimeString } from "../../utils/output";

export interface TTLaptimeData {
  lapNo: number;
  data: {
    carNum: string;
    lapTime: number;
    driver?: string;
  }[];
}
const LaptimeTooltip: React.FC<TTLaptimeData> = (props: TTLaptimeData) => {
  return (
    <div
      className="custom-tooltip"
      style={{ margin: 0, padding: 10, backgroundColor: "white", border: "1px solid rgb(204,204,204)" }}
    >
      <p className="custom-tooltip">Lap {props.lapNo}</p>
      <table cellPadding={1}>
        <tbody>
          {props.data.map((v) => (
            // <p className="custom-tooltip" style={{ color: colorCode(v.carNum) }}>
            <tr /* style={{ color: colorCode(v.carNum) }} */>
              <td align="right">#{v.carNum}</td>
              <td align="right">{lapTimeString(v.lapTime)}</td>
            </tr>
            // </p>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default LaptimeTooltip;
