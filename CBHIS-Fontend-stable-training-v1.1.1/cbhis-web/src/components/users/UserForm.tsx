import {
  EnumUserType,
  TypeUserFormErrors,
  UserFormData,
} from "@/constants/api-interface/user";
import React, { ChangeEvent } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaUser } from "react-icons/fa";
import SaveAndBackButtons from "../core/buttons/SaveAndBackButtons";
import CustomSelectInput from "../core/form-elements/CustomSelectInput";
import Input from "../core/form-elements/Input";
import InputUsername from "../core/form-elements/InputUsername";
import Password from "../core/form-elements/Password";
import Select from "../core/form-elements/Select";
import { PassStrength } from "../pass-strength/PassStrength";

type Props = {
  toggler: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCellphoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userData: UserFormData;
  inputError: TypeUserFormErrors;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  selectedDevices: number[];
  setSelectedDevices: React.Dispatch<React.SetStateAction<number[]>>;
  selectedVillages: number[];
  setSelectedVillages: React.Dispatch<React.SetStateAction<number[]>>;
  selectedChiefdoms: number[];
  setSelectedChiefdoms: React.Dispatch<React.SetStateAction<number[]>>;
  userAssignedDevices?: number[];
  isEdit?: boolean;
  imageBase64?: string;
  setImageBase64?: React.Dispatch<React.SetStateAction<string>>;
  usernameExist: string;
  cellphoneExist: string;

  regions: any[];
  tinkhundlaOptions: any[];
  chiefdomOptions: any[];
  villages: any[];
  devices: any[];
};

const UserForm = ({
  toggler,
  handleChange,
  handleNameChange,
  handleUsernameChange,
  handleCellphoneChange,
  handleSubmit,
  userData,
  inputError,
  regions,
  tinkhundlaOptions,
  chiefdomOptions,
  villages,
  devices,
  selectedDevices,
  setSelectedDevices,
  selectedVillages,
  setSelectedVillages,
  selectedChiefdoms,
  setSelectedChiefdoms,
  isLoading,
  isEdit = false,
  // userAssignedDevices = [],
  imageBase64,
  setImageBase64,
  usernameExist,
  cellphoneExist,
}: Props) => {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader?.readAsDataURL(file);
      reader.onload = () => {
        const base64WithogitutPrefix = (reader?.result as string)?.split(
          ","
        )[1];

        setImageBase64(base64WithogitutPrefix);
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

  // handle device option filtering
  const filteredDevices = () => {
    return true;
    // console.log(d);
    // if (isEdit && userAssignedDevices.includes(d.oid)) return true;
    // // if (d?.userOid) return false;
  };

  const isWithImage = false;

  return (
    <div className="">
      <form onSubmit={handleSubmit}>
        <div className={`grid md:grid-cols-${isWithImage ? 3 : 2}`}>
          <div className="col-span-2 grid sm:grid-cols-2 gap-4">
            {/* Name Section */}
            <div className="col-span-full gap-4 grid grid-cols-1 lg:grid-cols-3 ">
              <Input
                name="firstName"
                value={userData?.firstName}
                errMsg={inputError?.firstName}
                onChange={handleNameChange}
                max={30}
                required
                label="First Name"
              />
              <Input
                name="middleName"
                value={userData.middleName}
                errMsg={inputError?.middleName}
                max={30}
                onChange={handleNameChange}
                label="Middle Name"
              />
              <Input
                name="lastName"
                value={userData?.lastName}
                errMsg={inputError?.lastName}
                onChange={handleNameChange}
                max={30}
                required
                label="Last Name"
              />
            </div>

            {/* Contract section */}
            <div className="col-span-full gap-4 grid grid-cols-1 lg:grid-cols-3 ">
              {/* PIN */}
              <Input
                name="pin"
                value={userData.pin}
                errMsg={inputError?.pin}
                max={50}
                onChange={handleChange}
                required
                label="PIN"
                type="text"
              />
              {/* CELLPHONE */}
              <Input
                name="cellphone"
                value={userData.cellphone}
                errMsg={cellphoneExist || inputError?.cellphone}
                max={50}
                onChange={handleCellphoneChange}
                required
                label="Cellphone"
                type="text"
              />
              {/* EMAIL */}
              <Input
                name="email"
                value={userData.email}
                errMsg={inputError?.email}
                max={50}
                onChange={handleChange}
                label="Email"
                type="text"
              />
            </div>

            <div className="col-span-full">
              {/* USER TYPE */}
              <Select
                name="userType"
                onChange={handleChange}
                value={userData?.userType}
                errMsg={inputError?.userType}
                required
                label="Role"
              >
                {Object?.entries(EnumUserType).map(([oid, des]) => (
                  <option key={oid} value={oid}>
                    {des}
                  </option>
                ))}
              </Select>
            </div>

            {/* Supervisor Only Section */}
            {userData?.userType == "2" && (
              // Supervisor
              <div className="col-span-full gap-4 grid grid-cols-1 lg:grid-cols-2 ">
                {/* REGION */}
                <Select
                  required
                  name="regionId"
                  value={userData?.regionId}
                  errMsg={inputError?.regionId}
                  onChange={handleChange}
                  label="Region"
                >
                  {regions?.map((data) => (
                    <option key={data?.oid} value={data?.oid}>
                      {data?.description}
                    </option>
                  ))}
                </Select>

                {/* TINKHUNDLA */}
                <Select
                  required
                  name="tinkhundlaId"
                  value={userData?.tinkhundlaId}
                  errMsg={inputError?.tinkhundlaId}
                  onChange={handleChange}
                  label="Tinkhundla"
                >
                  {tinkhundlaOptions
                    ?.filter((d) => d.regionId == userData?.regionId)
                    .map((d) => (
                      <option key={d?.oid} value={d?.oid}>
                        {d.description}
                      </option>
                    ))}
                </Select>

                {/* Chiefdoms SEARCHABLE select */}
                <div className="col-span-full">
                  <CustomSelectInput
                    errMsg={inputError?.selectedChiefdoms}
                    required
                    label="Chiefdoms"
                    options={chiefdomOptions || []}
                    selectedOptions={selectedChiefdoms}
                    setSelectedOptions={setSelectedChiefdoms}
                  />
                </div>
              </div>
            )}

            {/* RHM Only Section*/}
            {userData?.userType == "3" && (
              // RHM
              <div className="col-span-full gap-4 grid grid-cols-1 lg:grid-cols-3 ">
                {/* REGION FOR RHM */}
                <Select
                  required
                  name="regionId"
                  value={userData?.regionId}
                  errMsg={inputError?.regionId}
                  onChange={handleChange}
                  label="Region"
                >
                  {regions?.map((data) => (
                    <option key={data?.oid} value={data?.oid}>
                      {data?.description}
                    </option>
                  ))}
                </Select>

                {/* TINKHUNDLE FOR RHM */}
                <Select
                  required
                  name="tinkhundlaId"
                  value={userData?.tinkhundlaId}
                  errMsg={inputError?.tinkhundlaId}
                  onChange={handleChange}
                  label="Tinkhundla"
                >
                  {tinkhundlaOptions
                    ?.filter((d) => d.regionId == userData?.regionId)
                    .map((d) => (
                      <option key={d?.oid} value={d?.oid}>
                        {d.description}
                      </option>
                    ))}
                </Select>

                {/* CHIEFDOMS SEARCHABLE SELECT */}
                <Select
                  name="rhmChiefdomId"
                  value={userData?.rhmChiefdomId}
                  errMsg={inputError?.rhmChiefdomId}
                  onChange={handleChange}
                  required
                  label="Chiefdoms"
                >
                  {chiefdomOptions?.map((data) => (
                    <option key={data?.oid} value={data?.oid}>
                      {data?.description}
                    </option>
                  ))}
                </Select>

                {/* VILLAGES */}
                <div className="col-span-full">
                  <CustomSelectInput
                    errMsg={inputError?.selectedVillages}
                    required
                    label="Villages"
                    options={villages || []}
                    selectedOptions={selectedVillages}
                    setSelectedOptions={setSelectedVillages}
                  />
                </div>

                {/* DEVICES */}
                <div className="col-span-full">
                  <CustomSelectInput
                    errMsg={inputError?.selectedDevices}
                    label="Devices"
                    required
                    options={
                      devices?.filter(filteredDevices)?.map((d) => ({
                        ...d,
                        oid: d?.oid,
                        description:
                          d?.description + ` (${d?.imeiNumber || ""})`,
                      })) || []
                    }
                    selectedOptions={selectedDevices}
                    setSelectedOptions={setSelectedDevices}
                  />
                </div>
              </div>
            )}

            {/* Login Information Section */}
            {isEdit ? null : (
              <div className="col-span-full gap-4 grid grid-cols-1 lg:grid-cols-3 ">
                {/* USERNAME */}
                <InputUsername
                  name="username"
                  onChange={handleUsernameChange}
                  value={userData.username}
                  errMsg={usernameExist || inputError?.username}
                  required
                  max={90}
                  label="Username"
                />

                {/* PASSWORD */}
                <div>
                  <Password
                    name="password"
                    value={userData.password}
                    errMsg={inputError?.password}
                    onChange={handleChange}
                    required
                    max={30}
                    label="Password"
                  />
                  {inputError?.password ? (
                    ""
                  ) : (
                    <PassStrength password={userData.password} />
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <Password
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  errMsg={inputError?.confirmPassword}
                  onChange={handleChange}
                  required
                  max={30}
                  label="Confirm Password"
                />
              </div>
            )}
          </div>

          {/* Profile Picture */}
          {false && (
            <div className="col-span-full md:col-span-1 flex justify-start md:justify-center items-start mt-5 md:mt-0">
              {/* PROFILE PICTURE */}
              <div className="flex flex-col gap-2 md:justify-end">
                <h3 className="mb-2 font-medium text-grayColor text-center">
                  Profile Picture
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="h-44 w-44 max-h-[176px] max-w-[176px] rounded-lg border border-borderColor">
                    {imageBase64?.length ? (
                      <img
                        src={`data:image/png;base64,${imageBase64}`}
                        height={170}
                        width={170}
                        alt="profile"
                        className="object-cover h-full w-full rounded-lg"
                      />
                    ) : (
                      <div className="flex justify-center items-center text-borderColor h-full">
                        <FaUser size={120} className="w-full" />
                      </div>
                    )}
                  </div>

                  {/* IMAGE LABEL */}

                  <div
                    className={`relative border border-violetColor rounded-md mt-1 hover:bg-borderColor`}
                  >
                    <label
                      title="Click to upload"
                      htmlFor="fileInput"
                      className="cursor-pointer flex items-center gap-4 text-textColor px-5 py-3 rounded-xl bg-whiteColor text-violetColor whitespace-nowrap font-semibold hover:bg-borderColor"
                    >
                      <FaCamera />
                      <p className="mt-0.5 block text-violetColor">
                        Select Image
                      </p>
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
              </div>
            </div>
          )}
          <div className="mt-5 col-span-full">
            <SaveAndBackButtons
              disableSubmit={isLoading}
              submitBtnText={isEdit ? "Update User" : "Add User"}
              toggler={toggler}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
