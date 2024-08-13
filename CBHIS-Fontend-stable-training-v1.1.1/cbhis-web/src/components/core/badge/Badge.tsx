/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// Badge Component Props
type Props = {
  value?: string | number | React.ReactNode;
  className?: string;
  type?: "rectangle" | "circle";
};

/**
 * @description Badge Component
 */
const Badge = ({ value, className = "", type = "circle" }: Props) => {
  return (
    <span
      className={styles(
        "items-center justify-center text-[11px] text-whiteColor bg-primaryColor rounded-full font-bold",
        {
          "inline-flex w-5 h-5": type === "circle",
          "flex px-5 py-1 font-bold ": type === "rectangle",
        },
        className
      )}
    >
      {value}
    </span>
  );
};

export default Badge;
