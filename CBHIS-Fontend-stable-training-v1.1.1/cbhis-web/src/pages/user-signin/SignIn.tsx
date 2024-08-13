import InputUsername from "@/components/core/form-elements/InputUsername";
import Password from "@/components/core/form-elements/Password";
import { useLoginMutation } from "@/features/user/user-api";
import { encryptedTo } from "@/utilities/encription";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

type Props = {};

const SignIn = ({}: Props) => {
  const [userLogin, { isLoading }] = useLoginMutation();

  // login form state
  const loginState = { username: "", password: "" };
  const [loginData, setLoginData] = useState(loginState);
  const [inputError, setInputError] = useState(loginState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setInputError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check validation
    if (!loginData.username)
      setInputError((prev) => ({ ...prev, username: "Required" }));
    if (!loginData.password)
      setInputError((prev) => ({ ...prev, password: "Required" }));
    if (!loginData.username || !loginData.password) return;

    // login user
    const passwordEnc = encryptedTo(loginData.password);
    userLogin({
      username: loginData.username,
      password: passwordEnc,
    })
      .unwrap()
      .then((res) => {
        const isSuccess = !!res?.isSuccess;
        // will be updated
        if (!isSuccess) {
          toast.error("Username or password is not match");
          return;
        }
      })
      .catch((err) => {
        if (err?.status == "FETCH_ERROR") {
          toast.dismiss();
          toast.error("Network error, please try again later");
          console.log(err);
          return;
        } else {
          toast.dismiss();
          toast.error(err?.data?.message || "Failed to login");
          console.log(err);
        }
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-whiteColor py-5 px-5">
      <div className="w-full grid md:grid-cols-2 gap-9 justify-center items-center h-full max-w-[800px]">
        <div className="md:flex flex-col items-center justify-center h-full hidden border-r-2 pe-9">
          <img src="/CBHIS.png" alt="Logo" className="h-28 lg:h-40" />
          <h1 className="mt-12 text-center text-4xl  font-extrabold text-grayColor ">
            Welcome to CBHIS Central
          </h1>
        </div>

        <div className="bg-white py-8 px-4 border border-borderColor rounded-lg sm:px-10 w-[300px] xsm:w-[390px] sm:w-[500px] md:w-full">
          <div className="flex justify-center -mt-9 mb-5 md:hidden">
            <img
              src="/CBHIS.png"
              alt="Logo"
              className="h-24 xsm:h-28 sm:h-32 text-center -mt-12 bg-whiteColor"
            />
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Sign in
            </h2>
            {/* <p className="mt-2 text-center text-sm text-gray-600">
              Log in by entering your username and password.
            </p> */}
            <div className="space-y-4">
              <div>
                <InputUsername
                  value={loginData.username}
                  name="username"
                  onChange={handleChange}
                  errMsg={inputError.username}
                  label="Username"
                  placeholder="Username"
                />
              </div>
              <div>
                <Password
                  label="Password"
                  name="password"
                  errMsg={inputError.password}
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primaryColor hover:text-primaryColor"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <div>
              <button
                disabled={isLoading}
                className="w-full disabled:bg-disabledColor bg-blueColor hover:bg-blueHoverBgColor p-2 rounded text-whiteColor"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
