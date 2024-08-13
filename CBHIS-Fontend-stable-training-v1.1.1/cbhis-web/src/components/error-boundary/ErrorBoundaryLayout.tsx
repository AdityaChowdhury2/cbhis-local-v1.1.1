/*
 * Created by: Andrew
 * Date created: 10.11.2023
 * Modified by: Andrew
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";
import { Outlet } from "react-router-dom";

// Error boundary layout props type
interface ErrorBoundaryProps {
  fallback: React.ReactNode;
}

/**
 * @description Error Boundary Layout component
 */
class ErrorBoundaryLayout extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  state: Readonly<{ hasError: boolean }> = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this?.props?.fallback;
    }

    return <Outlet />;
  }
}

export default ErrorBoundaryLayout;
