import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { API } from "../features/API/API";
import sidebarSlice from "../features/sidebar/sidebar";
import modalSlice from "@/features/modal/modal-slice";
import authenticationSlice from "@/features/authentication/authentication-slice";

export const store = configureStore({
  reducer: {
    [API.reducerPath]: API.reducer,
    sidebar: sidebarSlice,
    modal: modalSlice.reducer,
    auth: authenticationSlice,
  },

  devTools: import.meta.env.MODE !== "production",

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 100,
      },
    }).concat(API.middleware),
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
