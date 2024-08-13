import { API } from "../API/API";

export const ancTopicApi = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description Anc Topic create
     * @URI /anc-topic
     * @Method POST
     */
    createAncTopic: builder.mutation({
      query: (data) => ({
        url: "/anc-topic",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AncTopic"],
    }),

    /**
     * @Description Anc Topic Get
     * @URI /anc-topics
     * @Method GET
     */
    getAncTopics: builder.query({
      query: ({ page = "", limit = "" }) => ({
        url: `/anc-topics?page=${page}&pageSize=${limit}`,
        method: "GET",
      }),
      providesTags: ["AncTopic"],
    }),

    /**
     * @Description Anc Topic Single Get
     * @URI /anc-topic/id/{id}
     * @Method GET
     */
    getSingleAncTopic: builder.query({
      query: (id) => ({
        url: `/anc-topic/id/${id}`,
        method: "GET",
      }),
    }),

    /**
     * @Description Anc Topic Edit
     * @URI /anc-topic/id/{id}
     * @Method PUT
     */
    editAncTopic: builder.mutation({
      query: (props) => ({
        url: `/anc-topic/${props.oid}`,
        method: "PUT",
        body: props,
      }),
      invalidatesTags: ["AncTopic"],
    }),

    /**
     * @Description Anc Topic Delete
     * @URI /anc-topic
     * @Method POST
     */
    deleteAncTopic: builder.mutation({
      query: (id) => ({
        url: `/anc-topic/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AncTopic"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  useCreateAncTopicMutation,
  useGetAncTopicsQuery,
  useEditAncTopicMutation,
  useDeleteAncTopicMutation,
  useGetSingleAncTopicQuery,
} = ancTopicApi;
