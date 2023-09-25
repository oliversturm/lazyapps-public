import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withFormik } from 'formik';

import CustomerForm from '../components/CustomerForm';
import { useReadModel, useCommands } from '../components/SystemContext';
import customerEditSchema from '../schemas/customerEditSchema';

import { dataLoaded as customerViewDataLoaded } from '../state/customerView.slice';
import { customersView } from '../state/navigation.slice';
import { Working } from '../components/Working';

const FormikCustomerForm = withFormik({
  mapPropsToValues: ({ data }) => customerEditSchema.cast(data || {}),
  validationSchema: customerEditSchema,
  // This option is important if the data value passed from "outside"
  // can change after initial mount - otherwise Formik doesn't notice
  // that change.
  enableReinitialize: true,
  handleSubmit: (
    changedObject,
    {
      setSubmitting,
      props: { updateCustomer, createCustomer, data, customerId },
    }
  ) => {
    (data ? updateCustomer : createCustomer)(customerId, changedObject).then(
      () => {
        setSubmitting(false);
      }
    );
  },
})(CustomerForm);

const CustomerView = () => {
  const dispatch = useDispatch();
  const dataLoaded = useCallback(
    data => {
      dispatch(customerViewDataLoaded(data));
    },
    [dispatch]
  );
  const onCancel = useCallback(() => {
    dispatch(customersView());
  }, [dispatch]);
  const { updateCustomer, createCustomer } = useCommands({
    chainHandler: onCancel,
  });

  const { customerId } = useSelector(state => state.navigation);
  const readModelSpec = useMemo(
    () => ({
      endpoint: 'customers',
      readModel: 'editing',
      resolver: 'byId',
      params: { id: customerId },
    }),
    [customerId]
  );
  useReadModel(readModelSpec, dataLoaded);

  const data = useSelector(({ customerView: { data } }) => data);
  const dataObject = (data && data.length && data[0]) || null;

  return data ? (
    <div className="container">
      <div className="font-bold text-lg">{`${
        dataObject ? 'Edit' : 'Create'
      } Customer`}</div>
      <FormikCustomerForm
        customerId={customerId}
        data={dataObject}
        onCancel={onCancel}
        updateCustomer={updateCustomer}
        createCustomer={createCustomer}
      />
    </div>
  ) : (
    <Working />
  );
};

export default React.memo(CustomerView);
