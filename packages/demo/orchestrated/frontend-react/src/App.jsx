import React from 'react';
import RoutedPage from './components/RoutedPage';
import AppFrame from './components/connected/AppFrame';

const App = () => {
  return (
    <div className="container mx-auto border-solid border-2 rounded-lg my-4 p-4 shadow-lg">
      <AppFrame>
        <div>
          <RoutedPage />
        </div>
      </AppFrame>
    </div>
  );
};

export default App;
