/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";

// Tooltip component
const Tooltip = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="tooltip tooltip-top !before:bg-black before:text-[11px] before:2xl:text-[13px] after:!text-transparent tooltip-primary w-fit"
      data-tip={title}
    >
      {children}
    </div>
  );
};

export default Tooltip;
