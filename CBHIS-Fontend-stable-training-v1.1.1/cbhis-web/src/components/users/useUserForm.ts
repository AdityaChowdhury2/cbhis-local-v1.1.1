import { TypeDeviceData } from "@/constants/api-interface/deviceDataType";
import {
  UserFormData,
  userFormValidation,
  userInitial,
} from "@/constants/api-interface/user";
import { useGetChiefdomByTinkhundlaIdQuery } from "@/features/chiefdom/chiefdom";
import { useGetAllDeviceQuery } from "@/features/devices/devices";
import { useGetAllRegionQuery } from "@/features/region/region";
import { useGetTinkhundlaByRegionIdQuery } from "@/features/tinkhundla/tinkhundla";
import { User } from "@/features/user/user-api";
import { useReadVillageByChiefdomQuery } from "@/features/village/village-api";
import { RegexPattern, TypeValidation } from "@/utilities/type-validation";
import { useState } from "react";
import { useCheckDuplicate } from "./useCheckDuplicket";

const useUserForm = ({ isEdit, prevUser }) => {
  // form state
  const [userData, setUserData] = useState<UserFormData>(userInitial);
  // form list state
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedChiefdoms, setSelectedChiefdoms] = useState([]);
  // form error state
  const [inputError, setInputError] =
    useState<Partial<UserFormData>>(userInitial);

  const { cellphoneExist, usernameExist } = useCheckDuplicate({
    username: userData?.username,
    cellphone: userData?.cellphone,
    prevUser: prevUser || null,
  });

  // handle change name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!RegexPattern.nameInput.test(value)) return;
    setUserData((prev) => ({ ...prev, [name]: value.replace(/  /g, " ") }));
    setInputError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!TypeValidation.isUserNameInput(value)) return;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setInputError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCellphoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!TypeValidation.isOnlyNumber(value)) return;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setInputError((prev) => ({ ...prev, [name]: "" }));
  };

  // handle change function
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    setInputError((prev) => ({ ...prev, [name]: "" }));

    // reset dependent fields
    if (name === "userType") {
      const reset = { regionId: "", tinkhundlaId: "", rhmChiefdomId: "" };
      setUserData((prev) => ({ ...prev, ...reset }));
      selectedChiefdoms.length && setSelectedChiefdoms([]);
      selectedVillages.length && setSelectedVillages([]);
      selectedDevices.length && setSelectedDevices([]);
      return;
    }
    if (name == "regionId") {
      const reset = { tinkhundlaId: "", rhmChiefdomId: "" };
      setUserData((prev) => ({ ...prev, ...reset }));
      selectedChiefdoms.length && setSelectedChiefdoms([]);
      selectedVillages.length && setSelectedVillages([]);
      return;
    }
    if (name == "tinkhundlaId") {
      const reset = { rhmChiefdomId: "" };
      setUserData((prev) => ({ ...prev, ...reset }));
      selectedChiefdoms.length && setSelectedChiefdoms([]);
      selectedVillages.length && setSelectedVillages([]);
      return;
    }
    if (name == "rhmChiefdomId") {
      selectedVillages.length && setSelectedVillages([]);
    }
  };

  // Get dropdown data  ------------- start ---------------------
  const { data: regionRes, isSuccess: regionSuccess } =
    useGetAllRegionQuery(undefined);
  const regions = regionRes?.data || [];

  // Get Tinkhundla by region id
  const { data: tinkhundlaRes, isSuccess: tinkhundlaSuccess } =
    useGetTinkhundlaByRegionIdQuery(
      { id: userData?.regionId },
      { skip: !userData?.regionId, refetchOnMountOrArgChange: true }
    );

  const tinkhundlaOptions = tinkhundlaRes?.data;
  // Get Chiefdom by Tinkhundla id
  const { data: chiefdomRes, isSuccess: chiefdomSuccess } =
    useGetChiefdomByTinkhundlaIdQuery(
      { tinkhundlaId: userData?.tinkhundlaId },
      {
        skip: !userData?.tinkhundlaId,
        refetchOnMountOrArgChange: true,
      }
    );
  const chiefdomOptions = chiefdomRes?.data || [];

  // Get Village by Chiefdom id
  const { data: villageRes, isSuccess: villageSuccess } =
    useReadVillageByChiefdomQuery(
      { chiefdomId: userData?.rhmChiefdomId },
      { skip: !userData?.rhmChiefdomId, refetchOnMountOrArgChange: true }
    );
  const villages = villageRes?.data || [];
  // Get Device data
  const { data: deviceRes } = useGetAllDeviceQuery(undefined);
  //@ts-ignore
  const devices: TypeDeviceData[] = deviceRes?.data || [];
  // Get dropdown data  ------------- end ---------------------

  // const checkExist = () => {
  //   let usernameExist = ""; // Username already exist
  //   let cellphoneExist = ""; // Cellphone already exist

  //   // if (cellphoneError || !checkPhone || !cellphoneRes?.oid) {
  //   //   usernameExist = "";
  //   // } else {
  //   //   if (isEdit) {
  //   //     if (cellphoneRes?.oid && editOid !== cellphoneRes?.oid) {
  //   //       usernameExist = "Username already exist";
  //   //     }
  //   //   } else if (!isEdit) {
  //   //     if (cellphoneRes?.oid) {
  //   //       usernameExist = "Username already exist";
  //   //     }
  //   //   }
  //   // }

  //   if (usernameError || !checkUsername || usernameRes?.data === null) {
  //     usernameExist = "";
  //   } else {
  //     if (isEdit) {
  //       if (
  //         usernameRes?.data?.oid &&
  //         prevUser?.oid !== usernameRes?.data?.oid
  //       ) {
  //         usernameExist = "Username already exist";
  //       }
  //     } else if (!isEdit) {
  //       if (usernameRes?.data?.oid) {
  //         usernameExist = "Username already exist";
  //       }
  //     }
  //   }
  //   return { usernameExist, cellphoneExist };
  // };
  // const exist = checkExist();

  // Check validation
  const checkFormValidation = () => {
    const { errors, isValid } = userFormValidation(
      userData,
      {
        isSelectedDevices: selectedDevices?.length > 0,
        isSelectedVillages: selectedVillages?.length > 0,
        isSelectedChiefdoms: selectedChiefdoms?.length > 0,
      },
      { isEdit },
      { usernameExist, cellphoneExist }
    );
    console.log(errors);

    if (!isValid) setInputError(errors);
    return { isValid };
  };

  // create user payload
  type EditProps = { user?: User; isEdit: boolean };
  const createPayload = ({ user = null, isEdit = false }: EditProps) => {
    const editAdditionalData = isEdit
      ? {
          key: user?.oid,
          ...user,
        }
      : {};

    const payload = {
      ...editAdditionalData,
      isDeleted: false,
      firstName: userData.firstName,
      middleName: userData.middleName,
      lastName: userData.lastName,
      pin: userData.pin,
      cellphone: userData.cellphone,
      email: userData.email,
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
    return payload;
  };

  return {
    userData,
    handleChange,
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
    createPayload,
    setUserData,
    setInputError,
    userInitial,
    regionSuccess,
    tinkhundlaSuccess,
    chiefdomSuccess,
    villageSuccess,
    handleNameChange,
    handleUsernameChange,
    handleCellphoneChange,
    cellphoneExist,
    usernameExist,
  };
};

export default useUserForm;
