import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderTable from '../components/OrderTable';
import { useReadModel } from '../components/SystemContext';

import { dataLoaded as ordersViewDataLoaded } from '../state/ordersView.slice';

const OrdersView = () => {
  const dispatch = useDispatch();
  const dataLoaded = useCallback(
    data => {
      dispatch(ordersViewDataLoaded(data));
    },
    [dispatch]
  );

  const { data, loadRequired } = useSelector(({ ordersView }) => ordersView);

  const readModelSpec = useMemo(
    () => ({
      endpoint: 'orders',
      readModel: 'overview',
      resolver: 'all',
      params: {},
    }),
    []
  );
  useReadModel(readModelSpec, dataLoaded, loadRequired);

  return <OrderTable data={data} />;
};

export default React.memo(OrdersView);
