import { API } from "../API/API";

export const regionSlice = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description region create
     * @URI /region
     * @Method POST
     */
    postRegion: builder.mutation({
      query: (data) => ({
        url: "/region",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["region"],
    }),

    /**
     * @Description region Get
     * @URI /regions
     * @Method GET
     */
    getAllRegion: builder.query({
      query: () => ({
        url: `/regions`,
        method: "GET",
        cache: "no-cache",
      }),
      providesTags: ["region"],
    }),

    /**
     * @Description region Get
     * @URI /regions
     * @Method GET
     */
    getRegion: builder.query({
      query: (props) => ({
        url: `/regions?page=${props?.page || 0}&pageSize=${props?.limit || 0}`,
        method: "GET",
      }),
      providesTags: ["region"],
    }),

    /**
     * @Description region Get Single
     * @URI /regions/id/1
     * @Method GET
     */
    getSingleRegion: builder.query({
      query: (id) => ({
        url: `/region/id/${id}`,
        method: "GET",
      }),
    }),

    /**
     * @Description region update
     * @URI /region
     * @Method PUT
     */
    putRegion: builder.mutation({
      query: (props) => ({
        url: "/region/id/" + props.oid,
        method: "PUT",
        body: props,
      }),
      invalidatesTags: ["region"],
    }),

    /**
     * @Description region delete
     * @URI /region
     * @Method DELETE
     */
    deleteRegion: builder.mutation({
      query: (id) => ({
        url: "/region/id/" + id,
        method: "DELETE",
      }),
      invalidatesTags: ["region"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  usePostRegionMutation,
  useGetRegionQuery,
  usePutRegionMutation,
  useDeleteRegionMutation,
  useGetSingleRegionQuery,
  useGetAllRegionQuery,
} = regionSlice;
