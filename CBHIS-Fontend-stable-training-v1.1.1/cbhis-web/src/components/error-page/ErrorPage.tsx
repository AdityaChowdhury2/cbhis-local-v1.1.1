/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

type Props = {
  messages?: string;
  className?: string;
};

// error page
function ErrorPage({
  messages = "Something Went Wrong",
  className = "",
}: Props) {
  return (
    <div
      className={styles(
        "flex justify-center text-lg 2xl:text-xl items-center w-full p-3 h-32 bg-whiteColor rounded-lg",
        className
      )}
    >
      <h3 className="text-redColor">{messages}</h3>
    </div>
  );
}

export default ErrorPage;
