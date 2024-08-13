import { RootState } from "@/app/store";
import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { OnchangeEventType } from "@/constants/api-interface/htmlEvents";
import { usePutHealthEducationTopicsMutation } from "@/features/health-education-topics/HealthEducationTopics";
import useSideEffects from "@/hooks/shared/useSideEffect";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function HealthEducationEdit({ toggler }) {
  // selected edit data from redux store
  const { data: editData } = useSelector(
    (state: RootState) => state.modal?.editModal
  );
  // * Local State
  const [formData, setFormData] = useState({ jobaid: "", description: "" });

  // input error state
  const [inputError, setInputError] = useState(null);
  // * Hokes
  const [
    putHealthEducationTopics,
    { data: deviceData, isSuccess, isError, error, status },
  ] = usePutHealthEducationTopicsMutation();

  const handleFormChange = (e: OnchangeEventType) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setInputError((prev) => ({ ...prev, [name]: "" }));
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!(formData?.jobaid || formData?.description)) {
      if (!formData?.jobaid) {
        setInputError((pre) => ({ ...pre, jobaid: "Required" }));
      }
      if (!formData?.description) {
        setInputError((pre) => ({ ...pre, description: "Required" }));
      }
      return;
    }

    const payload = {
      ...editData,
      jobaid: formData?.jobaid,
      description: formData?.description,
    };
    putHealthEducationTopics({ oid: editData?.oid, body: payload });
  };

  // Create SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "Health Education Topics",
    messageType: "update",
    response: deviceData,
    status,
    initialState: formData,
    isToggle: true,
    setFormState: setFormData,
    toggler,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        jobaid: editData?.jobaid,
        description: editData?.description,
      });
    }
  }, [editData]);

  return (
    <div className="-mt-5">
      <form onSubmit={handleSubmit}>
        <div className="">
          <div className="flex flex-col gap-3">
            <Textarea
              label="Jobaid"
              name="jobaid"
              errMsg={inputError?.jobaid}
              value={formData?.jobaid}
              onChange={handleFormChange}
              max={500}
              required
            />

            <Textarea
              label="Description"
              name="description"
              errMsg={inputError?.description}
              value={formData?.description}
              onChange={handleFormChange}
              required
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

export default HealthEducationEdit;
