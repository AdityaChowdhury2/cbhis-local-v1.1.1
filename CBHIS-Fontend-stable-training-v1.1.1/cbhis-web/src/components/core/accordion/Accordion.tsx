/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";
import { useEffect, useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

// Accordion component Props
type Props = {
  title?: string;
  subTitle?: string;
  isSubTitleShow?: boolean;
  isPastEncounter?: boolean;
  isAccordion?: boolean;
  className?: string;
  boxClass?: string;
  children?: React.ReactNode;
};

/**
 * @description Accordion Component
 */
const Accordion = ({
  title = "",
  subTitle,
  isSubTitleShow,
  isAccordion,
  className = "",
  boxClass = "",
  children,
}: Props) => {
  // height state
  const [height, setHeight] = useState(true);

  // handle side effects
  useEffect(() => {
    if (isAccordion) {
      setHeight(false);
    } else {
      setHeight(true);
    }
  }, [isAccordion]);

  return (
    <>
      {/* ACCORDION */}
      <div
        className={styles(
          "border border-borderColor rounded-lg bg-blueColor  w-full",
          boxClass,
          { " h-full": !isAccordion || height }
        )}
      >
        {title !== "" && (
          // ACCORDION BUTTON
          <button
            onClick={() => isAccordion && setHeight(!height)}
            className={styles(
              "flex w-full px-3 items-center justify-between bg-lightBlue font-poppins py-2.5 rounded-t-lg cursor-pointer xl:cursor-default",
              { "border-b border-b-borderColor": !isAccordion || height }
            )}
          >
            {/* TITLE */}
            <p className=" font-semibold text-[12px] 2xl:text-[15px] text-white">
              {title}
            </p>

            {/* SUB TITLE */}
            <div className="flex gap-10 text-white">
              {isSubTitleShow && (
                <p className="text-xs 2xl:text-sm">{subTitle}</p>
              )}
              {isAccordion && !height && <BiChevronDown />}
              {isAccordion && height && <BiChevronUp />}
            </div>
          </button>
        )}

        {/* CHILDREN */}
        {height && (
          <div
            className={`bg-whiteBgColor px-3 flex flex-col gap-3 my-3 ${className}`}
          >
            {children}
          </div>
        )}
      </div>
    </>
  );
};

export default Accordion;
