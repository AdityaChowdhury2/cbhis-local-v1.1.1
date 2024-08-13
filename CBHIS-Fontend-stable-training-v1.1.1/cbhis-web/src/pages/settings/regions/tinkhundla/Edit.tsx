import { RootState } from "@/app/store";
import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { useEditTinkhundlaMutation } from "@/features/tinkhundla/tinkhundla";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

function TinkhundlaEdit({ toggler }) {
  // * Hokes
  const [editTinkhundla, { isLoading, isSuccess, data }] =
    useEditTinkhundlaMutation();
  const dispatch = useDispatch();
  const { data: editData } = useSelector(
    (state: RootState) => state.modal.editModal
  );

  // * Local State
  const [description, setDescription] = useState(editData?.description);

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (description) {
      editTinkhundla({
        description: description,
        regionId: editData?.regionId,
        oid: editData?.oid,
      });
    } else {
      toast.error("Description Required");
    }
  };

  // * Action After Create
  useEffect(() => {
    if (!isLoading && isSuccess && data?.isSuccess) {
      toast.success("Tinkhundla Created Successfully");
      setDescription("");
      closeModal();
    }

    if (!isLoading && isSuccess && !data?.isSuccess) {
      toast.error(data?.message);
    }
  }, [isLoading, isSuccess]);

  return (
    <div className="-mt-5">
      <form onSubmit={handleSubmit}>
        <div className="">
          <div className="flex flex-col gap-3">
            <Textarea
              label="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mt-5 col-span-full">
            <SaveAndBackButtons
              submitBtnText={isLoading ? "Loading ..." : "Update"}
              toggler={toggler}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default TinkhundlaEdit;
