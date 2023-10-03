package convert

/*
The source of this file is a modified copy from https://github.com/rosbit/go-wasm
(mainly modified in order to get the subset of functionality needed here in this project)

MIT License

Copyright (c) 2022 rosbit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import (
	"reflect"
	"strings"
	"syscall/js"
)

var (
	global    js.Value
	array     js.Value
	object    js.Value
	jsJSON    js.Value
	eval      js.Value
	null      js.Value
	undefined js.Value
)

func Convert(v interface{}) interface{} {
	return toValue(v)
}

func toValue(v interface{}) interface{} {
	if v == nil {
		return undefined
	}

	switch vv := v.(type) {
	case int, int8, int16, int32, int64,
		uint, uint8, uint16, uint32, uint64,
		float32, float64,
		string, bool:
		return v
	case []byte:
		return string(vv)
	case map[string]interface{}:
		return vv
	case js.Value:
		return vv
	default:
		v2 := reflect.ValueOf(v)
		switch v2.Kind() {
		case reflect.Slice, reflect.Array:
			r := make([]interface{}, v2.Len())
			for i := 0; i < v2.Len(); i++ {
				r[i] = toValue(v2.Index(i).Interface())
			}
			return r
		/*
			case reflect.Map:
				r := make(map[interface{}]interface{})
				iter := v2.MapRange()
				for iter.Next() {
					k, v1 := iter.Key(), iter.Value()
					r[toValue(k.Interface())] = toValue(v1.Interface())
				}
				return r
		*/
		case reflect.Struct:
			return bindGoStruct(v2)
		case reflect.Ptr:
			e := v2.Elem()
			if e.Kind() == reflect.Struct {
				return bindGoStruct(v2)
			}
			return toValue(e.Interface())
		// case reflect.Func:
		// 	if f, err := bindGoFunc(v); err == nil {
		// 		return f
		// 	}
		// 	return undefined
		// case reflect.Interface:
		// 	return bindGoInterface(v2)
		default:
			return null
		}
	}
}

func bindGoStruct(structVar reflect.Value) (goStruct map[string]interface{}) {
	var structE reflect.Value
	if structVar.Kind() == reflect.Ptr {
		structE = structVar.Elem()
	} else {
		structE = structVar
	}
	structT := structE.Type()

	if structE == structVar {
		// struct is unaddressable, so make a copy of struct to an Elem of struct-pointer.
		// NOTE: changes of the copied struct cannot effect the original one. it is recommended to use the pointer of struct.
		structVar = reflect.New(structT) // make a struct pointer
		structVar.Elem().Set(structE)    // copy the old struct
		structE = structVar.Elem()       // structE is the copied struct
	}

	goStruct = wrapGoStruct(structVar, structE, structT)
	return
}

func lowerFirst(name string) string {
	return strings.ToLower(name[:1]) + name[1:]
}

func wrapGoStruct(structVar, structE reflect.Value, structT reflect.Type) map[string]interface{} {
	r := make(map[string]interface{})
	for i := 0; i < structT.NumField(); i++ {
		strField := structT.Field(i)
		fv := structE.Field(i)
		if !fv.CanInterface() {
			continue
		}
		name := strField.Name
		name = lowerFirst(name)
		r[name] = toValue(fv.Interface())
	}

	// receiver is the struct
	// bindGoMethod(structE, structT, r)

	// reciver is the pointer of struct
	// t := structVar.Type()
	// bindGoMethod(structVar, t, r)
	return r
}
