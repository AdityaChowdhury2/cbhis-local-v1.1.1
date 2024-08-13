import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { OnchangeEventType } from "@/constants/api-interface/htmlEvents";
import { usePostWashesMutation } from "@/features/wash/Wash";
import useSideEffects from "@/hooks/shared/useSideEffect";
import { useState } from "react";

function WashCreate({ toggler }) {
  //  Local State
  const [description, setDescription] = useState("");

  // input error state
  const [inputError, setInputError] = useState("");
  // * Hokes
  const [
    postDrinkingWaterSources,
    { data: washData, isSuccess, isError, error, status },
  ] = usePostWashesMutation();

  const handleFormChange = (e: OnchangeEventType) => {
    const { value } = e.target;
    setDescription(value);
    setInputError("");
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description) {
      return setInputError("Required");
    }
    const payload = {
      isDeleted: false,
      description,
    };
    postDrinkingWaterSources(payload);
  };

  // Create SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "wash",
    messageType: "create",
    response: washData,
    status,
    initialState: description,
    isToggle: true,
    setFormState: setDescription,
    toggler,
  });
  return (
    <div className="-mt-5">
      <form onSubmit={handleSubmit}>
        <div className="">
          <div className="flex flex-col gap-3">
            <Textarea
              label="Description"
              name="description"
              errMsg={inputError}
              value={description}
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
export default WashCreate;