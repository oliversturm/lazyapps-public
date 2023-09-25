import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  customersView,
  ordersView,
  aboutView,
} from '../../state/navigation.slice';

import DisconnectedAppFrame from '../AppFrame';

const AppFrame = ({ children, appTitle }) => {
  const dispatch = useDispatch();
  const props = {
    gotoCustomersView: useCallback(() => {
      dispatch(customersView());
    }, [dispatch]),
    gotoOrdersView: useCallback(() => {
      dispatch(ordersView());
    }, [dispatch]),
    gotoAboutView: useCallback(() => {
      dispatch(aboutView());
    }, [dispatch]),
    appTitle,
  };

  return <DisconnectedAppFrame {...props}>{children}</DisconnectedAppFrame>;
};

export default React.memo(AppFrame);
