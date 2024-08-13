import { RootState } from "@/app/store";
import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Textarea from "@/components/core/form-elements/Textarea";
import { OnchangeEventType } from "@/constants/api-interface/htmlEvents";
import { usePutWashesMutation } from "@/features/wash/Wash";
import useSideEffects from "@/hooks/shared/useSideEffect";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function WashEdit({ toggler }) {
  // selected edit data from redux store
  const { data: editData } = useSelector(
    (state: RootState) => state.modal?.editModal
  );

  //  Local State
  const [description, setDescription] = useState("");

  // input error state
  const [inputError, setInputError] = useState("");
  //  Hokes
  const [
    putSafeWaterSources,
    { data: waterSourceData, isSuccess, isError, error, status },
  ] = usePutWashesMutation();

  const handleFormChange = (e: OnchangeEventType) => {
    const { value } = e.target;
    setDescription(value);
    setInputError("");
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description) {
      return setInputError("Required");
    }

    const payload = {
      ...editData,
      description: description,
    };
    putSafeWaterSources({ oid: editData?.oid, body: payload });
  };

  // Create SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "wash",
    messageType: "update",
    response: waterSourceData,
    status,
    initialState: description,
    isToggle: true,
    setFormState: setDescription,
    toggler,
  });

  useEffect(() => {
    if (editData) {
      setDescription(editData?.description);
    }
  }, [editData]);

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
            <SaveAndBackButtons submitBtnText="Update" toggler={toggler} />
          </div>
        </div>
      </form>
    </div>
  );
}
export default WashEdit;