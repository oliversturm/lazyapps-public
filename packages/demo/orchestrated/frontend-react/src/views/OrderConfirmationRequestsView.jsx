import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderConfirmationRequestsTable from '../components/OrderConfirmationRequestsTable';
import { useCommands, useReadModel } from '../components/SystemContext';

import { dataLoaded as orderConfirmationRequestsViewDataLoaded } from '../state/orderConfirmationRequestsView.slice';

const OrderConfirmationRequestsView = () => {
  const dispatch = useDispatch();
  const dataLoaded = useCallback(
    (data) => {
      dispatch(orderConfirmationRequestsViewDataLoaded(data));
    },
    [dispatch],
  );

  const { confirmOrder } = useCommands();

  const onConfirm = useCallback((id) => {
    confirmOrder(id);
  }, []);

  const { data, loadRequired } = useSelector(
    ({ orderConfirmationRequestsView }) => orderConfirmationRequestsView,
  );

  const readModelSpec = useMemo(
    () => ({
      endpoint: 'orders',
      readModel: 'confirmationRequests',
      resolver: 'all',
      params: {},
    }),
    [],
  );
  useReadModel(readModelSpec, dataLoaded, loadRequired);

  return <OrderConfirmationRequestsTable data={data} onConfirm={onConfirm} />;
};

export default React.memo(OrderConfirmationRequestsView);
