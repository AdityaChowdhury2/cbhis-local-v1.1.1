/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// logo component props
type Props = {
  className?: string;
  imgClassName?: string;
};

// logo component
const Logo = ({ imgClassName = "", className = "" }: Props) => {
  return (
    // LOGO CONTAINER
    <div
      className={styles(
        "h-[90px] w-[90px] 2xl:h-28 2xl:w-28 bg-whiteColor border-[3px] 2xl:border-4 border-borderColor rounded-full transform -translate-y-[75px] 2xl:translate-y-[-85px] xxl:translate-y-[-85px]",
        className
      )}
    >
      {/* BACKGROUND IMAGE */}
      <img
        src="/images/logo/logo.png"
        className={styles("p-4 md:p-4 2xl:p-[22px]", imgClassName)}
        alt="Logo"
      />
    </div>
  );
};

export default Logo;
