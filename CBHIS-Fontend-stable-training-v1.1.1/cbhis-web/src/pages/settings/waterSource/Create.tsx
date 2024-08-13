import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { OnchangeEventType } from "@/constants/api-interface/htmlEvents";
import { usePostDrinkingWaterSourcesMutation } from "@/features/drinking-water-source/DrinkingWaterSource";
import useSideEffects from "@/hooks/shared/useSideEffect";
import useCreateBase from "@/hooks/useCreateBase";
import { useState } from "react";

function WaterSourceCreate({ toggler }) {
  const { createBase } = useCreateBase({});

  //  Local State
  const [description, setDescription] = useState("");

  // input error state
  const [inputError, setInputError] = useState("");
  // * Hokes
  const [
    postDrinkingWaterSources,
    { data: waterSourceData, isSuccess, isError, error, status },
  ] = usePostDrinkingWaterSourcesMutation();

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
      isDeleted: createBase?.isDeleted,
      description,
    };
    postDrinkingWaterSources(payload);
  };

  // Create SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "drinking water sources",
    messageType: "create",
    response: waterSourceData,
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

export default WaterSourceCreate;
