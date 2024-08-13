import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Input from "@/components/core/form-elements/Input";
import Textarea from "@/components/core/form-elements/Textarea";
import { useCreateAncTopicMutation } from "@/features/anc-topic/ancTopic";
import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

function AncTopicCreate({ toggler }) {
  // * Local State
  const [description, setDescription] = useState("");
  const [jobaid, setJobaid] = useState("");

  // * Hokes
  const [createAncTopic, { isLoading, isSuccess, data }] =
    useCreateAncTopicMutation();
  const dispatch = useDispatch();

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (description && jobaid) {
      createAncTopic({ description: description, jobaid: jobaid });
    } else {
      toast.error("Required");
    }
  };

  // * Action After Create
  useEffect(() => {
    if (!isLoading && isSuccess && data?.isSuccess) {
      toast.success("ANC Topic Created Successfully");
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
            <Input
              label="Topic"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Textarea
              label="Job aid"
              required
              value={jobaid}
              onChange={(e) => setJobaid(e.target.value)}
              max={500}
            />
          </div>
          <div className="mt-5 col-span-full">
            <SaveAndBackButtons submitBtnText="Create" toggler={toggler} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default AncTopicCreate;
