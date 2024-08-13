/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { useDispatch } from "react-redux";

// Save and back button props
interface SaveAndBackButtonsProps {
  toggler?: () => void;
  submitHandler?: () => void;
  disableBoth?: boolean;
  backBtnText?: string;
  submitBtnText?: string;
  disableSubmit?: boolean;
  isLoading?: boolean;
  className?: string;
  saveIcon?: JSX.Element;
}

/**
 * @description Save and Back Button Component
 */
const SaveAndBackButtons = ({
  toggler = () => {},
  submitHandler = () => {},
  disableBoth,
  backBtnText,
  submitBtnText,
  disableSubmit,
  className,
  saveIcon,
  isLoading = false,
}: SaveAndBackButtonsProps) => {
  const dispatch = useDispatch();

  // * Close Modal Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  return (
    // Save and Back Buttons
    <div
      className={`flex justify-start gap-4 ${className} ${
        isLoading ? "cursor-not-allowed" : ""
      }`}
    >
      {/* SAVE BUTTON */}
      <button
        className={`main_btn ${
          (disableBoth || disableSubmit) &&
          "cursor-not-allowed disabled:bg-disabledColor disabled:!text-grayColor"
        } `}
        type="submit"
        disabled={disableBoth || disableSubmit || isLoading}
        onClick={submitHandler}
      >
        <span
          className={`flex items-center gap-4 ${
            disableSubmit ||
            (disableBoth ? "cursor-not-allowed text-grayColor" : "text-whiter")
          }`}
        >
          {saveIcon ? saveIcon : ""}
          {/* {submitBtnText ? submitBtnText : isLoading ? "Loading..." : "Save"} */}
          {isLoading ? "Loading..." : submitBtnText ? submitBtnText : "Save"}
        </span>
      </button>

      {/* BACK BUTTON */}
      <button
        className="cancel_btn px-6"
        type="button"
        onClick={toggler ? toggler : closeModal}
        disabled={disableBoth}
      >
        {backBtnText ? backBtnText : "Cancel"}
      </button>
    </div>
  );
};

export default SaveAndBackButtons;
