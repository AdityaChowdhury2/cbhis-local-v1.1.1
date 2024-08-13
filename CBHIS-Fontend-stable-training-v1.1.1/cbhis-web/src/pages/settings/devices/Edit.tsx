import { RootState } from "@/app/store";
import DeviceForm from "@/components/device/DeviceForm";
import { OnchangeEventType } from "@/constants/api-interface/htmlEvents";
import { usePutDeviceMutation } from "@/features/devices/devices";
import useSideEffects from "@/hooks/shared/useSideEffect";
import useEditBase from "@/hooks/useEditBase";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function DeviceEdit({ toggler }) {
  // selected edit data from redux store
  const { data: editData } = useSelector(
    (state: RootState) => state.modal?.editModal
  );

  // * Local State
  const [formData, setFormData] = useState({ imeiNumber: "", description: "" });
  const { editBase } = useEditBase({});

  // input error state
  const [inputError, setInputError] = useState(null);
  // * Hokes
  const [putDevice, { data: deviceData, isSuccess, isError, error, status }] =
    usePutDeviceMutation();

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

    if (!formData?.description) {
      return setInputError((pre) => ({ ...pre, description: "Required" }));
    }
    const payload = {
      ...editData,
      ...editBase,
      imeiNumber: formData?.imeiNumber,
      description: formData?.description,
    };
    putDevice({ oid: editData?.oid, body: payload });
  };

  // Edit SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "device",
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
        imeiNumber: editData?.imeiNumber,
        description: editData?.description,
      });
    }
  }, [editData]);

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

export default DeviceEdit;
