/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

/**
 * @description Badge Button Component
 */
const BadgeBtn = ({
  btnText,
  icon,
  className = "",
}: {
  backgroundColor?: string;
  textColor?: string;
  btnText?: string;
  className?: string;
  icon?: JSX.Element;
}) => {
  return (
    <div
      className={styles(`main_btn py-[7px] px-4 font-medium !gap-2`, className ,)}
    >
      {icon} {btnText}
    </div>
  );
};

export default BadgeBtn;
