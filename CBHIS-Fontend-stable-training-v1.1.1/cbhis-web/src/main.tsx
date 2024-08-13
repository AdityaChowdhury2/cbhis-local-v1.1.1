import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./app/store.ts";
import Loader from "./components/core/loader/Loader";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div> div</div>}>
      <Suspense fallback={<Loader />}>
        <Provider store={store}>
          <Toaster />
          <App />
        </Provider>
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
