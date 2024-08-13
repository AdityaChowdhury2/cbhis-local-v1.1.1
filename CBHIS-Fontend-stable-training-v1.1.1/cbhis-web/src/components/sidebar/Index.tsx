/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { RootState } from "@/app/store";
import { setSidebarOpen } from "@/features/sidebar/sidebar";
import useWindowWidth from "@/hooks/useWindowWidth";
import { styles } from "@/utilities/cn";
import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowUp, IoMdMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { GetMenuItems } from "./sidebar-routes-array/sidebar-array";

// sidebar props type
type Props = {
  children: React.ReactNode;
};

/**
 * @description Sidebar component
 */
const Sidebar = ({ children }: Props) => {
  // action dispatcher
  const dispatch = useDispatch();

  // get sidebar open state from store
  const { sidebarOpen } = useSelector((store: RootState) => store.sidebar);

  // selected menu state
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);

  // use window width hook
  const w900 = useWindowWidth(900);

  // sidebar open state
  const sidebarVal = w900 ? false : true;

  // navigate hook
  const navigate = useNavigate();

  // router location
  const router = useLocation();

  // route array
  const routeArray = router?.pathname?.split("/");

  // get menu items
  const { menuItems } = GetMenuItems();

  // active menu index
  const activeIndex = menuItems?.findIndex((element) => {
    const url = element?.url?.split("/")[1];
    return url === routeArray[1]?.toLowerCase();
  });

  // menu click handler
  const handleMenuClick = (index: number) => {
    if (selectedMenu === index) {
      setSelectedMenu(null);
    } else {
      setSelectedMenu(index);
    }

    if (
      selectedMenu !== null &&
      !menuItems[selectedMenu]?.submenu &&
      selectedMenu !== index
    ) {
      setSelectedMenu(null);
    }
  };

  // set sidebar open state
  useEffect(() => {
    dispatch(setSidebarOpen(sidebarVal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w900, dispatch]);

  // set selected menu
  useEffect(() => {
    // if (activeIndex !== -1 && menuItems) {
    setSelectedMenu(activeIndex);
    // }
  }, []);

  return (
    <div className="">
      <aside
        className={styles(
          "fixed top-0 left-0 z-40 w-60 h-screen duration-500 ease-in-out sidebar overflow-x-hidden",
          { "w-[0px]": !sidebarOpen },
          { "translate-x-0": sidebarOpen }
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-whiteColor ">
          <div
            className={styles(
              "flex gap-2 items-center absolute top-0 left-0 w-full h-[3rem]",
              { "bg-whiteColor": !sidebarOpen }
            )}
          >
            {/* SIDEBAR CONTROL BUTTON */}
            {sidebarOpen ? (
              <button
                onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
                className=" rounded-md p-[6px] ms-3"
              >
                <RxCross2 size={22} className="text-grayColor" />
              </button>
            ) : (
              <button
                onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
                className=" rounded-md p-[6px] ms-3"
              >
                <IoMdMenu size={22} className="text-toggleIconColor" />
              </button>
            )}
            <h2
              className={styles("whitespace-nowrap", {
                "opacity-0": !sidebarOpen,
              })}
            >
              CBHIS Central
            </h2>
          </div>

          {/* SIDEBAR ITEM LIST */}
          <ul className="space-y-3 font-medium mt-12">
            <div
              className={styles(" flex items-center rounded-md", {
                "border border-borderColor bg-whiteColor": sidebarOpen,
              })}
            >
              <div className={styles("rounded-md p-2 button text-textColor")}>
                <AiOutlineSearch size={20} />
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="w-full p-2 placeholder:text-[13px] text-[13px] focus:outline-none text-textColor rounded-md bg-whiteColor"
              />
            </div>
            {menuItems?.map((menuItem, index) => (
              <li key={index}>
                {menuItem?.submenu ? (
                  <>
                    <label
                      htmlFor={`menu-${index}`}
                      onClick={() =>
                        navigate(
                          menuItem?.submenu ? menuItem?.submenu?.[0]?.url : ""
                        )
                      }
                      className="flex items-center justify-between p-2 text-grayTextColor rounded-lg group cursor-pointer hover:text-activeBlueColor"
                    >
                      <div
                        className={styles("flex items-center ", {
                          "text-activeBlueColor": selectedMenu === index,
                        })}
                      >
                        <div className="bg-gray-200 p-2">{menuItem?.icon}</div>
                        <span
                          className={styles(
                            "ms-3  text-[12px] 2xl:text-[14px]",
                            {
                              "text-activeBlueColor": selectedMenu === index,
                            }
                          )}
                        >
                          {menuItem?.label}
                        </span>
                      </div>
                      {selectedMenu != index && <IoIosArrowDown size={14} />}
                      {selectedMenu === index && <IoIosArrowUp size={14} />}
                    </label>
                    <input
                      type="checkbox"
                      id={`menu-${index}`}
                      className="hidden"
                      checked={selectedMenu === index}
                      onChange={() => handleMenuClick(index)}
                    />
                    <ul
                      className={`pl-5 space-y-2 ${
                        selectedMenu === index ? "block" : "hidden"
                      }`}
                    >
                      {menuItem?.submenu?.map((subMenuItem, subIndex) => (
                        <li key={subIndex}>
                          <NavLink
                            to={subMenuItem?.url}
                            onClick={() =>
                              dispatch(
                                setSidebarOpen(w900 ? false : sidebarOpen)
                              )
                            }
                            className="flex items-center py-2 text-grayTextColor rounded-lg group hover:text-activeBlueColor"
                          >
                            <div className={styles("rounded-md p-2 button")}>
                              {subMenuItem?.icon}
                            </div>
                            <span
                              className={styles(
                                "ms-3 text-[12px] 2xl:text-[14px]"
                              )}
                            >
                              {subMenuItem?.label}
                            </span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink
                    onClick={() => {
                      setSelectedMenu(null),
                        dispatch(setSidebarOpen(w900 ? false : sidebarOpen));
                    }}
                    to={menuItem?.url}
                    className={styles(
                      "flex items-center justify-between text-grayTextColor text-base rounded-lg group hover:text-activeBlueColor",
                      {
                        "text-activeBlueColor bg-lightGrayColor":
                          menuItem?.url?.split("/")[1] == routeArray[1],
                      }
                    )}
                  >
                    <div className="flex items-center">
                      <div className={styles("rounded-md p-2 button")}>
                        {menuItem?.icon}
                      </div>
                      <span className="ms-3 text-[11px] 2xl:text-[13px]">
                        {sidebarOpen && menuItem?.label}
                      </span>
                    </div>
                    {menuItem?.badge && menuItem?.badge}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div
        onClick={() => dispatch(setSidebarOpen(w900 ? false : sidebarOpen))}
        className={styles(
          ` duration-500 ease-in-out bg-bgColor`,
          { "ml-60": sidebarOpen && !w900 },
          { "ml-[60px]": sidebarOpen && w900 },
          { "ml-[0px]": !sidebarOpen }
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
