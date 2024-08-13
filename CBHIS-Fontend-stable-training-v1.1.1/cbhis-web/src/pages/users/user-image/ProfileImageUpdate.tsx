import { RootState } from "@/app/store";
import SaveAndBackButtons from "@/components/core/buttons/SaveAndBackButtons";
import { useProfileImageMutation } from "@/features/user/user-api";
import useSideEffects from "@/hooks/shared/useSideEffect";
import React, { ChangeEvent } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";

const ProfileImageUpdate = ({ toggler }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // image base64 state
  const [imageBase64, setImageBase64] = React.useState<string>("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader?.readAsDataURL(file);
      reader.onload = () => {
        const base64WithoutPrefix = (reader?.result as string)?.split(",")[1];

        setImageBase64(base64WithoutPrefix);
      };

      reader.onerror = (error) => {
        console.error(
          "Error occurred while converting image to base64:",
          error
        );
      };
    } else {
      toast.error("Please select a valid image file (JPEG or PNG)");
    }
  };

  //   const { data: userData } = useGetProfileImageQuery(user?.oid);

  // update user account mutation
  const [profileImage, { data, error, isError, isSuccess, status }] =
    useProfileImageMutation();

  // * Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!imageBase64) {
      toast.error("Image is Required!");
    }

    const payload = {
      key: user?.oid,
      body: { oid: user?.oid, image: imageBase64 },
    };
    profileImage(payload);
  };

  // Update SideEffect
  useSideEffects({
    error,
    isError,
    isSuccess,
    message: "device",
    messageType: "create",
    response: data,
    status,
    initialState: imageBase64,
    isToggle: true,
    setFormState: setImageBase64,
    toggler,
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col justify-center items-center">
        <div className="h-44 w-44 max-h-[176px] max-w-[176px] rounded-lg border border-borderColor">
          {imageBase64?.length ? (
            <img
              src={`data:image/png;base64,${imageBase64}`}
              height={170}
              width={170}
              alt="profile"
              className="object-contain h-full w-full rounded-lg"
            />
          ) : (
            <>
              {user?.profilePicture?.image ? (
                <img
                  src={`data:image/png;base64,${user?.profilePicture?.image}`}
                  height={170}
                  width={170}
                  alt="profile"
                  className="object-contain h-full w-full rounded-lg"
                />
              ) : (
                <div className="flex justify-center items-center text-borderColor h-full">
                  <FaUser size={120} className="w-full" />
                </div>
              )}
            </>
          )}
        </div>
        <div
          className={`relative border border-violetColor rounded-md mt-1 hover:bg-borderColor`}
        >
          <label
            title="Click to upload"
            htmlFor="fileInput"
            className="cursor-pointer flex items-center gap-4 text-textColor px-5 py-3 rounded-xl bg-whiteColor text-violetColor whitespace-nowrap font-semibold hover:bg-borderColor"
          >
            <FaCamera />
            <p className="mt-0.5 block text-violetColor">Select Image</p>
          </label>

          {/* IMAGE */}

          <input
            title="Attach File"
            className="w-fit mb-5 hidden"
            name="image"
            onChange={(event) => {
              handleImageChange(event);
            }}
            type="file"
            id="fileInput"
            accept={".jpg,.png"}
          />
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <SaveAndBackButtons toggler={toggler} />
      </div>
    </form>
  );
};

export default ProfileImageUpdate;
