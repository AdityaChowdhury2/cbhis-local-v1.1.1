/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";

/**
 * @description Page not found component
 */
const PageNotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-whiteColor">
      <h1 className="text-4xl font-bold mb-4 text-blueColor">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-textColor">
        The page you are looking for does not exist.
      </p>
    </div>
  );
};

export default PageNotFound;
