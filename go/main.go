package main

import (
	// "fmt"
	"encoding/json"
	"fmt"
	"syscall/js"
	"wasmwrapper/convert"

	"github.com/mpapenbr/iracelog-service-manager-go/pkg/model"
	"github.com/mpapenbr/iracelog-service-manager-go/pkg/processing"
)

func MyAdd(this js.Value, inputs []js.Value) interface{} {
	x := model.AnalysisData{}
	for k, v := range x.CarComputeState {
		fmt.Printf("key: %v value: %+v", k, v)
	}

	a := inputs[0].Int()
	b := inputs[1].Int()
	return a + b
}

var proc *processing.Processor

/*
Notes: passing JS objects to Go may be quite annoying.
There are 3 options:
- process every JS attribute like this  arg.Get("attr").String() and compose your Go struct "by hand"
- pass the JS object as string and Unmarshall it here
- pass the JS object and use js.Global().Get("JSON").Call("stringify", arg).String() and Unmarshall it here

On top of that:
when using tinygo you will get an error like this on the JS console (see https://github.com/tinygo-org/tinygo/issues/1140)
"syscall/js.finalizeRef not implemented"
This is quite annyoing. A workaround is to use the standard Go WASM compiler.
The downside is the wasm size: tinygo: 0.9MB, go: 2.8MB
*/

// just here for demo purposes of passing an already JSON.stringify'd json object as string
func initProcJsonStr(this js.Value, inputs []js.Value) interface{} {

	jsonStr := inputs[0].String()
	bytes := []byte(jsonStr)

	var manifests model.Manifests
	err := json.Unmarshal(bytes, &manifests)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return nil
	}
	fmt.Printf("Received manifests (jsonStr): %+v\n", manifests)

	proc = processing.NewProcessor(processing.WithManifests(&manifests, -1))
	return nil

}

func initProc(this js.Value, inputs []js.Value) interface{} {

	jsonStr := js.Global().Get("JSON").Call("stringify", inputs[0]).String()
	bytes := []byte(jsonStr)

	var manifests model.Manifests
	err := json.Unmarshal(bytes, &manifests)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return nil
	}
	fmt.Printf("Received manifests (raw): %+v\n", manifests)

	proc = processing.NewProcessor(processing.WithManifests(&manifests, -1))
	return nil
}

func reinitWithAnalysisData(this js.Value, inputs []js.Value) interface{} {

	jsonStr := js.Global().Get("JSON").Call("stringify", inputs[0]).String()
	bytes := []byte(jsonStr)

	var analysisData model.AnalysisData
	err := json.Unmarshal(bytes, &analysisData)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return nil
	}

	proc.ProcessAnalysisData(&analysisData)
	data := proc.GetData()
	// fmt.Printf("Current analysis: %+v\n", data)

	if data != nil {
		return convert.Convert(data)
	} else {
		fmt.Printf("Current analysis not yet present\n")
		return nil
	}
}

func ProcessCarMessage(this js.Value, inputs []js.Value) interface{} {

	jsonStr := js.Global().Get("JSON").Call("stringify", inputs[0]).String()
	bytes := []byte(jsonStr)
	// fmt.Printf("Received carData (raw): %s\n", jsonStr)
	var carData model.CarData
	err := json.Unmarshal(bytes, &carData)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return nil
	}
	// fmt.Printf("Received carData: %+v\n", carData)
	// fmt.Printf("current proc instance: %+v\n", proc)
	proc.ProcessCarData(&carData)
	data := proc.GetData()
	// fmt.Printf("Current analysis: %+v\n", data)

	if data != nil {
		return convert.Convert(data)
	} else {
		fmt.Printf("Current analysis not yet present\n")
		return nil
	}

}
func ProcessStateMessage(this js.Value, inputs []js.Value) interface{} {
	jsonStr := js.Global().Get("JSON").Call("stringify", inputs[0]).String()
	bytes := []byte(jsonStr)
	// fmt.Printf("Received stateData (raw): %s\n", jsonStr)
	var stateData model.StateData
	err := json.Unmarshal(bytes, &stateData)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return nil
	}
	// fmt.Printf("Received carData: %+v\n", carData)
	// fmt.Printf("current proc instance: %+v\n", proc)

	proc.ProcessState(&stateData)
	data := proc.GetData()
	// fmt.Printf("Current analysis: %+v\n", data)

	if data != nil {
		return convert.Convert(data)
	} else {
		fmt.Printf("Current analysis not yet present\n")
		return nil
	}
}

func main() {

	c := make(chan struct{}, 0)
	js.Global().Set("myAdd", js.FuncOf(MyAdd))
	js.Global().Set("initProc", js.FuncOf(initProc))
	js.Global().Set("initProcJsonStr", js.FuncOf(initProcJsonStr))
	js.Global().Set("reinitWithAnalysisData", js.FuncOf(reinitWithAnalysisData))
	js.Global().Set("processCarMessage", js.FuncOf(ProcessCarMessage))
	js.Global().Set("processStateMessage", js.FuncOf(ProcessStateMessage))

	<-c
}
