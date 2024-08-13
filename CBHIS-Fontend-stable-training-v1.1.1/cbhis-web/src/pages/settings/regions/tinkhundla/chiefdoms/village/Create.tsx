import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { useCreateVillageMutation } from "@/features/village/village-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

function VillageCreate({ toggler }) {
  const { id } = useParams();

  // * Local State
  const [description, setDescription] = useState("");

  // * Hokes
  const [createVillage, { isLoading, isSuccess, data }] =
    useCreateVillageMutation();
  const dispatch = useDispatch();

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (description) {
      createVillage({ description: description, chiefdomId: id });
    } else {
      toast.error("Description Required");
    }
  };

  // * Action After Create
  useEffect(() => {
    if (!isLoading && isSuccess && data?.isSuccess) {
      toast.success("Village Created Successfully");
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
              submitBtnText={isLoading ? "Loading ..." : "Create"}
              toggler={toggler}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default VillageCreate;
