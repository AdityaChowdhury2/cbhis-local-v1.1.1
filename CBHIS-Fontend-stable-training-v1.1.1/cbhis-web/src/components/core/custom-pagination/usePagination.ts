/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";

// props for usePagination hook
type Props = {
  paginationDefaultShowValue?: number[];
};

/**
 * @description Custom Pagination Hook
 */
const usePagination = ({
  paginationDefaultShowValue = [10, 20, 30, 50],
}: Props) => {
  // start count state
  const [start, setStart] = React.useState(1);

  // take count state
  const [take, setTake] = React.useState(paginationDefaultShowValue[0]);

  // active page state
  const [activePage, setActivePage] = React.useState(1);

  return {
    start,
    setStart,
    take,
    setTake,
    activePage,
    setActivePage,
  };
};

export default usePagination;
