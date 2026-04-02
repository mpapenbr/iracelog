---
name: create-redux-slice
description: "Create a new Redux Toolkit slice following iracelog project patterns with proper TypeScript typing, actions, and test setup"
---

# Create Redux Slice

Create a new Redux Toolkit slice for the iracelog project following established patterns.

## Parameters

**Slice Name:** {{sliceName}}
**Data Type:** {{dataType}} (e.g., "CarData[]", "RaceSettings", "UserPreferences")  
**Initial State:** {{initialState}} (e.g., "[]", "{}", "defaultSettings")

## Generated Files

I'll create:

1. **Slice file:** `src/stores/grpc/slices/{{sliceName}}Slice.ts`
2. **Test file:** `src/stores/grpc/slices/__test__/{{sliceName}}Slice.spec.ts`
3. **Export integration:** Add to `src/stores/index.ts`

## Slice Template

Following the project's Redux Toolkit pattern:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface {{dataType}} {
  // Define your data structure
}

const initialState: {{dataType}} = {{initialState}};

export const {{sliceName}}Slice = createSlice({
  name: '{{sliceName}}',
  initialState,
  reducers: {
    initial{{SliceName}}: (state, action: PayloadAction<{{dataType}}>) => {
      // Initialize with server data
      return action.payload;
    },
    update{{SliceName}}: (state, action: PayloadAction<{{dataType}}>) => {
      // Update with new data
      return action.payload;
    },
    reset{{SliceName}}: () => initialState,
  },
});

export const { initial{{SliceName}}, update{{SliceName}}, reset{{SliceName}} } = {{sliceName}}Slice.actions;
export default {{sliceName}}Slice.reducer;
```

## Test Template

Unit tests following the project's pure function testing pattern:

```typescript
import { describe, test, expect } from 'vitest';
import {{sliceName}}Reducer, {
  initial{{SliceName}},
  update{{SliceName}},
  reset{{SliceName}}
} from '../{{sliceName}}Slice';

describe('{{sliceName}}Slice', () => {
  test('should return the initial state', () => {
    expect({{sliceName}}Reducer(undefined, { type: 'unknown' })).toEqual({{initialState}});
  });

  test('should handle initial{{SliceName}}', () => {
    const testData = /* test data */;
    const actual = {{sliceName}}Reducer({{initialState}}, initial{{SliceName}}(testData));
    expect(actual).toEqual(testData);
  });

  test('should handle reset{{SliceName}}', () => {
    const actual = {{sliceName}}Reducer(/* non-initial state */, reset{{SliceName}}());
    expect(actual).toEqual({{initialState}});
  });
});
```

## Store Integration

I'll add the new reducer to the store configuration in `src/stores/index.ts`:

```typescript
import {{sliceName}}Reducer from './grpc/slices/{{sliceName}}Slice';

const store = configureStore({
  reducer: {
    // ... existing reducers
    {{sliceName}}: {{sliceName}}Reducer,
  },
});
```

Ready to create your Redux slice with proper TypeScript typing and test coverage!
