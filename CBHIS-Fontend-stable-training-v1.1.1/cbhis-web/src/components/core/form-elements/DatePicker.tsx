/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React, { KeyboardEvent } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// DATE INPUT PROPS
interface DateInputProps {
  onChange: (date: Date | null) => void;
  selected?: Date | null;
  label?: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
  min?: Date | null;
  max?: Date | null;
  minTime?: Date | null;
  maxTime?: Date | null;
  notOnKeyDown?: boolean;
  isClearable?: boolean;
  placeholderText?: string;
  timeOnly?: boolean;
  timeIntervals?: number;
  isFutureDate?: boolean;
  isPopperPlacement?: boolean;
  isReadOnly?: boolean;
}

// date input components
const DateInput: React.FC<DateInputProps> = ({
  onChange,
  selected,
  label,
  required,
  timeIntervals = 1,
  errMsg,
  disabled,
  name = "",
  className = "",
  min = null,
  max = null,
  notOnKeyDown,
  isClearable = false,
  placeholderText = "dd-mm-yyyy",
  timeOnly = false,
  isFutureDate = false,
  minTime = null,
  maxTime = null,
  isPopperPlacement = false,
  isReadOnly = false,
}) => {
  // keydown event handler
  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!notOnKeyDown) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col w-full items-start justify-start">
      {/* LABEL WITH REQUIRED STAR */}
      <div className="flex w-full">
        {label && <div className="input_label "> {label}</div>}
        {required && <span className="input_required">*</span>}
      </div>

      {/* DATE PICKER */}
      <ReactDatePicker
        selected={selected || null}
        closeOnScroll={true}
        name={name}
        timeIntervals={180000}
        isClearable={isClearable}
        disabled={disabled}
        onChange={onChange}
        placeholderText={placeholderText}
        onKeyDown={handleOnKeyDown}
        readOnly={isReadOnly}
        wrapperClassName="w-full"
        className={`custom_input w-[100%] ${className} ${
          disabled && "bg-disabledColor !text-grayColor"
        }`}
        popperPlacement={isPopperPlacement ? "auto-start" : undefined}
        popperModifiers={
          isPopperPlacement
            ? [
                {
                  name: "offset",
                  options: {
                    offset: [0, 10],
                  },
                },
                {
                  name: "flip",
                  enabled: false,
                },
              ]
            : undefined
        }
        {...(timeOnly && {
          showTimeSelect: true,
          showTimeSelectOnly: true,
          timeIntervals,
          timeCaption: "Time",
          dateFormat: "h:mm aa",
          minTime: minTime ?? undefined,
          maxTime: maxTime ?? undefined,
        })}
        {...(!timeOnly && {
          showYearDropdown: true,
          showMonthDropdown: true,
          dropdownMode: "select",
          dateFormat: "dd-MM-yyyy",
          minDate: min,
          maxDate: max && !isFutureDate ? new Date() : undefined,
        })}
      />
      {/* ERROR MESSAGE */}
      {errMsg && <span className="input_error">{errMsg}!</span>}
    </div>
  );
};

export default DateInput;
