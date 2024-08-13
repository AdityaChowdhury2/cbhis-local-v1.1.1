/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";
import { forwardRef } from "react";
import { RiUserLine } from "react-icons/ri";

// username input props
type Props = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  pattern?: "textOnly" | "numberOnly" | "float" | "username";
  type?: string;
  className?: string;
  placeholder?: string;
  max?: number;
  min?: number;
  numberOnly?: boolean;
  readOnly?: boolean;
  handleKeyUp?: () => void;
  parentClass?: string;
};

// username input component
const InputUsername = forwardRef<HTMLInputElement, Props>(
  (props: Props, ref) => {
    const {
      value,
      onChange,
      name,
      label,
      required,
      errMsg,
      disabled,
      type = "text",
      className,
      placeholder,
      max,
      min,
      readOnly = false,
      handleKeyUp,
      parentClass,
    } = props;

    return (
      <div
        className={`flex flex-col w-full items-start justify-start ${parentClass}`}
      >
        {/* LABEL WITH REQUIRED STAR */}
        <div className="flex w-full">
          <div className="input_label">{label}</div>
          {required && <span className="input_required">*</span>}
        </div>

        {/* INPUT BOX */}
        <div className="relative w-full">
          <input
            type={type}
            // className={` ps-9 ${style} ${
            //   disabled && "disabled_bg placeholder:!text-grayColor"
            // } ${className}`}
            className={styles("ps-9 custom_input", className, {
              "disabled_bg placeholder:!text-grayColor": disabled,
            })}
            value={value}
            name={name}
            readOnly={readOnly}
            onChange={onChange}
            disabled={disabled}
            maxLength={max || 250}
            onKeyUp={handleKeyUp}
            placeholder={`${placeholder ? placeholder : "Enter " + label}`}
            ref={ref}
            min={min}
          />

          {/* ICON */}
          <div className="absolute left-3 top-1/2 text-base transform -translate-y-1/2 text-blueColor">
            <RiUserLine
              size={17}
              className="text-xl text-loyalVioletColor font-medium"
            />
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {errMsg && <span className="input_error  ">{errMsg}!</span>}
      </div>
    );
  }
);

export default InputUsername;

export const CartError = ({ errMsg }: { errMsg: string }) => {
  return errMsg && <span className="input_error  ">{errMsg}</span>;
};
