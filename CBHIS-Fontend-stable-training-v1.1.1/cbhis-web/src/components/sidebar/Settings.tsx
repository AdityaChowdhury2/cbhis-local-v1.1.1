/*
 * Created by: Max
 * Date created: 03.06.2024
 * Modified by: Max
 * Last modified: 03.06.2024
 * Reviewed by:
 * Date Reviewed:
 */

import { setSidebarOpen } from "@/features/sidebar/sidebar";
import useWindowWidth from "@/hooks/useWindowWidth";
import { styles } from "@/utilities/cn";
import { useEffect } from "react";
import { TbCircle, TbCircleFilled } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { settingMenuItems } from "./sidebar-routes-array/seeting-array";

const SettingsSidebar = () => {
  const dispatch = useDispatch();
  const router = useLocation();
  const routeArray = router.pathname.split("/");

  const w900 = useWindowWidth(900);
  const sidebarVal = w900 ? false : true;

  useEffect(() => {
    dispatch(setSidebarOpen(sidebarVal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w900, dispatch]);

  console.log(settingMenuItems[0]?.url);

  return (
    <div>
      <div className={styles("mb-5")}>
        <ul className="space-y-2 font-medium mt-2 p-2 lg:p-4 rounded-md bg-lightGrayColor">
          <h3 className="font-semibold text-textColor">Settings</h3>
          {settingMenuItems?.map((menuItem, index) => {
            return (
              <li key={index}>
                <NavLink
                  to={menuItem?.url}
                  className={styles(
                    "flex items-center py-0.5 text-blueColor font-normal rounded-lg group hover:text-blueHoverBgColor hover:ps-2 duration-500 ease-in-out",
                    {
                      "font-bold text-blueColor":
                        menuItem?.url.split("/")[2] === routeArray[2],
                    }
                  )}
                >
                  {menuItem?.url?.split("/")[2] != routeArray[2] && (
                    <TbCircle size={12} />
                  )}

                  {menuItem?.url?.split("/")[2] === routeArray[2] && (
                    <TbCircleFilled size={12} className="text-blueColor" />
                  )}

                  <span
                    className={styles(
                      "ms-3 text-[11px] 2xl:text-[13px] text-textColor",
                      {
                        " text-blueColor":
                          menuItem?.url.split("/")[1] === routeArray[1],
                      }
                    )}
                  >
                    {menuItem?.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div
        className={styles(` duration-500 ease-in-out bg-bgColor px-4`)}
      ></div>
    </div>
  );
};

export default SettingsSidebar;
