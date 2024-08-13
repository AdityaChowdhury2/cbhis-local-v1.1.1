/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import style from "./loader.module.css";

// Loader component
const Loader = () => {
  return (
    <div className="flex items-center w-full bg-bgColor absolute top-0 justify-center h-screen">
      <span className={style?.crossLoader}></span>
    </div>
  );
};

export default Loader;
