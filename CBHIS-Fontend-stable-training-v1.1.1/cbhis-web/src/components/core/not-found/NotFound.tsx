/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// NotFound component props
type Props = {
  messages?: string;
  className?: string;
};

// NotFound component
function NotFound({ messages, className = "" }: Props) {
  return (
    <div
      className={styles(
        "flex justify-center text-lg 2xl:text-xl items-center w-full  h-32 bg-whiteBgColor rounded-lg text-textColor",
        className
      )}
    >
      {/* MESSAGE */}
      <h2>{messages ? messages : "No Recorded Data Yet to Show"}</h2>
    </div>
  );
}

export default NotFound;
