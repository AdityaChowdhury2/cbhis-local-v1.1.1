import { RootState } from "@/app/store";
import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import Input from "@/components/core/form-elements/Input";
import Password from "@/components/core/form-elements/Password";
import { useRecoveryPasswordMutation } from "@/features/user/user-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function PasswordForm({ toggler }) {
  // * selected edit data from redux store
  const { data: selectedData } = useSelector(
    (state: RootState) => state.modal?.addModal
  );

  // *  Local State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // *  Hokes
  const [
    recoveryPassword,
    { data, isSuccess, isError, error, status, isLoading },
  ] = useRecoveryPasswordMutation();

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Password is required");
      return;
    }
    if (confirmPassword !== password) {
      toast.error("Passwords do not match");
      return;
    }
    if (password && confirmPassword) {
      recoveryPassword({
        userAccountId: selectedData?.userAccountId,
        password: password,
        confirmPassword: confirmPassword,
        requestId: selectedData.oid,
      });
    }
  };

  // * Action After Update Password
  useEffect(() => {
    if (!isLoading && isSuccess && data?.isSuccess) {
      toast.success("Password Update Successfully");
      toggler();
    }
    if (!isLoading && isSuccess && !data?.isSuccess) {
      toast.error(data?.message);
    }
  }, [data, isSuccess, isError, error, status]);

  return (
    <div className="-mt-5">
      <form onSubmit={handleSubmit}>
        <div className="">
          <div className="flex flex-col gap-3">
            <Input value={selectedData?.username} disabled label="Username" />
            <Password
              label="Password"
              name="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Password
              label="Confirm Password"
              name="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

export default PasswordForm;
