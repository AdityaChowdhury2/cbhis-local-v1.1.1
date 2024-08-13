/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// Table Body data Type
type BodyData = {
  title: string | number | JSX.Element;
  subTitle?: string | JSX.Element;
  w: string;
  dataClass?: string;
};

// Table Body component props
type TableBodyPropType = {
  index: number;
  className?: string;
  data: BodyData[];
  length?: number;
};

// Table Body component
function TableBody({ data, index, className = "", length }: TableBodyPropType) {
  return (
    <div
      key={index}
      className={styles(
        `flex justify-between items-center px-6 h-full 
        ${length === index + 1 && "border-none"} ${
          index % 2 ? "bg-[#264DB915]" : "bg-whiteColor"
        }`,
        className
      )}
    >
      {/* BODY ITEM */}
      {data?.map((data, i) => (
        <div
          className={styles(
            "p-2 text-textColor text-[11px] 2xl:text-[13px]",
            data?.dataClass ? data?.dataClass : ""
          )}
          style={{ width: data.w }}
          key={i}
        >
          {/* TITLE */}
          <div className="flex flex-col">
            <div className="text-[11px] 2xl:text-[12px] text-grayColor font-normal">
              {data?.title}
            </div>

            {/* SUB TITLE */}
            {data?.subTitle && (
              <div className="text-[11px] 2xl:text-[13px] text-grayColor font-normal">
                {data?.subTitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TableBody;
