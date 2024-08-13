import { API } from "../API/API";

export const fpMethodApi = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description Fp Method create
     * @URI /family-plan-method
     * @Method POST
     */
    createFpMethod: builder.mutation({
      query: (data) => ({
        url: "/family-plan-method",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FpMethod"],
    }),

    /**
     * @Description Fp Method Get
     * @URI /family-plan-methods
     * @Method GET
     */
    getFpMethods: builder.query({
      query: ({ page = "", limit = "" }) => ({
        url: `/family-plan-methods?page=${page}&pageSize=${limit}`,
        method: "GET",
      }),
      providesTags: ["FpMethod"],
    }),

    /**
     * @Description Fp Method Single Get
     * @URI /family-plan-method/id/{id}
     * @Method GET
     */
    getSingleFpMethod: builder.query({
      query: (id) => ({
        url: `/family-plan-method/id/${id}`,
        method: "GET",
      }),
    }),

    /**
     * @Description Fp Method Edit
     * @URI /family-plan-method/id/{id}
     * @Method PUT
     */
    editFpMethod: builder.mutation({
      query: (props) => ({
        url: `/family-plan-method/${props.oid}`,
        method: "PUT",
        body: props,
      }),
      invalidatesTags: ["FpMethod"],
    }),

    /**
     * @Description Fp Method Delete
     * @URI /family-plan-method
     * @Method POST
     */
    deleteFpMethod: builder.mutation({
      query: (id) => ({
        url: `/family-plan-method/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FpMethod"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  useCreateFpMethodMutation,
  useGetFpMethodsQuery,
  useEditFpMethodMutation,
  useDeleteFpMethodMutation,
  useGetSingleFpMethodQuery,
} = fpMethodApi;
