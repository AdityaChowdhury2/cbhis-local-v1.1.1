// import { RootState } from "@/app/store";
// import { useSelector } from "react-redux";

// const usePermissions = () => {
//   const { user } = useSelector((state: RootState) => state.auth);

//   const str = user?.modules;

//   const moduleAccess = (str as string)?.split(",");

//   const hasModulePermission = (id: string): boolean => {
//     if (Array.isArray(moduleAccess)) {
//       const hasPermission = moduleAccess.find((module) => module === id);
//       return !!hasPermission;
//     }
//     return false;
//   };

//   return {
//     hasModulePermission,
//     userPermission: hasModulePermission("User"),
//     ticketPermission: hasModulePermission("Ticket"),
//     reportPermission: hasModulePermission("Report"),
//     settingsPermission: hasModulePermission("Settings"),
//     devicePermission: hasModulePermission("Device"),
//   };
// };

// export default usePermissions;

// import { RootState } from "@/app/store";
// import { useReadModulePermissionByRoleQuery } from "@/features/module-permission/module-permission-api";
// import { useSelector } from "react-redux";

// const usePermissions = () => {
//   const { user } = useSelector((state: RootState) => state.auth);

//   const { data: modules } = useReadModulePermissionByRoleQuery(
//     String(user?.roleId),
//     { skip: !user?.roleId, refetchOnMountOrArgChange: true }
//   );

//   const moduleIdArray = modules?.map((item) => item?.moduleId);

//   const hasModulePermission = (id: number): boolean => {
//     if (Array.isArray(moduleIdArray)) {
//       const hasPermission = moduleIdArray?.find((module) => module === id);
//       return !!hasPermission;
//     }
//     return false;
//   };

//   return {
//     hasModulePermission,
//     reportPermission: hasModulePermission(2),
//     devicePermission: hasModulePermission(3),
//     ticketPermission: hasModulePermission(4),
//     userPermission: hasModulePermission(5),
//     settingsPermission: hasModulePermission(6),
//   };
// };

// export default usePermissions;

// Settings  6
// User      5
// Ticket    4
// Device    3
// Report    2
