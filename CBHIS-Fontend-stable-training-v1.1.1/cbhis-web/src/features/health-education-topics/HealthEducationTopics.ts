import { Pagination, RootData, RootResponse } from "@/constants/RootResponse";
import { TypeHealthEducationData } from "@/constants/api-interface/healthEducationType";
import { API } from "../API/API";

export const healthEducationTopicsSlice = API.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * @Description healthEducationTopics create
     * @URI /healthEducationTopics
     * @Method POST
     */
    postHealthEducationTopics: builder.mutation({
      query: (data) => ({
        url: "/healthEducationTopic",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["HealthEducationTopics"],
    }),

    /**
     * @Description healthEducationTopics Get
     * @URI /healthEducationTopics
     * @Method GET
     */
    getHealthEducationTopics: builder.query<
      RootResponse<RootData<TypeHealthEducationData[]>>,
      Pagination
    >({
      query: ({ page, pageSize }) => ({
        url: `/healthEducationTopics?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["HealthEducationTopics"],
    }),

    /**
     * @Description healthEducationTopics update
     * @URI /healthEducationTopics
     * @Method PUT
     */
    putHealthEducationTopics: builder.mutation({
      query: ({ oid, body }) => ({
        url: "/healthEducationTopic/id/" + oid,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["HealthEducationTopics"],
    }),

    /**
     * @Description healthEducationTopics delete
     * @URI /healthEducationTopics
     * @Method DELETE
     */
    deleteHealthEducationTopics: builder.mutation({
      query: (oid) => ({
        url: "/healthEducationTopic/id/" + oid,
        method: "DELETE",
      }),
      invalidatesTags: ["HealthEducationTopics"],
    }),
  }),
});

// * Export hooks for usage in components
export const {
  usePostHealthEducationTopicsMutation,
  useGetHealthEducationTopicsQuery,
  usePutHealthEducationTopicsMutation,
  useDeleteHealthEducationTopicsMutation,
} = healthEducationTopicsSlice;
