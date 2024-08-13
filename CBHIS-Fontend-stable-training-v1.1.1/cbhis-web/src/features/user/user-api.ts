import { cookieManager } from "@/utilities/cookie-manager";
import { encryptedTo } from "@/utilities/encription";
import { API } from "../API/API";
import { login, logout } from "../authentication/authentication-slice";

const userApi = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description User Login
     * @URI /user-account/login
     * @Method POST
     */
    login: builder.mutation({
      query: (data) => ({
        url: "/user-account/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          const user = result?.data?.data;
          const isSuccess = !!result?.data?.isSuccess;
          const token = user?.oid ? encryptedTo(user?.oid) : null;

          if (isSuccess && token) {
            // save token to cookie
            cookieManager.saveCookie("authToken", token, {
              expires: 1,
            }); // i day

            dispatch(
              login({
                user: user,
                token: user?.oid,
                isRegistered: isSuccess,
              })
            );
          } else {
            dispatch(logout());
          }
        } catch (error) {
          dispatch(logout());
        }
      },
    }),

    /**
     * @Description Login User Get
     * @URI /user-account/key/{key}
     * @Method GET
     */
    getLoginUserByKey: builder.query({
      query: (key) => ({
        url: `/user-account/key/${key}`,
        method: "GET",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log(result?.data?.data);
          const user = result?.data?.data;
          const isSuccess = !!result?.data?.isSuccess;

          if (isSuccess && user?.oid) {
            dispatch(
              login({
                user: user,
                token: user?.oid,
                isRegistered: isSuccess,
              })
            );
          } else {
            dispatch(logout());
          }
        } catch (error) {
          dispatch(logout());
        }
      },
      providesTags: ["ProfileImage"],
    }),

    /**
     * @Description User Get
     * @URI /user-account/key/{key}
     * @Method GET
     */
    getUserByKey: builder.query<string, TypeUserByKeyResponse>({
      query: (key) => ({
        url: `/user-account/key/${key}`,
        method: "GET",
      }),
      providesTags: ["UserByKey"],
    }),

    /**
     * @Description User Create
     * @URI /user-account
     * @Method POST
     */
    createUser: builder.mutation({
      query: (data) => ({
        url: "/user-account",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),

    /**
     * @Description User Get
     * @URI /user-accounts
     * @Method GET
     */
    getUsers: builder.query({
      query: ({ page = 1, limit = 20, search = "", filter }) => {
        // if (!search && filter) {
        //   return {
        //     url: `/user-accounts?page=${page}&pageSize=${limit}`,
        //     method: "GET",
        //   };
        // }
        if (filter && search) {
          return {
            url: `/user-accounts?page=${page}&pageSize=${limit}&search=${search}&userType=${filter}`,
            method: "GET",
          };
        }
        if (filter) {
          return {
            url: `/user-accounts?page=${page}&pageSize=${limit}&userType=${filter}`,
            method: "GET",
          };
        }
        if (search) {
          return {
            url: `/user-accounts?page=${page}&pageSize=${limit}&search=${search}`,
            method: "GET",
          };
        }
        return {
          url: `/user-accounts?page=${page}&pageSize=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

    /**
     * @Description User Update
     * @URI /user-account
     * @Method PUT
     */
    updateUser: builder.mutation({
      query: ({ key, ...data }) => ({
        url: "/user-account/" + key,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserByKey", "Users"],
    }),

    /**
     * @Description User Delete
     * @URI /user-account
     * @Method DELETE
     */
    deleteUser: builder.mutation({
      query: (key) => ({
        url: "/user-account/" + key,
        method: "DELETE",
      }),
      invalidatesTags: ["UserByKey", "Users"],
    }),

    /**
     * @Description User Check
     * @URI /user-account/user-check/{userName}
     * @Method GET
     */
    checkUsername: builder.query({
      query: (userName) => ({
        url: `/user-account/user-check/${userName}`,
        method: "GET",
      }),
    }),

    // /**
    //  * @Description User Check By Cell
    //  * @URI /user-account/user-check-by-cell
    //  * @Method GET
    //  */
    // checkUserByCell: builder.query({
    //   query: (cell) => ({
    //     url: `/user-account/user-check-by-cell/${cell}`,
    //     method: "GET",
    //   }),
    // }),

    /**
     * @Description User By First name
     * @URI /user-account/firstname/{firstName}
     * @Method GET
     */
    getUserByFirstName: builder.query({
      query: (firstName) => ({
        url: `/user-account/firstname/${firstName}`,
        method: "GET",
      }),
    }),

    /**
     * @Description User By Surname
     * @URI /user-account/surname/{surName}
     * @Method GET
     */
    getUserBySurname: builder.query({
      query: (surName) => ({
        url: `/user-account/surname/${surName}`,
        method: "GET",
      }),
    }),

    /**
     * @Description User By Cellphone
     * @URI /user-account/cellphone/{cellphone}
     * @Method GET
     */
    getUserByCellphone: builder.query({
      query: (cellphone) => ({
        url: `/user-account/cellphone/${cellphone}`,
        method: "GET",
      }),
    }),

    /**
     * @Description User By Cellphone
     * @URI /user-account/cellphone/{cellphone}
     * @Method GET
     */
    getProfileImage: builder.query({
      query: (id) => ({
        url: `/profile-picture/key/${id}`,
        method: "GET",
      }),
    }),

    /**
     * @Description verify password
     * @URI /user-account/verify-password
     * @Method GET
     */
    verifyPassword: builder.mutation({
      query: (data) => ({
        url: "/user-account/verify-password",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * @Description update password
     * @URI /user-account/update-password
     * @Method POST
     */
    updatePassword: builder.mutation({
      query: (data) => ({
        url: "/user-account/update-password",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * @Description update password
     * @URI /user-account/update-password
     * @Method POST
     */
    profileImage: builder.mutation({
      query: ({ key, body }) => ({
        url: `/user-account/image/${key}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["ProfileImage"],
    }),

    /**
     * @Description Recovery Request
     * @URI /recovery-request
     * @Method POST
     */
    recoveryRequest: builder.mutation({
      query: (data) => ({
        url: "/recovery-request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RecoveryPassword"],
    }),

    /**
     * @Description Recovery Request
     * @URI /recovery-request
     * @Method GET
     */
    getRecoveryRequest: builder.query({
      query: () => ({
        url: "/recovery-requests",
        method: "GET",
      }),
      providesTags: ["RecoveryPassword"],
    }),

    /**
     * @Description Recovery By Admin
     * @URI /user-account/recovery-password
     * @Method POST
     */
    recoveryPassword: builder.mutation({
      query: (data) => ({
        url: "/user-account/recovery-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RecoveryPassword"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  useLoginMutation,
  useCreateUserMutation,
  // useCheckUserByCellQuery,
  useCheckUsernameQuery,
  useDeleteUserMutation,
  useGetUserByCellphoneQuery,
  useGetUserByFirstNameQuery,
  useGetUserBySurnameQuery,
  useGetUserByKeyQuery,
  useGetUsersQuery,
  useUpdatePasswordMutation,
  useUpdateUserMutation,
  useVerifyPasswordMutation,
  useGetLoginUserByKeyQuery,
  useProfileImageMutation,
  useGetProfileImageQuery,
  useRecoveryPasswordMutation,
  useGetRecoveryRequestQuery,
  useRecoveryRequestMutation,
} = userApi;

// * export api endpoints
export const { endpoints: userApiEndpoints } = userApi;

export interface UsersResponse {
  isSuccess: boolean;
  data: UserPageResponse;
  message: any;
}

export interface UserPageResponse {
  data: User[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}

export interface User {
  oid: string;
  firstName: string;
  middleName: string;
  lastName: string;
  pin: string;
  cellphone: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: any;
  userType: number;
  isDeleted: boolean;
  assignedChiefdoms: DropdownItem[];
  assignedVillages: DropdownItem[];
  assignedDevices: DropdownItem[];
  assignedChiefdomList: number[];
  assignedVillageList: number[];
  assignedDeviceList: number[];
}

// todo
type DropdownItem = {
  oid: number;
  description: string;
};

// Response type for user by key
export interface TypeUserByKeyResponse {
  isSuccess: boolean;
  data: TypeUserByKey;
  message?: any;
}
export interface TypeUserByKey {
  oid: string;
  firstName: string;
  middleName: string;
  lastName: string;
  pin: string;
  cellphone: string;
  email: string;
  username: string;
  password: string;
  confirmPassword?: any;
  userType: number;
  isDeleted: boolean;
  assignedChiefdoms: AssignedChiefdoms[];
  assignedVillages: AssignedVillage[];
  assignedDevices: AssignedDevice[];
  assignedChiefdomList?: any;
  assignedVillageList?: any;
  assignedDeviceList?: any;
}
interface AssignedDevice {
  oid: number;
  deviceId: number;
  device: Device;
  rhmId: string;
  inUse: boolean;
  isDeleted: boolean;
}
interface Device {
  oid: number;
  description: string;
  imeiNumber: string;
  isDeleted: boolean;
}
interface AssignedVillage {
  oid: number;
  villageId: number;
  village: Village;
  rhmId: string;
  isActive: boolean;
  isDeleted: boolean;
}
interface Village {
  oid: number;
  description: string;
  chiefdomId: number;
  isDeleted: boolean;
}

interface AssignedChiefdoms {
  oid: number;
  chiefdomId: number;
  chiefdom: Chiefdom;
  supervisorId: string;
  isActive: boolean;
  isDeleted: boolean;
}
interface Chiefdom {
  oid: number;
  description: string;
  inkhundlaId: number;
  isDeleted: boolean;
}
