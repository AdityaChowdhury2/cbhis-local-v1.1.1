import { API } from "../API/API";

const villageApi = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description village create
     * @URI /village
     * @Method POST
     */
    createVillage: builder.mutation({
      query: (data) => ({
        url: "/village",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Villages", "Village", "VillagesByChiefdomId"],
    }),

    /**
     * @Description village Get
     * @URI /villages
     * @Method GET
     */
    readVillages: builder.query({
      query: () => ({
        url: `/villages`,
        method: "GET",
      }),
      providesTags: ["Villages"],
    }),

    /**
     * @Description village Get
     * @URI /villages
     * @Method GET
     */
    readVillageById: builder.query({
      query: (key) => ({
        url: `/village/id/${key}`,
        method: "GET",
      }),
      providesTags: ["Village"],
    }),

    /**
     * @Description village update
     * @URI /village
     * @Method PUT
     */
    updateVillage: builder.mutation({
      query: ({ ...body }) => ({
        url: "/village/id/" + body?.oid,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Villages", "Village", "VillagesByChiefdomId"],
    }),

    /**
     * @Description village delete
     * @URI /village
     * @Method DELETE
     */
    deleteVillage: builder.mutation({
      query: (key) => ({
        url: "/village/id/" + key,
        method: "DELETE",
      }),
      invalidatesTags: ["Villages", "Village", "VillagesByChiefdomId"],
    }),

    /**
     * @Description village Get by chiefdom id
     * @URI /village/chiefdom/{chiefdomId}
     * @Method GET
     */
    readVillageByChiefdom: builder.query({
      query: ({ chiefdomId, page = 0, limit = 0 }) => ({
        url: `/village/chiefdom/${chiefdomId}?page=${page}&pageSize=${limit}`,
        method: "GET",
      }),
      providesTags: ["VillagesByChiefdomId"],
    }),
  }),
});

export const {
  useCreateVillageMutation,
  useReadVillagesQuery,
  useReadVillageByIdQuery,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  useReadVillageByChiefdomQuery,
} = villageApi;
