/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import {
  URLAncTopic,
  URLDevices,
  URLFpMethod,
  URLHealthEducation,
  URLPasswordRecovery,
  URLRegions,
  URLSafeWater,
  URLWASH,
  URLWaterSource,
} from "@/routers/routes-link";
import { TbCircle } from "react-icons/tb";

interface MenuItem {
  label: string;
  url: string;
  icon: JSX.Element;
  submenu?: Submenu[];
}
interface Submenu {
  label: string;
  url: string;
  icon: JSX.Element;
}

export const settingMenuItems: MenuItem[] = [
  { label: "Regions", url: URLRegions(), icon: <TbCircle size={12} /> },
  {
    label: "Devices",
    url: URLDevices(),
    icon: <TbCircle size={12} />,
  },
  {
    label: "Water Source",
    url: URLWaterSource(),
    icon: <TbCircle size={12} />,
  },
  {
    label: "Safe Water Source",
    url: URLSafeWater(),
    icon: <TbCircle size={12} />,
  },
  {
    label: "WASH",
    url: URLWASH(),
    icon: <TbCircle size={12} />,
  },
  {
    label: "Health Education Topics",
    url: URLHealthEducation(),
    icon: <TbCircle size={12} />,
  },
  {
    label: "ANC Topics",
    url: URLAncTopic(),
    icon: <TbCircle size={12} />,
  },
  {
    label: "FP Method",
    url: URLFpMethod(),
    icon: <TbCircle size={12} />,
  },
  {
    label: "Password Recovery",
    url: URLPasswordRecovery(),
    icon: <TbCircle size={12} />,
  },
];
