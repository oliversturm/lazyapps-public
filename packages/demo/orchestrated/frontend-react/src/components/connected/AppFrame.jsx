import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  customersView,
  ordersView,
  aboutView,
  orderConfirmationRequestsView,
} from '../../state/navigation.slice';

import DisconnectedAppFrame from '../AppFrame';

const AppFrame = ({ children, appTitle }) => {
  const currentView = useSelector((state) => state.navigation.currentView);
  const dispatch = useDispatch();
  const props = {
    currentView,
    gotoCustomersView: useCallback(() => {
      dispatch(customersView());
    }, [dispatch]),
    gotoOrdersView: useCallback(() => {
      dispatch(ordersView());
    }, [dispatch]),
    gotoOrderConfirmationRequestsView: useCallback(() => {
      dispatch(orderConfirmationRequestsView());
    }, [dispatch]),
    gotoAboutView: useCallback(() => {
      dispatch(aboutView());
    }, [dispatch]),
    appTitle,
  };

  return <DisconnectedAppFrame {...props}>{children}</DisconnectedAppFrame>;
};

export default React.memo(AppFrame);
