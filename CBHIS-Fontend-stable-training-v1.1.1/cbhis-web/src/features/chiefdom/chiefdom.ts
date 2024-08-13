import { API } from "../API/API";

export const chiefdomAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description Chiefdom create
     * @URI /chiefdom
     * @Method POST
     */
    createChiefdom: builder.mutation({
      query: (data) => ({
        url: "/chiefdom",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chiefdom"],
    }),
    /**
     * @Description Chiefdom Get
     * @URI /chiefdoms
     * @Method GET
     */
    getChiefdoms: builder.query({
      query: () => ({
        url: `/chiefdoms`,
        method: "GET",
      }),
      providesTags: [""],
    }),
    /**
     * @Description Chiefdom Single Get
     * @URI /chiefdom/id/{id}
     * @Method GET
     */
    getSingleChiefdom: builder.query({
      query: (id) => ({
        url: `/chiefdom/id/${id}`,
        method: "GET",
      }),
    }),
    /**
     * @Description Chiefdom Edit
     * @URI /chiefdom/id/{id}
     * @Method PUT
     */
    editChiefdom: builder.mutation({
      query: (props) => ({
        url: `/chiefdom/id/${props.oid}`,
        method: "PUT",
        body: props,
      }),
      invalidatesTags: ["Chiefdom"],
    }),
    /**
     * @Description Chiefdom Delete
     * @URI /chiefdom
     * @Method POST
     */
    deleteChiefdom: builder.mutation({
      query: (id) => ({
        url: `/chiefdom/id/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chiefdom"],
    }),
    /**
     * @Description Chiefdom Get By Region Id
     * @URI /chiefdom/regionId/{id}
     * @Method GET
     */
    getChiefdomByRegionId: builder.query({
      query: (props) => ({
        url: `/chiefdoms/inkhundlaid/${props?.inkhundlaId}?page=${
          props.page || 0
        }&pageSize=${props.limit || 0}`,
        method: "GET",
      }),

      providesTags: ["Chiefdom"],
    }),
    /**
     * @Description Chiefdom Get By Region Id
     * @URI /chiefdom/regionId/{id}
     * @Method GET
     */
    getChiefdomByTinkhundlaId: builder.query({
      query: (props) => ({
        url: `/chiefdoms/inkhundlaid/${props?.tinkhundlaId}?&page=${
          props?.page || 0
        }&pageSize=${props?.limit || 0}`,
        method: "GET",
      }),
      providesTags: ["Chiefdom"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  useCreateChiefdomMutation,
  useGetChiefdomsQuery,
  useEditChiefdomMutation,
  useDeleteChiefdomMutation,
  useGetSingleChiefdomQuery,
  useGetChiefdomByRegionIdQuery,
  useGetChiefdomByTinkhundlaIdQuery,
} = chiefdomAPI;

// export endpoints
export const { endpoints: chiefdomAPIEndpoints } = chiefdomAPI;
