/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";

// Breadcrumb Component Props
type Props = {
  children: JSX.Element;
  className: string;
};

/**
 * @description Breadcrumb Component
 */
const GlobalBreadcrumb = ({ children, className }: Props) => {
  return (
    <nav className={styles("flex", className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {children}
      </ol>
    </nav>
  );
};

export default GlobalBreadcrumb;
