import { useEffect, useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { MdArrowDropDown } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

type Props = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
};

const UserFilters = ({ search, setSearch, setFilter }: Props) => {
  // const [isActionOpen, setIsActionOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  // const actionRef = useRef(null);
  const filtersRef = useRef(null);

  const toggleFiltersDropdown = () => setIsFiltersOpen(!isFiltersOpen);

  const handleClickOutside = (event) => {
    // if (actionRef.current && !actionRef.current.contains(event.target)) {
    //   setIsActionOpen(false);
    // }
    if (filtersRef.current && !filtersRef.current.contains(event.target)) {
      setIsFiltersOpen(false);
    }
  };

  const handleItemClick = (filter) => {
    setIsFiltersOpen(false);
    setSelectedFilter(filter);
    setFilter(filter);
  };

  const clearFilter = () => {
    setSelectedFilter(null);
    setFilter(null);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="mb-4 mt-2 flex flex-wrap gap-3">
        {/* <div className="relative w-full xsm:w-fit" ref={actionRef}>
          <button
            onClick={toggleActionDropdown}
            className="flex items-center gap-1 border border-borderColor rounded px-2 py-1 w-full xsm:w-fit text-textColor bg-whiteColor"
          >
            Action <MdArrowDropDown />
          </button>
          {isActionOpen && (
            <div className="absolute mt-1 w-48 bg-whiteColor text-textColor border-borderColor border rounded shadow-md">
              <ul>
                <li
                  onClick={handleItemClick}
                  className="p-2 hover:bg-blueColor cursor-pointer"
                >
                  Action 1
                </li>
                <li
                  onClick={handleItemClick}
                  className="p-2 hover:bg-blueColor cursor-pointer"
                >
                  Action 2
                </li>
                <li
                  onClick={handleItemClick}
                  className="p-2 hover:bg-blueColor cursor-pointer"
                >
                  Action 3
                </li>
              </ul>
            </div>
          )}
        </div> */}

        <div className="flex items-center rounded-md border border-borderColor bg-whiteColor w-full xsm:w-fit">
          <div className="rounded-md p-2 button text-textColor">
            <AiOutlineSearch />
          </div>
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-1 focus:outline-none rounded-md text-textColor bg-whiteColor placeholder:text-[13px] h-[30px]"
          />
        </div>

        <div className="relative w-full xsm:w-fit" ref={filtersRef}>
          <button
            onClick={toggleFiltersDropdown}
            className="flex items-center gap-1 border border-borderColor rounded px-2 text-[13px] py-[5px] 2xl:py-[5px] w-full xsm:w-fit text-textColor bg-whiteColor"
          >
            Filters <MdArrowDropDown />
          </button>
          {isFiltersOpen && (
            <div className="absolute mt-1 w-48 !bg-whiteColor text-textColor border-borderColor border rounded shadow-md ">
              <ul>
                <li
                  onClick={() => handleItemClick(1)}
                  className="p-2 py-1 hover:bg-blueColor text-[13px] border-b border-b-borderColor cursor-pointer hover:text-white"
                >
                  Administrator
                </li>
                <li
                  onClick={() => handleItemClick(2)}
                  className="p-2 py-1 hover:bg-blueColor text-[13px] border-b border-b-borderColor cursor-pointer hover:text-white"
                >
                  Supervisor
                </li>
                <li
                  onClick={() => handleItemClick(3)}
                  className="p-2 py-1 hover:bg-blueColor text-[13px] border-b border-b-borderColor cursor-pointer hover:text-white"
                >
                  RHM
                </li>
              </ul>
            </div>
          )}
        </div>

        {selectedFilter && (
          <div className="flex gap-2 items-center bg-blueColor text-white border border-primaryColor text-[12px] rounded px-2 h-[30px]">
            {(selectedFilter === 1 && "Administrator") ||
              (selectedFilter === 2 && "Supervisor") ||
              (selectedFilter === 3 && "RHM")}
            <button onClick={clearFilter}>
              <RxCross2 />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFilters;
