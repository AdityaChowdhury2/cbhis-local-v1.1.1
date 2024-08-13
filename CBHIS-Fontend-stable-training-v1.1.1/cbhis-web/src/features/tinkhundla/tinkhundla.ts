import { API } from "../API/API";

export const tinkhundlaAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description Tinkhundla create
     * @URI /tinkhundla
     * @Method POST
     */
    createTinkhundla: builder.mutation({
      query: (data) => ({
        url: "/tinkhundla",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tinkhundla"],
    }),
    /**
     * @Description Tinkhundla Get
     * @URI /tinkhundlas
     * @Method GET
     */
    getTinkhundla: builder.query({
      query: (props) => ({
        url: `/tinkhundla?page=${props.page || 1}&pageSize=${
          props.limit || 10
        }`,
        method: "GET",
      }),
      providesTags: [""],
    }),
    /**
     * @Description Tinkhundla Single Get
     * @URI /tinkhundla/id/{id}
     * @Method GET
     */
    getSingleTinkhundla: builder.query({
      query: (id) => ({
        url: `/tinkhundla/id/${id}`,
        method: "GET",
      }),
    }),
    /**
     * @Description Tinkhundla Edit
     * @URI /tinkhundla/id/{id}
     * @Method PUT
     */
    editTinkhundla: builder.mutation({
      query: (props) => ({
        url: `/tinkhundla/id/${props.oid}`,
        method: "PUT",
        body: props,
      }),
      invalidatesTags: ["Tinkhundla"],
    }),
    /**
     * @Description Tinkhundla Delete
     * @URI /tinkhundla
     * @Method POST
     */
    deleteTinkhundla: builder.mutation({
      query: (id) => ({
        url: `/tinkhundla/id/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tinkhundla"],
    }),
    /**
     * @Description Tinkhundla Get By Region Id
     * @URI /tinkhundla/regionId/{id}
     * @Method GET
     */
    getTinkhundlaByRegionId: builder.query({
      query: ({ id, page = 0, limit = 0 }) => ({
        url: `/tinkhundla/regionId/${id}?page=${page}&pageSize=${limit}`,
        method: "GET",
        cache: "no-cache",
      }),

      providesTags: ["Tinkhundla"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  useCreateTinkhundlaMutation,
  useGetTinkhundlaQuery,
  useEditTinkhundlaMutation,
  useDeleteTinkhundlaMutation,
  useGetSingleTinkhundlaQuery,
  useGetTinkhundlaByRegionIdQuery,
} = tinkhundlaAPI;

export const { endpoints: tinkhundlaAPIEndpoints } = tinkhundlaAPI;
