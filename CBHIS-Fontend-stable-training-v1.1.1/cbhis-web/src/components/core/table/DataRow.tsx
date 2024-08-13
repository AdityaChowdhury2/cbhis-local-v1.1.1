/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";
import React from "react";

// DataRow component props
type Props = {
  title: string;
  data: string | number;
  titleClass?: string;
  dataClass?: string;
  isHideOnEmptyData?: boolean;
  className?: string;
};

// DataRow component
const DataRow: React.FC<Props> = ({
  title,
  data,
  titleClass = "",
  dataClass = "",
  isHideOnEmptyData,
  className = "",
}) => {
  if (isHideOnEmptyData && !data) {
    return false;
  }
  return (
    <div
      className={styles(
        "flex items-start justify-end xs:justify-start",
        className
      )}
    >
      <div
        className={styles(
          "min-w-[50%] xs:min-w-[145px] max-w-[145px] flex justify-between mr-5 items-start text-textColor text-[11px] 2xl:text-[13px] font-semibold py-1 2xl:py-2",
          titleClass
        )}
      >
        <div>{title}</div>
        <div className="hidden xs:block ">:</div>
      </div>
      <div
        className={styles(
          "w-full md:w-[100%] flex gap-2 items-center  text-textColor justify-end xs:justify-start text-right xs:text-left py-1 2xl:py-2",
          dataClass
        )}
      >
        <div className="text-[11px] 2xl:text-[13px]">{data}</div>
      </div>
    </div>
  );
};

export default DataRow;
