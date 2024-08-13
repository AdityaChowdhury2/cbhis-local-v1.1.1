import { Pagination, RootData, RootResponse } from "@/constants/RootResponse";
import { TypeWaterSource } from "@/constants/api-interface/WaterSource";
import { API } from "../API/API";

export const safeWaterSourcesSlice = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description safeWaterSource create
     * @URI /safeWaterSource
     * @Method POST
     */
    postSafeWaterSources: builder.mutation({
      query: (data) => ({
        url: "/safeWaterSource",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SafeWaterSources"],
    }),

    /**
     * @Description safeWaterSource Get
     * @URI /safeWaterSource
     * @Method GET
     */
    getSafeWaterSources: builder.query<
      RootResponse<RootData<TypeWaterSource[]>>,
      Pagination
    >({
      query: ({ page, pageSize }) => ({
        url: `/safeWaterSources?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["SafeWaterSources"],
    }),

    /**
     * @Description safeWaterSource update
     * @URI /safeWaterSource
     * @Method PUT
     */
    putSafeWaterSources: builder.mutation({
      query: ({ oid, body }) => ({
        url: "/safeWaterSource/id/" + oid,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["SafeWaterSources"],
    }),

    /**
     * @Description safeWaterSource delete
     * @URI /safeWaterSource
     * @Method DELETE
     */
    deleteSafeWaterSources: builder.mutation({
      query: (oid) => ({
        url: "/safeWaterSource/id/" + oid,
        method: "DELETE",
      }),
      invalidatesTags: ["SafeWaterSources"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  usePostSafeWaterSourcesMutation,
  useDeleteSafeWaterSourcesMutation,
  useGetSafeWaterSourcesQuery,
  usePutSafeWaterSourcesMutation,
} = safeWaterSourcesSlice;
