import Swal from "sweetalert2";

export const deleteAlert = (
  handler: () => void,
  title: string = "Are you sure, you want to delete this record?"
) => {
  Swal.fire({
    title,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Delete",
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      handler();
    }
  });
};
