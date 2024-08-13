// Breadcrumb.tsx
/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

// Breadcrumb Item Props
interface BreadcrumbItemProps {
  href?: string;
  text: string;
  active?: boolean;
  noIcon?: boolean;
}

/**
 * @description Breadcrumb Item Component
 */
const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  href,
  text,
  noIcon,
  active = false,
}) => {
  const linkClass = `inline-flex items-center text-[11px] font-medium ${
    active ? "text-primaryColor" : "text-grayColor"
  }`;

  return (
    // BREADCRUMB ITEM
    <li className="inline-flex items-center">
      {href ? (
        <Link to={href} className={`${linkClass} `}>
          {!noIcon && <IoIosArrowForward className="me-1" />}
          {text}
        </Link>
      ) : (
        <button className={`${linkClass} `}>
          {!noIcon && <IoIosArrowForward className="me-1" />}
          {text}
        </button>
      )}
    </li>
  );
};
export default BreadcrumbItem;
