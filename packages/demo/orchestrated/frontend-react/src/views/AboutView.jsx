import React from 'react';

const AboutView = () => {
  return (
    <div className="m-16 rounded-lg bg-fuchsia-200">
      <div className="bg-fuchsia-500 rounded-t-lg text-lg p-2 font-bold text-white">
        About This Demo
      </div>
      <div className="py-8 font-bold text-2xl text-center">
        LazyApps Orchestrated Demo Application
        <br />
        (React Version)
      </div>
      <div className="px-2 py-1 border-t-2 text-xs text-right">
        &copy; Oliver Sturm
      </div>
    </div>
  );
};

export default React.memo(AboutView);
