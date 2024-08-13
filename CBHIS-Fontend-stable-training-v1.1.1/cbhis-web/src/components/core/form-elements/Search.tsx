/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { IoMdSearch } from "react-icons/io";

// search input props
type Props = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  pattern?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  max?: string;
};

// Search input component
function Search({
  value,
  onChange,
  name,
  label,
  required,
  disabled,
  pattern,
  type = "text",
  className,
  placeholder,
  max,
}: Props) {
  return (
    <div className="flex flex-col w-full items-start justify-start">
      {/* LABEL WITH REQUIRED STAR */}
      <div className="flex w-full">
        <div className="input_label">{label}</div>
        {required && <span className="input_required">*</span>}
      </div>

      {/* SEARCH INPUT */}
      <div className="relative w-full">
        <input
          type={type}
          className={`custom_input text-base  ${
            disabled && "disabled_bg  placeholder:!text-grayColor "
          } ${className}`}
          value={value}
          name={name}
          onChange={onChange}
          disabled={disabled}
          pattern={pattern}
          max={max || "250"}
          placeholder={`${placeholder ? placeholder : "Search..."}`}
        />

        {/* SEARCH BUTTON */}
        <button
          type="button"
          className="absolute right-0 rounded-r-[6px] bg-whiteColor border-[2px] border-s-0 border-solid border-borderColor h-full ps-2 w-[50px] top-1/2 text-base transform -translate-y-1/2 cursor-default"
        >
          <IoMdSearch className="text-xl text-grayColor" />
        </button>
      </div>
    </div>
  );
}

export default Search;
