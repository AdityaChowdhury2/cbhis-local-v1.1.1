/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ReactPagination from "react-js-pagination";

// Custom Pagination Props
type Props = {
  showInPage?: number[];
  take?: number;
  totalItemsCount?: number;
  setTake: (pageSize: number) => void;
  setStart: React.Dispatch<React.SetStateAction<number>>;
  start: number;
  activePage: number;
  setActivePage: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * @description Custom Pagination Component
 */
function CustomPagination({
  take = 5,
  setTake,
  totalItemsCount = 10,
  showInPage = [10, 20, 30, 50],
  setStart,
  start,
  activePage,
  setActivePage,
}: Props) {
  // page change handler
  const handlePageChange = (pageNo: number) => {
    setActivePage(pageNo);
    setStart(pageNo);
  };

  // calculate item counst for taking
  const takeItems =
    showInPage[0] > totalItemsCount ? totalItemsCount : activePage * take;

  // total item counts
  const totalTakeItems =
    takeItems > totalItemsCount ? totalItemsCount : takeItems;

  // * Handle Page Count Change
  const handleSelectChange = (e) => {
    setTake(+e.target.value);
    setStart(1);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row mt-4 items-center justify-between gap-3 ">
      {/* SHOWING ITEMS COUNT */}
      <div className="flex items-center gap-2 ">
        <p className="normal_text">
          Showing
          <span className="font-bold">
            &nbsp;
            {start === 1 ? start : start * take - take + 1}-{totalTakeItems}
            &nbsp;
          </span>
          from <span className="font-bold">{totalItemsCount}</span> data{" "}
        </p>
      </div>

      {/* SHOW PER PAGE */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-2 -mt-[0px]">
          <select
            value={take}
            className="custom_input h-[30px] 2xl:h-[35px] w-20 !text-[11px] !text-grayColor pt-[3px] 2xl:pt-[5px]"
            onChange={handleSelectChange}
          >
            {showInPage?.map((key) => {
              return (
                <option key={key} value={key}>
                  {key}
                </option>
              );
            })}
          </select>
        </div>

        {/* PAGINATION */}
        <ReactPagination
          activePage={activePage || 1}
          itemsCountPerPage={take}
          totalItemsCount={totalItemsCount || 1}
          pageRangeDisplayed={3}
          onChange={handlePageChange}
          innerClass={
            "flex gap-1 select-none border border-borderColor rounded-lg "
          }
          activeClass={"!bg-blueColor text-white rounded-lg"}
          itemClass={
            "cursor-pointer w-[30px] h-[30px] text-[13px] 2xl:w-[35px] 2xl:h-[35px] 2xl:text-[15px] text-center text-blueColor flex justify-center items-center"
          }
          firstPageText={<BiLeftArrowAlt />}
          lastPageText={<BiRightArrowAlt />}
          prevPageText={<IoIosArrowBack />}
          nextPageText={<IoIosArrowForward />}
        />
      </div>
    </div>
  );
}

export default CustomPagination;
