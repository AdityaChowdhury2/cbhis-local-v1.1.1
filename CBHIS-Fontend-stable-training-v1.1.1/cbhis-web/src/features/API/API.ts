import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import apiTags from "./tags";

export const API = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL as string,
    prepareHeaders: (headers) => {
      headers.set("authorization", `Bearer ${import.meta.env.VITE_PUBLIC_KEY}`);
      // headers.set("authorization", `Bearer ${import.meta.env.VITE_PUBLIC_KEY}`);
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [...apiTags],
});
