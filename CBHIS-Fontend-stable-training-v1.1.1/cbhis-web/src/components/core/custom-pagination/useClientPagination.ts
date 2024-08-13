/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";

// props for useClientPagination hook
type Props = {
  paginationDefaultShowValue?: number[];
  arrayData: any[];
};

/**
 * @description Custom Pagination Hook
 */
const useClientPagination = ({
  paginationDefaultShowValue = [10, 20, 30, 50],
  arrayData = [],
}: Props) => {
  // start count state
  const [start, setStart] = React.useState(1);

  // take count state
  const [take, setTake] = React.useState(paginationDefaultShowValue[0]);

  // active page state
  const [activePage, setActivePage] = React.useState(1);

  // calculate start and end index
  const startIndex = start == 1 ? 0 : (start - 1) * take;
  const endIndex = startIndex + take;

  // find page items to show
  let activeShowData = arrayData;
  activeShowData = arrayData?.slice(startIndex, endIndex);

  return {
    start,
    setStart,
    take,
    setTake,
    activePage,
    setActivePage,
    activeShowData,
  };
};

export default useClientPagination;
