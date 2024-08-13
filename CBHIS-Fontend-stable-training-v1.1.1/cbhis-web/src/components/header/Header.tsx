import { RootState } from "@/app/store";
import { EnumUserType } from "@/constants/api-interface/user";
import { userModalTypes } from "@/constants/modal-types/modal-types";
import { logout } from "@/features/authentication/authentication-slice";
import {
  closeAddModal,
  closeEditModal,
  openAddModal,
  openEditModal,
} from "@/features/modal/modal-slice";
import { setSidebarOpen } from "@/features/sidebar/sidebar";
import ProfileImageUpdate from "@/pages/users/user-image/ProfileImageUpdate";
import { styles } from "@/utilities/cn";
import nameProfile from "@/utilities/name-to-profile";
import { isTrainingPortal } from "@/utilities/training";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import ChangePassword from "../change-password/ChangePassword";
import DefaultModal from "../core/modal/DefaultModal";
import ThemeSwitcher from "../core/theme/theme-switcher";
import NotificationDropdown from "../notifications/NotificationDropdown";

// * Header component
const Header = () => {
  const { sidebarOpen } = useSelector((store: RootState) => store.sidebar);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { editModal, addModal } = useSelector(
    (state: RootState) => state.modal
  );

  // * Password Change Modal Open
  const handleOpenPasswordForm = () => {
    setDropDown(false);
    dispatch(
      openAddModal({
        modalId: userModalTypes.passwordChange,
        data: null,
      })
    );
  };

  // * Password Change Modal Open
  const handleProfileImage = () => {
    setDropDown(false);
    dispatch(
      openEditModal({
        modalId: userModalTypes.profileImage,
        data: null,
      })
    );
  };

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * ropdown state
  const [dropdown, setDropDown] = useState(false);

  // * Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };

  // * User Info
  const userInfo = () => {
    let name = "";
    if (user?.firstName) name += user?.firstName;
    if (user?.middleName) name += " " + user?.middleName;
    if (user?.lastName) name += " " + user?.lastName;
    const userType = EnumUserType[user?.userType] || "";
    return { name, userType };
  };

  // * handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdown !== false && !target.closest(".dropdown-container")) {
        setDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdown]);

  return (
    <>
      <div className="navbar bg-whiteColor min-h-[2rem] !max-h-[3rem] px-5 z-10 fixed top-0 border-b border-borderColor flex justify-between">
        <div className="flex gap-3">
          <FaBars
            onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
            className="cursor-pointer"
          />
          <h2>CBHIS Central</h2>
        </div>

        {/* TRAINING TEXT */}
        {isTrainingPortal && (
          <div className="text-redColor text-sm me-5">Training Portal </div>
        )}

        <div>
          {/* NOTIFICATION DROPDOWN */}
          <NotificationDropdown />
          <div className="flex items-center dropdown gap-2 z-50">
            <div className="relative">
              <button
                onClick={() => setDropDown(!dropdown)}
                className="flex items-center gap-2 text-textColor dropdown-container"
              >
                {/* USER PROFILE */}
                <div className="hidden sm:block">
                  <p
                    className={`text-textColor text-xs font-medium capitalize text-end`}
                  >
                    {userInfo().name}
                  </p>

                  {/* USER ROLE */}
                  <p
                    className={`text-grayColor text-[10px] font-medium text-end `}
                  >
                    {userInfo().userType}
                  </p>
                </div>

                {/* <FaUserCircle
                  className={`w-[30px] h-[30px] text-grayColor bg-lightBlue rounded-full cursor-pointer `}
                /> */}
                {user?.profilePicture?.image ? (
                  <img
                    src={`data:image/png;base64,${user?.profilePicture?.image}`}
                    alt=""
                    className="w-[35px] h-[35px] object-contain border rounded-full"
                  />
                ) : (
                  <div
                    className={`w-[35px] h-[35px] text-grayColor bg-lightGrayColor border border-borderColor flex justify-center items-center rounded-full cursor-pointer `}
                  >
                    {nameProfile(userInfo()?.name)}
                  </div>
                )}

                {/* USER NAME */}
              </button>

              {/* DROPDOWN */}
              <div
                className={styles(
                  "absolute top-9 right-0 menu shadow bg-bgColor border rounded overflow-hidden p-0 m-0 w-[250px] 2xl:w-[300px] dropdown-container dropdownList",
                  { hidden: !dropdown }
                )}
              >
                {/* USER NAME AND ROLE */}
                <li className="w-full rounded-b-none">
                  <div className="text-center flex flex-col border-b py-2 2xl:py-4 text-textColor capitalize text-sm 2xl:text-base">
                    {userInfo().name}
                    <span className="text-xs 2xl:text-sm">
                      {userInfo().userType}
                    </span>
                  </div>
                </li>

                {/* Profile Image */}
                <li className="w-full">
                  <button
                    className="border-b py-2 2xl:py-3 text-textColor text-[11px] 2xl:text-[13px] flex hover:bg-blueColor hover:text-white rounded-none"
                    onClick={handleProfileImage}
                  >
                    Update Profile Picture
                  </button>
                </li>

                {/* LOGOUT */}
                <li className="w-full">
                  <button
                    className="border-b py-2 2xl:py-3 text-textColor text-[11px] 2xl:text-[13px] flex hover:bg-blueColor hover:text-white rounded-none"
                    onClick={handleOpenPasswordForm}
                  >
                    Change Password
                  </button>
                </li>
                <li className="w-full">
                  <button
                    className="border-b py-2 2xl:py-3 text-textColor text-[11px] 2xl:text-[13px] flex hover:bg-blueColor hover:text-white rounded-none"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>

                {/* THEME SWITCHER */}
                <li className="w-full">
                  <div className="p-0 h- w-full">
                    <ThemeSwitcher isHeader />
                  </div>
                </li>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addModal?.modalId === userModalTypes.passwordChange && (
        <DefaultModal title="Password Change" size="1xl" toggler={closeModal}>
          <ChangePassword toggler={closeModal} />
        </DefaultModal>
      )}

      {editModal?.modalId === userModalTypes.profileImage && (
        <DefaultModal
          title="Profile Image Update"
          size="1xl"
          toggler={closeModal}
        >
          <ProfileImageUpdate toggler={closeModal} />
        </DefaultModal>
      )}
    </>
  );
};

export default Header;
