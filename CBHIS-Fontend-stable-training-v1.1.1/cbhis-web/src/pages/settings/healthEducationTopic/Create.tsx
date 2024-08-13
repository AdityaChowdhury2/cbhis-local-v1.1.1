import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { OnchangeEventType } from "@/constants/api-interface/htmlEvents";
import { usePostHealthEducationTopicsMutation } from "@/features/health-education-topics/HealthEducationTopics";
import useSideEffects from "@/hooks/shared/useSideEffect";
import { useState } from "react";

function HealthEducationCreate({ toggler }) {
  // * Local State
  const [formData, setFormData] = useState({ jobaid: "", description: "" });

  // input error state
  const [inputError, setInputError] = useState(null);
  // * Hokes
  const [
    postHealthEducationTopics,
    { data: deviceData, isSuccess, isError, error, status },
  ] = usePostHealthEducationTopicsMutation();

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
      isDeleted: false,
      jobaid: formData?.jobaid,
      description: formData?.description,
    };
    postHealthEducationTopics(payload);
  };

  // Create SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "jobaid",
    messageType: "create",
    response: deviceData,
    status,
    initialState: formData,
    isToggle: true,
    setFormState: setFormData,
    toggler,
  });

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
            <SaveAndBackButtons submitBtnText="Create" toggler={toggler} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default HealthEducationCreate;
