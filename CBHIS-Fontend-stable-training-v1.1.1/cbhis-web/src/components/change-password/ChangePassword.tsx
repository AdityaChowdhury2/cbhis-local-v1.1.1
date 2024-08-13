import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import { logout } from "@/features/authentication/authentication-slice";
import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { useUpdatePasswordMutation } from "@/features/user/user-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import Input from "../core/form-elements/Input";
import Password from "../core/form-elements/Password";

function ChangePassword({ toggler }) {
  // * Local State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currPassword, setCurrPassword] = useState("");

  // * Hokes
  const [updatePassword, { isLoading, isSuccess, data, error }] =
    useUpdatePasswordMutation();
  const dispatch = useDispatch();

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else if (password && confirmPassword && currPassword && username) {
      updatePassword({
        username: username,
        password: currPassword,
        newPassword: password,
        confirmPassword,
      });
    } else {
      toast.error("All Fields are Required");
    }
  };

  // * Action After Update Password
  useEffect(() => {
    console.log("error", error);
    if (!isLoading && isSuccess && data?.isSuccess) {
      toast.success("Password Update Successfully");
      closeModal();
      handleLogout();
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
              label="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Password
              label="Current Password"
              required
              value={currPassword}
              onChange={(e) => setCurrPassword(e.target.value)}
            />

            <Password
              label="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Password
              label="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="mt-5 col-span-full">
            <SaveAndBackButtons
              submitBtnText={isLoading ? "Loading ..." : "Update"}
              toggler={toggler}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;
