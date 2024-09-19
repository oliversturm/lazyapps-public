import React from 'react';
import { useSelector } from 'react-redux';
import CustomersView from '../views/CustomersView';
import OrdersView from '../views/OrdersView';
import CustomerView from '../views/CustomerView';
import OrderView from '../views/OrderView';
import AboutView from '../views/AboutView';
import OrderConfirmationRequestsView from '../views/OrderConfirmationRequestsView.jsx';

const RoutedPage = () => {
  const currentView = useSelector((state) => state.navigation.currentView);

  return (
    <div className="border-solid border mt-4 rounded p-2">
      {{
        customers: () => <CustomersView />,
        orders: () => <OrdersView />,
        customer: () => <CustomerView />,
        order: () => <OrderView />,
        orderConfirmationRequests: () => <OrderConfirmationRequestsView />,
        about: () => <AboutView />,
      }[currentView]()}
    </div>
  );
};

export default React.memo(RoutedPage);
