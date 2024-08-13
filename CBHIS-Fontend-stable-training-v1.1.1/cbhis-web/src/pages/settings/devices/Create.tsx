import DeviceForm from "@/components/device/DeviceForm";
import { OnchangeEventType } from "@/constants/api-interface/htmlEvents";
import { usePostDeviceMutation } from "@/features/devices/devices";
import useSideEffects from "@/hooks/shared/useSideEffect";
import useCreateBase from "@/hooks/useCreateBase";
import { useState } from "react";

function DeviceCreate({ toggler }) {
  // * Local State
  const [formData, setFormData] = useState({ imeiNumber: "", description: "" });
  const { createBase } = useCreateBase({});

  // input error state
  const [inputError, setInputError] = useState(null);
  // * Hokes
  const [postDevice, { data: deviceData, isSuccess, isError, error, status }] =
    usePostDeviceMutation();

  const handleFormChange = (e: OnchangeEventType) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setInputError((prev) => ({ ...prev, [name]: "" }));
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!(formData?.imeiNumber || formData?.description)) {
      if (!formData?.imeiNumber) {
        setInputError((pre) => ({ ...pre, imeiNumber: "Required" }));
      }
      if (!formData?.description) {
        setInputError((pre) => ({ ...pre, description: "Required" }));
      }
      return;
    }

    const payload = {
      ...createBase,
      imeiNumber: formData?.imeiNumber,
      description: formData?.description,
    };
    postDevice(payload);
  };

  // Create SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "device",
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
      <DeviceForm
        formData={formData}
        handleFormChange={handleFormChange}
        handleSubmit={handleSubmit}
        inputError={inputError}
        toggler={toggler}
      />
    </div>
  );
}

export default DeviceCreate;
