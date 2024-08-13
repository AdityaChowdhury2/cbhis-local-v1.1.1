/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import {
  URLDashboard,
  URLRegions,
  URLTaskAssignments,
  URLUsers,
} from "@/routers/routes-link";
import { AiFillDashboard, AiFillHome } from "react-icons/ai";
import { HiUsers } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";

interface MenuItem {
  label: string;
  url: string;
  badge?: JSX.Element;
  icon: JSX.Element;
  submenu?: Submenu[];
}
interface Submenu {
  label: string;
  url: string;
  badge?: JSX.Element;
  icon: JSX.Element;
}

export const GetMenuItems = () => {
  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      url: URLDashboard(),
      icon: <AiFillHome className="" size={19} />,
    },
    {
      label: "Task Assignments",
      url: URLTaskAssignments(),
      icon: <AiFillDashboard size={19} />,
    },
    {
      label: "Users",
      url: URLUsers(),
      icon: <HiUsers className="" size={19} />,
    },
    {
      label: "Settings",
      url: URLRegions(),
      icon: <IoMdSettings className="" size={19} />,
    },
  ];

  return { menuItems: menuItems };
};
