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

// Divider Props
interface Props {
  text: string;
  className?: string;
}

// Divider Component
const Divider: React.FC<Props> = ({ text, className = "" }) => {
  return (
    <div className={styles("h-[1px] bg-borderColor relative", className)}>
      <p className="text-textColor absolute -top-2 left-[50%] bg-whiteColor px-2">
        {text}
      </p>
    </div>
  );
};

export default Divider;
