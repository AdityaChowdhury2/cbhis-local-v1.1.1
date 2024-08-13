/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// LineSkeleton component props
interface LineSkeletonProps {
  className?: string;
}

// LineSkeleton component
export const LineSkeleton: React.FC<LineSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div
      className={styles(
        "animate-pulse h-4  bg-gradient-to-br from-gray-300 to-gray-200 rounded-full mb-2",
        className
      )}
    ></div>
  );
};

// CircleSkeleton component
export const CircleSkeleton: React.FC<LineSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div
      className={styles(
        "animate-pulse h-20 w-20 bg-gradient-to-br from-gray-300 to-gray-200 rounded-full mb-2",
        className
      )}
    ></div>
  );
};
