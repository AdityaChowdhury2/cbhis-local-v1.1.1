import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Response {
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

interface Props {
  isSuccess: boolean;
  status: string;
  isError: boolean;
  error: FetchBaseQueryError | SerializedError | { data: string } | null;
  toggler?: () => void;
  response: Response | null;
  initialState?: unknown; // Change 'any' to the type of your initial state
  setFormState?: (state: unknown) => void; // Change 'any' to the type of your form state
  message: string;
  messageType: "create" | "update" | "delete" | "uninstall";
  isToggle?: boolean;
  successMsg?: string;
  errorMsg?: string;
}

const useSideEffects = ({
  isSuccess,
  status,
  isError,
  error,
  toggler,
  response,
  initialState,
  setFormState,
  message,
  messageType,
  isToggle,
  successMsg,
  errorMsg,
}: Props) => {
  
  useEffect(() => {
    if (isSuccess && status === "fulfilled" && response?.isSuccess) {
      toast.dismiss();
      toast.success(
        successMsg
          ? successMsg
          : `${
              message.charAt(0)?.toUpperCase() + message?.slice(1)
            } has been ${messageType}d successfully`
      );
      initialState && setFormState(initialState);
      isToggle && toggler();
    } else if (isError && error && "data" in error) {
      toast.dismiss();
      toast.error(
        typeof error?.data === "string"
          ? error?.data
          : `Error ${messageType}ing ${message}.`
      );
    } else if (isSuccess && response?.statusCode !== 200) {
      toast.dismiss();
      toast.error(errorMsg ? errorMsg : response?.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, status, isError, error, response?.isSuccess]);
};

export default useSideEffects;
