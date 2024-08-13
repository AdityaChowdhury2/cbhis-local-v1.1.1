import { Pagination, RootData, RootResponse } from "@/constants/RootResponse";
import { TypeDeviceData } from "@/constants/api-interface/deviceDataType";
import { API } from "../API/API";

export const deviceAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description device create
     * @URI /device
     * @Method POST
     */
    postDevice: builder.mutation({
      query: (data) => ({
        url: "/device",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Devices"],
    }),

    /**
     * @Description device Get
     * @URI /devices
     * @Method GET
     */
    getDevice: builder.query<
      RootResponse<RootData<TypeDeviceData[]>>,
      Pagination
    >({
      query: ({ page = "", pageSize = "" }) => ({
        url: `/devices?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["Devices"],
    }),
    /**
     * @Description device Get
     * @URI /devices
     * @Method GET
     */
    getAllDevice: builder.query<
      RootResponse<RootData<TypeDeviceData[]>>,
      Pagination
    >({
      query: () => ({
        url: `/devices`,
        method: "GET",
      }),
      providesTags: ["Devices"],
    }),

    /**
     * @Description device update
     * @URI /device
     * @Method PUT
     */
    putDevice: builder.mutation({
      query: ({ oid, body }) => ({
        url: "/device/id/" + oid,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Devices"],
    }),

    /**
     * @Description device delete
     * @URI /device
     * @Method DELETE
     */
    deleteDevice: builder.mutation({
      query: (oid) => ({
        url: "/device/id/" + oid,
        method: "DELETE",
      }),
      invalidatesTags: ["Devices"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  usePostDeviceMutation,
  useGetDeviceQuery,
  usePutDeviceMutation,
  useDeleteDeviceMutation,
  useGetAllDeviceQuery,
} = deviceAPI;

export const { endpoints: deviceAPIEndpoints } = deviceAPI;
