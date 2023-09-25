import { createSlice } from '@reduxjs/toolkit';

import dataLoadedReducer from './dataLoaded.reducer';
import notifyChangedReducer from './notifyChanged.reducer';

const slice = createSlice({
  name: 'ordersView',
  initialState: {},
  reducers: {
    dataLoaded: dataLoadedReducer,
    notifyChanged: notifyChangedReducer,
  },
});

export const { dataLoaded, notifyChanged } = slice.actions;
export default slice.reducer;
