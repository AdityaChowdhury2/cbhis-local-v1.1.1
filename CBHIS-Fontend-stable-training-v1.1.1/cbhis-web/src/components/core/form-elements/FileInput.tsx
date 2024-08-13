/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React, { forwardRef } from "react";
import { FaCloudUploadAlt, FaTimesCircle } from "react-icons/fa";

// IMAGE VALUE INTERFACE
interface ImageValue {
  lastModified: number;
  lastModifiedDate: string;
  name: string;
  size: number;
  type: string;
  webkitRelativePath: string;
}

// FILE INPUT PROPS
type Props = {
  onRemove?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  accept?: string;
  required?: boolean;
  errMsg?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
  value?: ImageValue;
};

// file input component
const FileInput = forwardRef<HTMLInputElement, Props>((props: Props, ref) => {
  const {
    onChange,
    onRemove,
    name,
    label = "Upload a file",
    accept = ".jpg,.png",
    required = true,
    errMsg,
    disabled,
    className,
    title = "",
    value,
  } = props;

  return (
    <div className={`relative ${className}`}>
      {/* TITLE */}
      <h3 className="pb-2">{title}</h3>

      {/* FILE INPUT BUTTON */}
      {value && (
        <button
          type="button"
          className="text-red-500 hover:text-red-700 absolute right-2 top-10"
          onClick={onRemove}
        >
          <FaTimesCircle />
        </button>
      )}

      {/* FILE INPUT LABEL */}
      <label
        title="Click to upload"
        htmlFor="fileInput"
        className="cursor-pointer flex items-center gap-4 px-5 py-3 rounded-xl border border-borderColor bg-whiteColor"
      >
        <div className="p-2 flex items-center justify-center bg-blueColor text-whiteColor rounded-lg">
          <FaCloudUploadAlt className="text-whiteColor" />
        </div>
        <div className="">
          <h4 className="block font-semibold text-textColor">
            {value ? "Uploaded" : label}
          </h4>
          {required && (
            <p className="mt-0.5 block text-grayTextColor">
              Please choose only jpg or png file
            </p>
          )}
        </div>
      </label>

      {/* FILE INPUT */}
      <input
        type="file"
        id="fileInput"
        name={name}
        onChange={onChange}
        accept={accept}
        disabled={disabled}
        className="hidden"
        ref={ref}
      />

      {/* ERROR MESSAGE */}
      {errMsg && <span className="input_error">{errMsg}!</span>}
    </div>
  );
});

export default FileInput;
