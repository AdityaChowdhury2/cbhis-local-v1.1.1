/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// table header data type
export type HeaderData = {
  title: string | JSX.Element;
  w: string;
  sortIcon?: boolean;
};

// Table Header component props
export type TableHeaderPropType = {
  data: HeaderData[];
  className?: string;
};

// Table Header component
function TableHeader({ data, className = "" }: TableHeaderPropType) {
  return (
    <div
      className={styles(
        "flex justify-between px-6 h-full border-b border-borderColor py-[5px] bg-primaryColor",
        className
      )}
    >
      {/* HEADER TITLES */}
      {data?.map((item, index) => (
        <p
          className="p-2 py-1.5 text-textColor text-[12px] 2xl:text-[13px] font-semibold text-white"
          key={index}
          style={{ width: item.w }}
        >
          {item?.title}
        </p>
      ))}
    </div>
  );
}

export default TableHeader;
