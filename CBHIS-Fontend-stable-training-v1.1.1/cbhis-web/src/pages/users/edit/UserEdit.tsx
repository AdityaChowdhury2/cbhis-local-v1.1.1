import { RootState, useAppDispatch } from "@/app/store";
import DefaultModal from "@/components/core/modal/DefaultModal";
import UserForm from "@/components/users/UserForm";
import useUserForm from "@/components/users/useUserForm";
import { chiefdomAPIEndpoints } from "@/features/chiefdom/chiefdom";
import { tinkhundlaAPIEndpoints } from "@/features/tinkhundla/tinkhundla";
import {
  TypeUserByKey,
  User,
  useGetUserByKeyQuery,
  useUpdateUserMutation,
} from "@/features/user/user-api";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type Props = {
  toggler: () => void;
};

const UserEdit = ({ toggler }: Props) => {
  const { editModal } = useSelector((state: RootState) => state.modal);
  const selectedUser: User = editModal?.data || {};
  console.log(selectedUser);

  const appDispatch = useAppDispatch();

  //@ts-ignore
  const { data: userRes } = useGetUserByKeyQuery(selectedUser?.oid, {
    skip: !selectedUser?.oid,
    refetchOnMountOrArgChange: true,
  });

  //@ts-ignore
  const user: TypeUserByKey = userRes?.data || {};

  const [userUpdate, { isLoading }] = useUpdateUserMutation();

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
    setUserData,
    setInputError,
    userInitial,
  } = useUserForm({ isEdit: true, prevUser: user });

  // handle submit function // user update
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // check validation
    const { isValid } = checkFormValidation();
    console.log(isValid);

    if (!isValid) return;

    const payload = {
      key: user?.oid,
      oid: user?.oid,
      isDeleted: user?.isDeleted,
      username: user.username,
      // password: user?.password,
      // confirmPassword: user?.confirmPassword,

      // editable keys
      firstName: userData.firstName,
      middleName: userData.middleName || null,
      lastName: userData.lastName,
      pin: userData.pin,
      cellphone: userData.cellphone,
      email: userData.email || null,
      userType: +userData?.userType,
      assignedDeviceList: selectedDevices?.length > 0 ? selectedDevices : null,
      assignedVillageList:
        selectedVillages?.length > 0 ? selectedVillages : null,
      assignedChiefdomList:
        selectedChiefdoms?.length > 0 ? selectedChiefdoms : null,
    };

    // update user
    userUpdate(payload)
      .unwrap()
      .then((res) => {
        console.log(res);
        toggler();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //  It can be use on form for filtering dropdown item
  const [userAssignedDevices, setUserAssignedDevices] = useState([]);
  const [userAssignedVillages, setUserAssignedVillages] = useState([]);
  const [userAssignedChiefdoms, setUserAssignedChiefdoms] = useState([]);
  console.log(userAssignedChiefdoms, userAssignedDevices, userAssignedVillages);

  // Set user data to form
  useEffect(() => {
    if (user) {
      const formatUserForm = {
        userType: user?.userType?.toString(),
        username: user?.username,
        firstName: user?.firstName,
        middleName: user?.middleName,
        lastName: user?.lastName,
        cellphone: user?.cellphone,
        email: user?.email,
        pin: user?.pin,
      };
      setUserData((prev) => ({ ...prev, ...formatUserForm }));
      setInputError(userInitial);
    }
    if (user?.userType == 3) {
      if (user?.assignedDevices?.length) {
        setSelectedDevices(user?.assignedDevices?.map((d) => d.device?.oid));
        setUserAssignedDevices(
          user?.assignedDevices?.map((d) => d.device?.oid)
        );
      }
    }

    if (user?.assignedVillages?.length && user?.userType == 3) {
      const rhmChiefdomId =
        user?.assignedVillages[0]?.village?.chiefdomId?.toString();
      rhmChiefdomId &&
        appDispatch(
          chiefdomAPIEndpoints.getSingleChiefdom.initiate(rhmChiefdomId)
        )
          .unwrap()
          .then((chief) => {
            const tinkhundlaId = chief?.data?.inkhundlaId?.toString();
            tinkhundlaId &&
              appDispatch(
                tinkhundlaAPIEndpoints.getSingleTinkhundla.initiate(
                  tinkhundlaId
                )
              )
                .unwrap()
                .then((tink) => {
                  const regionId = tink?.data?.regionId?.toString();
                  regionId &&
                    setUserData((prev) => ({
                      ...prev,
                      regionId,
                      tinkhundlaId,
                      rhmChiefdomId,
                    }));
                  setSelectedVillages(
                    user?.assignedVillages.map((v) => v.village.oid)
                  );
                  setUserAssignedVillages(
                    user?.assignedVillages.map((v) => v.village.oid)
                  );
                });
          });
    }
    if (user?.assignedChiefdoms?.length && user?.userType == 2) {
      const tinkhundlaId =
        user?.assignedChiefdoms?.[0]?.chiefdom?.inkhundlaId?.toString();
      tinkhundlaId &&
        appDispatch(
          tinkhundlaAPIEndpoints.getSingleTinkhundla.initiate(tinkhundlaId)
        )
          .unwrap()
          .then((tink) => {
            const regionId = tink?.data?.regionId?.toString();
            regionId &&
              setUserData((prev) => ({ ...prev, regionId, tinkhundlaId }));
            setSelectedVillages(
              user?.assignedVillages.map((v) => v.village.oid)
            );
            setUserAssignedVillages(
              user?.assignedVillages.map((v) => v.village.oid)
            );
          });

      setSelectedChiefdoms(user?.assignedChiefdoms.map((c) => c.chiefdom?.oid));
      setUserAssignedChiefdoms(
        user?.assignedChiefdoms.map((c) => c.chiefdom?.oid)
      );
    }
  }, [user]);

  return (
    <div>
      <DefaultModal size="3xl" title="Edit User " toggler={toggler}>
        <UserForm
          handleCellphoneChange={handleCellphoneChange}
          cellphoneExist={cellphoneExist}
          usernameExist={usernameExist}
          handleSubmit={handleSubmit}
          handleNameChange={handleNameChange}
          handleUsernameChange={handleUsernameChange}
          handleChange={handleChange}
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
          isEdit
          userAssignedDevices={userAssignedDevices}
        />
      </DefaultModal>
    </div>
  );
};

export default UserEdit;
