import wasmModule from "./analysis.wasm?init";

interface WasmMethods {
  demoAdd: (a: number, b: number) => number;
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
};

console.log("wasmCheck: ", wasmMethods.demoAdd(5, 7));
export default wasmMethods;
