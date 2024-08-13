import { Pagination, RootData, RootResponse } from "@/constants/RootResponse";
import { TypeWaterSource } from "@/constants/api-interface/WaterSource";
import { API } from "../API/API";

export const washesSlice = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description wash create
     * @URI /wash
     * @Method POST
     */
    postWashes: builder.mutation({
      query: (data) => ({
        url: "/wash",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Washes"],
    }),

    /**
     * @Description washs Get
     * @URI /washs
     * @Method GET
     */
    getWashes: builder.query<
      RootResponse<RootData<TypeWaterSource[]>>,
      Pagination
    >({
      query: ({ page, pageSize }) => ({
        url: `/washs?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["Washes"],
    }),

    /**
     * @Description wash update
     * @URI /wash
     * @Method PUT
     */
    putWashes: builder.mutation({
      query: ({ oid, body }) => ({
        url: "/wash/id/" + oid,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Washes"],
    }),

    /**
     * @Description wash delete
     * @URI /wash
     * @Method DELETE
     */
    deleteWashes: builder.mutation({
      query: (oid) => ({
        url: "/wash/id/" + oid,
        method: "DELETE",
      }),
      invalidatesTags: ["Washes"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  usePostWashesMutation,
  useDeleteWashesMutation,
  useGetWashesQuery,
  usePutWashesMutation,
} = washesSlice;
