import AncTopic from "@/pages/settings/ancTopic/AncTopic";
import Devices from "@/pages/settings/devices/Devices";
import FPMethod from "@/pages/settings/fpMethod/FPMethod";
import HealthEducationTopic from "@/pages/settings/healthEducationTopic/HealthEducationTopic";
import PasswordRecovery from "@/pages/settings/password-recovery/PasswordRecovery";
import Regions from "@/pages/settings/regions/Regions";
import Tinkhundla from "@/pages/settings/regions/tinkhundla/Tinkhundla";
import Chiefdoms from "@/pages/settings/regions/tinkhundla/chiefdoms/Chiefdoms";
import Village from "@/pages/settings/regions/tinkhundla/chiefdoms/village/Village";
import SafeWaterSource from "@/pages/settings/safeWaterSource/SafeWaterSource";
import Wash from "@/pages/settings/wash/Wash";
import WaterSource from "@/pages/settings/waterSource/WaterSource";
import { lazy } from "react";
import {
  URLAncTopic,
  URLChiefdoms,
  URLDevices,
  URLFpMethod,
  URLHealthEducation,
  URLPasswordRecovery,
  URLRegions,
  URLSafeWater,
  URLSettings,
  URLTinkhundla,
  URLVillage,
  URLWASH,
  URLWaterSource,
} from "./routes-link";

const SettingsLayout = lazy(() => import("@/layout/SettingsLayout"));

const SettingsRoutes = [
  {
    element: <SettingsLayout />,
    children: [
      {
        path: URLRegions(),
        element: <Regions />,
      },
      {
        path: URLTinkhundla(":id"),
        element: <Tinkhundla />,
      },
      {
        path: URLChiefdoms(":id"),
        element: <Chiefdoms />,
      },
      {
        path: URLVillage(":id"),
        element: <Village />,
      },
      {
        path: URLDevices(),
        element: <Devices />,
      },
      {
        path: URLWaterSource(),
        element: <WaterSource />,
      },
      {
        path: URLSafeWater(),
        element: <SafeWaterSource />,
      },
      {
        path: URLWASH(),
        element: <Wash />,
      },
      {
        path: URLHealthEducation(),
        element: <HealthEducationTopic />,
      },

      {
        path: URLAncTopic(),
        element: <AncTopic />,
      },

      {
        path: URLFpMethod(),
        element: <FPMethod />,
      },

      {
        path: URLPasswordRecovery(),
        element: <PasswordRecovery />,
      },
      {
        path: URLSettings(),
        element: "Settings",
      },
    ],
  },
];

export default SettingsRoutes;
