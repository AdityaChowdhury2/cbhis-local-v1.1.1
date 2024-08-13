import InputUsername from "@/components/core/form-elements/InputUsername";
import { useRecoveryRequestMutation } from "@/features/user/user-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type Props = {};

const ForgotPassword = ({}: Props) => {
  const [recoveryRequest, { isLoading, isSuccess, data }] =
    useRecoveryRequestMutation();
  const navigate = useNavigate();

  // * login form state
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isNumber = new RegExp(/^[0-9]*$/);

    if (!username) {
      toast.error("Username or Cellphone is required");
      return;
    }

    if (isNumber.test(username)) {
      recoveryRequest({ cellphone: username });
      console.log("Number");
    } else {
      console.log("Username");
      recoveryRequest({ username: username });
    }
  };

  useEffect(() => {
    if (!isLoading && isSuccess && data?.isSuccess) {
      console.log("data", data);
      toast.success("Recovery Request Send Successfully");
      navigate("/");
    }
    if (!isLoading && isSuccess && !data?.isSuccess) {
      toast.error(data?.message);
    }
  }, [isLoading, isSuccess, data]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-whiteColor py-5 px-5">
      <div className="bg-white py-8 px-4 border border-borderColor rounded-lg w-full md:w-[400px]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h2 className="text-center text-2xl font-extrabold text-gray-900">
            Recovery Request
          </h2>
          {/* <p className="mt-2 text-center text-sm text-gray-600">
              Log in by entering your username and password.
            </p> */}
          <div className="space-y-4">
            <div>
              <InputUsername
                value={username}
                name="username"
                onChange={(e) => setUsername(e.target.value)}
                label="Username or Cellphone"
                placeholder="Username or Cellphone"
              />
            </div>
          </div>
          <div>
            <button
              disabled={isLoading}
              className="w-full disabled:bg-disabledColor bg-blueColor hover:bg-blueHoverBgColor p-2 rounded text-whiteColor"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
