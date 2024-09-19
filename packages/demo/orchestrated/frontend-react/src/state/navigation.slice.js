import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

const slice = createSlice({
  name: 'navigation',
  initialState: {},
  reducers: {
    customersView: (s) => {
      s.currentView = 'customers';
    },

    ordersView: (s) => {
      s.currentView = 'orders';
    },

    orderConfirmationRequestsView: (s) => {
      s.currentView = 'orderConfirmationRequests';
    },

    // Note that the `id` parameter is called that
    // to match the `routeMap` entry for the URL
    // /customer/:id
    customerView: {
      reducer: (s, { payload: { id } }) => {
        s.currentView = 'customer';
        s.customerId = id;
      },
      prepare: (customerId) => ({
        payload: { id: customerId || uuid() },
      }),
    },

    // This navigation is written to create a new
    // order - hence the new id in `prepare`.
    // Also note that the payload id is called
    // id because this matches the `routeMap`
    // entry for the /order/:customerId/:id URL.
    orderView: {
      reducer: (s, { payload: { id: orderId, customerId } }) => {
        s.currentView = 'order';
        s.orderId = orderId;
        s.customerId = customerId;
      },
      prepare: (customerId) => ({ payload: { id: uuid(), customerId } }),
    },

    aboutView: (s) => {
      s.currentView = 'about';
    },
  },
});

export const {
  customersView,
  ordersView,
  orderConfirmationRequestsView,
  customerView,
  orderView,
  aboutView,
} = slice.actions;
export default slice.reducer;
