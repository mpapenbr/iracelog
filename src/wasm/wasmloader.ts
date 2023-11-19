import { IProcessRaceStateData } from "@mpapenbr/iracelog-analysis/dist/stints/types";
import { InboundManifests } from "../stores/racedata/types";
import wasmModule from "./analysis.wasm?init";

interface WasmMethods {
  demoAdd: (a: number, b: number) => number;
  initProcJsonStr: (manifestDataJsonStr: string) => any;
  initProc: (manifestData: InboundManifests) => any;
  reinitWithAnalysisData: (analysisData: IProcessRaceStateData) => any;
  processCarMessage: (a: any) => any;
  processStateMessage: (a: any) => any;
}

// const go = globalThis.Go; // eslint-disable-line
let instance: WebAssembly.Instance;
let wasmMethods: WasmMethods;
console.log("I will init wasm stuff");
const go = (window as any).Go;
console.log(go);
const impObj = go.importObject;
const initWasm = async () => {
  // const impObj = {};
  instance = await wasmModule(impObj);
  go.run(instance);
};

await initWasm();

wasmMethods = {
  demoAdd: (a: number, b: number) => {
    return (globalThis as any).myAdd(a, b);
  },
  initProc: (manifestData: InboundManifests) => {
    return (globalThis as any).initProc(manifestData);
  },
  initProcJsonStr: (manifestDataJsonStr: string) => {
    return (globalThis as any).initProcJsonStr(manifestDataJsonStr);
  },
  reinitWithAnalysisData: (analysisData: IProcessRaceStateData) => {
    return (globalThis as any).reinitWithAnalysisData(analysisData);
  },
  processCarMessage: (a: any) => {
    return (globalThis as any).processCarMessage(a);
  },
  processStateMessage: (a: any) => {
    return (globalThis as any).processStateMessage(a);
  },
};

console.log("wasmCheck: ", wasmMethods.demoAdd(5, 7));
export default wasmMethods;
