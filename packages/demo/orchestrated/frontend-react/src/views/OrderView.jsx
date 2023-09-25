import React, { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withFormik } from 'formik';

import OrderForm from '../components/OrderForm';
import { useCommands, useReadModel } from '../components/SystemContext';
import orderEditSchema from '../schemas/orderEditSchema';

import { customersView } from '../state/navigation.slice';

const FormikOrderForm = withFormik({
  mapPropsToValues: ({ data }) => orderEditSchema.cast(data || { value: 0 }),
  validationSchema: orderEditSchema,
  handleSubmit: (
    changedObject,
    { setSubmitting, props: { createOrder, orderId } }
  ) => {
    createOrder(orderId, changedObject).then(() => {
      setSubmitting(false);
    });
  },
})(OrderForm);

const OrderView = () => {
  const dispatch = useDispatch();
  const onCancel = useCallback(() => {
    dispatch(customersView());
  }, [dispatch]);
  const { createOrder } = useCommands({
    chainHandler: onCancel,
  });

  const [customerData, setCustomerData] = useState();
  const dataLoaded = useCallback(
    data => {
      const customer = data && data.length && data[0];
      setCustomerData(customer);
    },
    [setCustomerData]
  );

  const { orderId, customerId } = useSelector(state => state.navigation);

  const readModelSpec = useMemo(
    () => ({
      endpoint: 'orders',
      readModel: 'overview',
      resolver: 'customerById',
      params: { id: customerId },
    }),
    [customerId]
  );
  useReadModel(readModelSpec, dataLoaded);

  return (
    <div className="container">
      <div className="font-bold text-lg">
        Create Order {customerData && `for ${customerData.name}`}
      </div>
      <FormikOrderForm
        orderId={orderId}
        data={{ customerId, value: 0 }}
        onCancel={onCancel}
        createOrder={createOrder}
      />
    </div>
  );
};

export default React.memo(OrderView);
