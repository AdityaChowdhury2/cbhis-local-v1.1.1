import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { useCreateChiefdomMutation } from "@/features/chiefdom/chiefdom";
import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

function ChiefdomCreate({ toggler }) {
  // * Local State
  const [description, setDescription] = useState("");

  // * Hokes
  const [createChiefdom, { isLoading, isSuccess, data }] =
    useCreateChiefdomMutation();
  const dispatch = useDispatch();
  const { id } = useParams();

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (description) {
      createChiefdom({ description: description, inkhundlaId: id });
    } else {
      toast.error("Description Required");
    }
  };

  // * Action After Create
  useEffect(() => {
    if (!isLoading && isSuccess && data?.isSuccess) {
      toast.success("Region Created Successfully");
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

export default ChiefdomCreate;
