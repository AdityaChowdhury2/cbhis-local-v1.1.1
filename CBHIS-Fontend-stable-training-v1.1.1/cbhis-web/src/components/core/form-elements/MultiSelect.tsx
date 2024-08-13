/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import DateInput from "./DatePicker";

// OPTION INTERFACE
export interface Option {
  oid: number | string;
  description?: string;
}

// multi select component props
export interface MultipleSelectProps {
  options: Option[];
  selectedOptions: Option[];
  setSelectedOptions: (options: Option[]) => void;
  isSearchable?: boolean;
  isSelectable?: boolean;
  isDate?: boolean;
  dateLabel?: string;
  selectableOptions?: Option[];
  handleSelectChange?: (id: string) => void;
}

// mutli select component
const MultiSelect = ({
  options,
  isSearchable,
  isSelectable,
  isDate,
  dateLabel = "Select a Date",
  selectedOptions,
  setSelectedOptions,
  selectableOptions,
  handleSelectChange,
}: MultipleSelectProps) => {
  // search query state
  const [searchQuery, setSearchQuery] = useState("");

  // dropdown reference
  const dropdownRef = useRef(null);

  // filter options
  const filteredOptions = options?.filter((option: Option) =>
    option?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  // option toggler
  const handleOptionToggle = (option: Option) => {
    const optionIndex = selectedOptions.findIndex(
      (item) => item?.oid === option?.oid
    );

    if (optionIndex !== -1) {
      setSelectedOptions([
        ...selectedOptions.slice(0, optionIndex),
        ...selectedOptions.slice(optionIndex + 1),
      ]);
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  // render selectable options
  const renderSelectableOptions = () => {
    if (selectableOptions) {
      return selectableOptions?.map((option) => (
        <option key={option?.oid} value={option?.oid}>
          {option?.description}
        </option>
      ));
    }
  };

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      <div className="bg-whiteBgColor rounded-lg p-2 pt-0">
        {/* SELECTABLE OPTIONS */}
        <div className="grid gap-2 mb-2">
          {isSelectable && selectableOptions.length > 0 && (
            <select
              name="selectableOptions"
              className="custom-input border border-borderColor"
              onChange={(e) => handleSelectChange(e.target.value)}
            >
              {renderSelectableOptions()}
            </select>
          )}

          {/* TEXT INPUT BOX */}
          {isSearchable && (
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="custom-input border border-borderColor"
            />
          )}

          {/* DATE INPUT */}
          {isDate && <DateInput label={dateLabel} onChange={() => {}} />}
        </div>

        {/* FILTER OPTIONS */}
        <div className=" grid md:grid-cols-2 max-h-48 overflow-y-auto">
          {filteredOptions?.map((option) => (
            <div
              key={option?.oid}
              className="px-4 py-2 cursor-pointer hover:bg-lightBlue"
              onClick={() => handleOptionToggle(option)}
            >
              {/* CHECKBOX INPUT */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="min-w-[14px] min-h-[14px] 2xl:min-w-[15px] 2xl:min-h-[15px] mr-2 text-primaryColor border-lightGrayColor focus:ring-primaryColor"
                  checked={selectedOptions?.some(
                    (item) => item?.oid === option?.oid
                  )}
                  onChange={() => {}}
                />
                <span className="text-textColor whitespace-nowrap truncate text-[10px] 2xl:text-[11px]">
                  {option?.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SELECTED OPTIONS */}
      {selectedOptions.length > 0 && (
        <div className="bg-lightBlue border border-borderColor p-3 mt-3.5 rounded-lg grid xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
          {selectedOptions.map((option) => (
            <div
              key={option.oid}
              className="bg-lightBlue border !border-primaryColor rounded-lg py-1 px-2 flex justify-between gap-2 2xl:gap-1"
            >
              <h2
                title={option.description}
                className="whitespace-nowrap truncate text-[10px] 2xl:text-[11px] flex items-center justify-start cursor-default"
              >
                {option.description}
              </h2>
              <button type="button" onClick={() => handleOptionToggle(option)}>
                <RxCross2 className="text-dangerColor rounded hover:bg-red-200 text-[18px] p-0.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
