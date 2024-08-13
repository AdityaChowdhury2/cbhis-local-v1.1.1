import { SweetAlertOptions } from "sweetalert2";

export const swalWarning = ({
  title = "Are you sure, you want to delete this record?",
  confirmButtonText = "Delete",
}): SweetAlertOptions => {
  return {
    title,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "var(--redColor)",
    cancelButtonColor: "var(--primaryColor)",
    confirmButtonText,
    allowOutsideClick: false,
  };
};
