package main

import (
	// "fmt"
	"syscall/js"
	// "wasmwrapper/convert"
)

func MyAdd(this js.Value, inputs []js.Value) interface{} {
	a := inputs[0].Int()
	b := inputs[1].Int()
	return a + b
}


func main() {


	c := make(chan struct{}, 0)
	js.Global().Set("myAdd", js.FuncOf(MyAdd))

	<-c
}
