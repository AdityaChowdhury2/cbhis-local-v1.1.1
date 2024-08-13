/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { setSidebarOpen } from "@/features/sidebar/sidebar";
import useWindowWidth from "@/hooks/useWindowWidth";
import { styles } from "@/utilities/cn";
import { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { TbCircle, TbCircleFilled } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { settingMenuItems } from "./sidebar-routes-array/seeting-array";

const SettingsSidebar = () => {
  const dispatch = useDispatch();
  const router = useLocation();
  const routeArray = router.pathname.split("/");
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);

  const w900 = useWindowWidth(900);
  const sidebarVal = w900 ? false : true;

  const activeIndex = settingMenuItems?.findIndex((element) => {
    const label = element?.label?.toLowerCase();

    return label === routeArray[1]?.toLowerCase();
  });

  const handleMenuClick = (index: number) => {
    if (selectedMenu === index) {
      setSelectedMenu(null);
    } else {
      setSelectedMenu(index);
    }

    if (
      selectedMenu !== null &&
      !settingMenuItems[selectedMenu]?.submenu &&
      selectedMenu !== index
    ) {
      setSelectedMenu(null);
    }
  };

  useEffect(() => {
    dispatch(setSidebarOpen(sidebarVal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w900, dispatch]);

  useEffect(() => {
    setSelectedMenu(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log({activeIndex});
  

  return (
    <div>
      <div className={styles("mb-5")}>
        <ul className="space-y-2 font-medium mt-2">
          {settingMenuItems?.map((menuItem, index) => (
            <li key={index}>
              {menuItem?.submenu ? (
                <div
                  className={styles("rounded-lg bg-whiteColor py-1 px-2", {
                    "bg-lightGrayColor pb-3": selectedMenu === index,
                  })}
                >
                  <label
                    htmlFor={`settingsMenu-${index}`}
                    className="flex items-center justify-between p-2 text-textColor rounded-lg group cursor-pointer"
                  >
                    <div
                      onClick={() =>
                        navigate(
                          menuItem?.submenu ? menuItem?.submenu[0]?.url : ""
                        )
                      }
                      className={styles("flex items-center", {
                        "text-violetColor": selectedMenu === index,
                      })}
                    >
                      {menuItem?.icon}
                      <span className={styles("ms-3 text-sm ")}>
                        {menuItem?.label}
                      </span>
                    </div>
                    {selectedMenu != index && <IoIosArrowDown size={12} />}
                    {selectedMenu === index && <IoIosArrowUp size={12} />}
                  </label>
                  <input
                    type="checkbox"
                    id={`settingsMenu-${index}`}
                    className="hidden bg-red-500"
                    checked={selectedMenu === index}
                    onChange={() => handleMenuClick(index)}
                  />
                  <ul
                    className={`pl-5 space-y-2 ${
                      selectedMenu === index ? "block" : "hidden"
                    }`}
                  >
                    {menuItem?.submenu?.map((subMenuItem, subIndex) => {
                      return (
                        <li key={subIndex}>
                          <NavLink
                            to={subMenuItem?.url}
                            className={styles(
                              "flex items-center py-0.5 text-grayColor font-normal rounded-lg group hover:text-violetColor hover:ps-2 duration-500 ease-in-out",
                              {
                                "text-violetColor font-bold":
                                  subMenuItem?.url.split("/")[2] ===
                                  routeArray[2],
                              }
                            )}
                          >
                            {subMenuItem?.url?.split("/")[2] !=
                              routeArray[2] && <TbCircle size={12} />}

                            {subMenuItem?.url?.split("/")[2] ===
                              routeArray[2] && <TbCircleFilled size={12} />}

                            <span className="ms-3 text-[11px] 2xl:text-[13px] text-textColor">
                              {subMenuItem?.label}
                            </span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <NavLink
                  onClick={() => setSelectedMenu(null)}
                  to={menuItem?.url}
                  className="flex items-center p-2 text-textColor text-base rounded-lg group collapse-title  font-medium"
                >
                  {menuItem?.icon}
                  <span className="ms-3 text-xs">{menuItem?.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div
        className={styles(` duration-500 ease-in-out bg-bgColor px-4`)}
      ></div>
    </div>
  );
};

export default SettingsSidebar;
