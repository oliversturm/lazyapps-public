import React from 'react';
import Button from './Button';

const AppFrame = ({
  children,
  gotoCustomersView,
  gotoOrdersView,
  gotoAboutView,
}) => {
  return (
    <>
      <div className="bg-orange-100 p-2 rounded flex items-center">
        <Button kind="toolbar" onClick={gotoCustomersView} text="Customers" />
        <Button kind="toolbar" onClick={gotoOrdersView} text="Orders" />
        <Button kind="toolbar" onClick={gotoAboutView} text="About" />
        <div className="ml-auto font-bold">React Frontend</div>
      </div>

      {children}
    </>
  );
};

export default React.memo(AppFrame);
