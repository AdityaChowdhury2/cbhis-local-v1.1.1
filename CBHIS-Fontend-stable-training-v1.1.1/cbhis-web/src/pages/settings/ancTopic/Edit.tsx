import { RootState } from "@/app/store";
import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Input from "@/components/core/form-elements/Input";
import Textarea from "@/components/core/form-elements/Textarea";
import { useEditAncTopicMutation } from "@/features/anc-topic/ancTopic";
import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

function AncTopicEdit({ toggler }) {
  // * Hokes
  const [editAncTopic, { isLoading, isSuccess, data }] =
    useEditAncTopicMutation();
  const dispatch = useDispatch();
  const { data: editData } = useSelector(
    (state: RootState) => state.modal?.editModal
  );

  // * Local State
  const [description, setDescription] = useState(editData?.description);
  const [jobaid, setJobaid] = useState(editData?.jobaid);

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (description && jobaid) {
      editAncTopic({
        description: description,
        jobaid: jobaid,
        oid: editData?.oid,
      });
    } else {
      toast.error("Required");
    }
  };

  // * Action After Create
  useEffect(() => {
    if (!isLoading && isSuccess && data?.isSuccess) {
      toast.success("ANC Topic Update Successfully");
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
            <SaveAndBackButtons submitBtnText="Update" toggler={toggler} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default AncTopicEdit;
