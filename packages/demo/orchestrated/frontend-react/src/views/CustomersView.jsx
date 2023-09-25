import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/Button';
import CustomerTable from '../components/CustomerTable';
import { useReadModel } from '../components/SystemContext';

import { dataLoaded as customersViewDataLoaded } from '../state/customersView.slice';
import { customerView, orderView } from '../state/navigation.slice';

const CustomersView = () => {
  const dispatch = useDispatch();
  const dataLoaded = useCallback(
    data => {
      dispatch(customersViewDataLoaded(data));
    },
    [dispatch]
  );
  const onNewCustomer = useCallback(() => {
    dispatch(customerView());
  }, [dispatch]);
  const rowEdit = useCallback(
    id => {
      dispatch(customerView(id));
    },
    [dispatch]
  );
  const onPlaceOrder = useCallback(
    id => {
      dispatch(orderView(id));
    },
    [dispatch]
  );

  const readModelSpec = useMemo(
    () => ({
      endpoint: 'customers',
      readModel: 'overview',
      resolver: 'all',
      params: {},
    }),
    []
  );
  useReadModel(readModelSpec, dataLoaded);

  const { data } = useSelector(({ customersView }) => customersView);

  return (
    <div>
      <CustomerTable
        data={data}
        rowEdit={rowEdit}
        onPlaceOrder={onPlaceOrder}
      />
      <Button kind="separate" onClick={onNewCustomer} text="New Customer" />
    </div>
  );
};

export default React.memo(CustomersView);
