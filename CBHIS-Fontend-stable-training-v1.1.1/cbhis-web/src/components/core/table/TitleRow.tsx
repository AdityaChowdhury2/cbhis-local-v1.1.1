/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// TitleRow component props
type Props = {
  title: string;
  data: number | string;
  className?: string;
};

// TitleRow component
const TitleRow = ({ title, data, className }: Props) => {
  return (
    <div className={styles("flex w-full", className)}>
      {/* TITLE */}
      <h5 className="w-[80%] md:w-[30%] 2xl:w-[20%] font-medium whitespace-nowrap">
        {title}
      </h5>

      {/* DATA */}
      <h5 className="w-[20%] text-xs 2xl:text-sm whitespace-nowrap">
        : &nbsp; {data}
      </h5>
    </div>
  );
};

export default TitleRow;
