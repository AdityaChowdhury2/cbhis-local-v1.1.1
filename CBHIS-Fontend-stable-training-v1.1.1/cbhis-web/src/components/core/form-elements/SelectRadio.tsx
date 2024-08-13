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

// SelectRadio component props
type Props = {
  counter?: boolean;
  count?: string;
  title: string;
  value: string | number;
  handler: (e: React.ChangeEvent) => void;
  name: string;
  className: string;
  state?: string;
};

// SelectRadio component
const SelectRadio = ({
  count,
  counter,
  title,
  value,
  handler,
  name,
  className,
  state,
}: Props) => {
  return (
    // LABEL WITH COUNT
    <label
      className={styles(
        "inline-flex cursor-pointer gap-4 justify-between items-center px-5 py-1 2xl:py-1.5 text-[11px] 2xl:text-[13px] font-medium text-center text-textColor border rounded ",
        className
      )}
    >
      {title}
      {counter && (
        <span className="inline-flex items-center justify-center min-w-5 h-5 text-[8px]  font-semibold text-whiteColor bg-primaryColor border border-borderColor rounded-full">
          {count}
        </span>
      )}

      {/* RADIO INPUT */}
      <input
        type="radio"
        className="hidden"
        onChange={handler}
        checked={value === state}
        value={value}
        name={name}
      />
    </label>
  );
};

export default SelectRadio;
