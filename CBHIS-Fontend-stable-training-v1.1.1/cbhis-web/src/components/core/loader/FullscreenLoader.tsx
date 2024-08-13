/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React, { Fragment } from "react";
import "./fullscreenLoader.css";

// Fullscreen loader component
const FullscreenLoader: React.FC = () => {
  return (
    <Fragment>
      <div className={` LoadingOverlay`}>
        <div className="Line-Progress">
          <div className="indeterminate"></div>
        </div>
      </div>
    </Fragment>
  );
};

export default FullscreenLoader;
