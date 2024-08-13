/*
 * Created by: Andrew
 * Date created: 10.11.2023
 * Modified by: Andrew
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import React from "react";

// ErrorBoundaryProps type
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

// error boundary component
class ErrorBoundary extends React.Component<
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

    return this.props.children;
  }
}

export default ErrorBoundary;
