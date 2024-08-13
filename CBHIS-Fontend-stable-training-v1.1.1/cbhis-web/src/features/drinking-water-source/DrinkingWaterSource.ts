import { Pagination, RootData, RootResponse } from "@/constants/RootResponse";
import { TypeWaterSource } from "@/constants/api-interface/WaterSource";
import { API } from "../API/API";

export const drinkingWaterSourceSlice = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description drinkingWaterSource create
     * @URI /drinkingWaterSource
     * @Method POST
     */
    postDrinkingWaterSources: builder.mutation({
      query: (data) => ({
        url: "/drinkingWaterSource",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DrinkingWaterSources"],
    }),

    /**
     * @Description drinkingWaterSources Get
     * @URI /drinkingWaterSources
     * @Method GET
     */
    getDrinkingWaterSources: builder.query<
      RootResponse<RootData<TypeWaterSource[]>>,
      Pagination
    >({
      query: ({ page, pageSize }) => ({
        url: `/drinkingWaterSources?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["DrinkingWaterSources"],
    }),

    /**
     * @Description drinkingWaterSource update
     * @URI /drinkingWaterSource
     * @Method PUT
     */
    putDrinkingWaterSources: builder.mutation({
      query: ({ oid, body }) => ({
        url: "/drinkingWaterSource/id/" + oid,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["DrinkingWaterSources"],
    }),

    /**
     * @Description drinkingWaterSource delete
     * @URI /drinkingWaterSource
     * @Method DELETE
     */
    deleteDrinkingWaterSources: builder.mutation({
      query: (oid) => ({
        url: "/drinkingWaterSource/id/" + oid,
        method: "DELETE",
      }),
      invalidatesTags: ["DrinkingWaterSources"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  usePostDrinkingWaterSourcesMutation,
  useDeleteDrinkingWaterSourcesMutation,
  useGetDrinkingWaterSourcesQuery,
  usePutDrinkingWaterSourcesMutation,
} = drinkingWaterSourceSlice;
