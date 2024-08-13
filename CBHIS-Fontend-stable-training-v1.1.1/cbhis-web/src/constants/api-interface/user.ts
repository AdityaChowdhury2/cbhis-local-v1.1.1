import { TypeValidation } from "@/utilities/type-validation";

export type UserExist = {
  usernameExist: string;
  cellphoneExist: string;
};

export const userFormValidation = (
  userData: UserFormData,
  { isSelectedDevices, isSelectedVillages, isSelectedChiefdoms },
  { isEdit }: { isEdit: boolean },
  { usernameExist, cellphoneExist }: UserExist
) => {
  const errors: TypeUserFormErrors = {};

  // name
  if (!userData.firstName) errors.firstName = "Required";
  if (userData?.firstName) {
    if (userData.firstName.length < 2) errors.firstName = "Minium 2 characters";
    if (userData.firstName.length > 30)
      errors.firstName = "Maximum 30 characters";
  }
  if (userData.middleName && userData?.middleName?.length > 30)
    errors.middleName = "Maximum 30 characters";
  if (!userData.lastName) errors.lastName = "Required";

  if (userData?.lastName) {
    if (userData?.lastName && userData.lastName.length < 2)
      errors.lastName = "Minium 2 characters";
    if (userData?.lastName && userData.lastName.length > 30)
      errors.lastName = "Maximum 30 characters";
  }

  // contacts
  if (!userData.pin) errors.pin = "Required";
  if (userData?.pin && userData.pin.length > 13)
    errors.pin = "Maximum 13 characters";

  if (!userData.cellphone) errors.cellphone = "Required";
  if (userData?.cellphone) {
    if (userData.cellphone.length > 20)
      errors.cellphone = "Maximum 13 characters";
  }

  // if (!userData.email) errors.email = "Required";
  if (userData.email && userData.email?.length > 50)
    errors.email = "Maximum 50 characters";
  if (userData?.email && !TypeValidation.isEmail(userData.email))
    errors.email = "Invalid email";

  // no need to validate username and password for edit (hide ele)
  if (!isEdit) {
    // login info
    if (!userData.username) errors.username = "Required";
    if (userData.username) {
      if (userData.username.length < 4)
        errors.username = "Minimum 4 characters";
      if (userData.username.length > 90)
        errors.username = "Maximum 90 characters";
    }

    if (!userData.password) errors.password = "Required";
    if (userData.password) {
      if (userData.password.length < 6)
        errors.password = "Minimum 6 characters";
      if (userData.password.length > 30)
        errors.password = "Maximum 30 characters";
    }

    if (!userData.confirmPassword) errors.confirmPassword = "Required";
    if (
      userData.password &&
      userData.confirmPassword &&
      userData.password !== userData.confirmPassword
    )
      errors.confirmPassword = "Password does not match";
  }

  if (!userData.userType) errors.userType = "Required";

  if (userData.userType === "2") {
    if (!userData.regionId) errors.regionId = "Required";
    if (!userData.tinkhundlaId) errors.tinkhundlaId = "Required";
    if (!isSelectedChiefdoms) {
      errors.selectedChiefdoms = "Required";
    }
  }

  if (userData.userType == "3") {
    if (!userData.regionId) errors.regionId = "Required";
    if (!userData.tinkhundlaId) errors.tinkhundlaId = "Required";
    if (!userData.rhmChiefdomId) errors.rhmChiefdomId = "Required";
    // let type field validation
    if (!isSelectedVillages) errors.selectedVillages = "Required";
    if (!isSelectedDevices) errors.selectedDevices = "Required";
  }

  // username and cellphone exist
  if (!isEdit && usernameExist) errors.username = usernameExist;
  if (cellphoneExist) errors.cellphone = cellphoneExist;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const userInitial = {
  firstName: "",
  middleName: "",
  lastName: "",
  pin: "",
  cellphone: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  userType: "",
  superVisorId: "",
  chiefdomId: "",
  //
  regionId: "",
  tinkhundlaId: "",
  rhmChiefdomId: "",
};

export const EnumUserType = {
  1: "Administrator",
  2: "Supervisor",
  3: "RHM",
};

export type UserFormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  pin: string;
  cellphone: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  userType: string;
  //
  regionId: string;
  tinkhundlaId: string;
  rhmChiefdomId: string;
};

export type TypeUserFormErrors = Partial<UserFormData> & {
  selectedDevices?: string;
  selectedVillages?: string;
  selectedChiefdoms?: string;
};
