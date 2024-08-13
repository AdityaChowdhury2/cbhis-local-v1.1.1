import DefaultModal from "@/components/core/modal/DefaultModal";
import UserForm from "@/components/users/UserForm";
import useUserForm from "@/components/users/useUserForm";
import { useCreateUserMutation } from "@/features/user/user-api";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  toggler: () => void;
};

const UserCreate = ({ toggler }: Props) => {
  const [userCreate, { isLoading }] = useCreateUserMutation();

  const {
    handleChange,
    handleNameChange,
    handleUsernameChange,
    handleCellphoneChange,
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
    checkFormValidation,
    cellphoneExist,
    usernameExist,
  } = useUserForm({ isEdit: false, prevUser: null });

  // image state
  const [imageBase64, setImageBase64] = useState();

  //
  // handle submit function // user create
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check validation
    const { isValid } = checkFormValidation();
    if (!isValid) return;

    const payload = {
      isDeleted: false,
      firstName: userData.firstName,
      middleName: userData.middleName || null,
      lastName: userData.lastName,
      pin: userData.pin,
      cellphone: userData.cellphone,
      email: userData.email || null,
      username: userData.username,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      userType: +userData?.userType,
      assignedDeviceList: selectedDevices?.length > 0 ? selectedDevices : null,
      assignedVillageList:
        selectedVillages?.length > 0 ? selectedVillages : null,
      assignedChiefdomList:
        selectedChiefdoms?.length > 0 ? selectedChiefdoms : null,
    };

    // create user
    userCreate(payload)
      .unwrap()
      .then((res) => {
        toast.dismiss();
        if (!res?.isSuccess) {
          toast.error(res?.message || "Failed to create user account");
          return;
        } else {
        }
        toast.success("User account created successfully");
        console.log(res);
        toggler();
      })
      .catch((error) => {
        console.log(error);
        toast.dismiss();
        toast.error("Failed to create user account");
        console.log(error);
      });
  };

  return (
    <div>
      <DefaultModal size="4xl" title="Create User " toggler={toggler}>
        <UserForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleUsernameChange={handleUsernameChange}
          handleNameChange={handleNameChange}
          handleCellphoneChange={handleCellphoneChange}
          userData={userData}
          inputError={inputError}
          toggler={toggler}
          regions={regions}
          tinkhundlaOptions={tinkhundlaOptions}
          chiefdomOptions={chiefdomOptions}
          villages={villages}
          devices={devices}
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
          selectedVillages={selectedVillages}
          setSelectedVillages={setSelectedVillages}
          selectedChiefdoms={selectedChiefdoms}
          setSelectedChiefdoms={setSelectedChiefdoms}
          isLoading={isLoading}
          imageBase64={imageBase64}
          setImageBase64={setImageBase64}
          cellphoneExist={cellphoneExist}
          usernameExist={usernameExist}
        />
      </DefaultModal>
    </div>
  );
};

export default UserCreate;
