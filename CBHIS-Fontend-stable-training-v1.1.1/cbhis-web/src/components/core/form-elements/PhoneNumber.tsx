/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React, { ChangeEvent } from "react";

// phone number input props
interface PhoneNumberInputProps {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  label: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  pattern?: string;
  type?: string;
  className?: string;
  placeholder?: string;
  countryCode?: string;
  isReadOnly?: boolean;
}

// phone number input component
const PhoneNumber: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  name,
  label,
  required,
  errMsg,
  disabled,
  pattern,
  type,
  className,
  placeholder,
  countryCode,
  isReadOnly = false,
}) => {
  // phone number filter handler
  const handleFilter = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const ZMCountryCode = "+260";
    const ZMPattern = /^0?\d{0,9}$/;

    if (countryCode === ZMCountryCode) {
      if (ZMPattern.test(value)) {
        return onChange(e);
      }
    } else {
      if (/^[0-9]{0,11}$/.test(value)) {
        return onChange(e);
      }
    }
  };

  return (
    <div className="flex flex-col w-full items-start justify-start">
      {/* LABEL WITH REQUIRED STAR */}
      <div className="flex">
        <div className="input_label "> {label}</div>
        {required && <span className="input_required">*</span>}
      </div>

      {/* INPUT BOX */}
      <input
        type={type || "text"}
        className={`custom_input ${
          disabled && "disabled_bg  placeholder:!text-grayColor"
        } ${className}`}
        value={value}
        name={name}
        onChange={handleFilter}
        placeholder={label ? label : placeholder}
        disabled={disabled}
        pattern={pattern}
        max="250"
        readOnly={isReadOnly}
      />

      {/* ERROR MESSAGE */}
      {errMsg && <span className="input_error">{errMsg}!</span>}
    </div>
  );
};
export default PhoneNumber;
