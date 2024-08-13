/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import SettingsLoader from "@/components/core/loader/SettingsLoader";
import ErrorBoundary from "@/components/error-boundary/ErrorBoundary";
import ErrorBoundaryFallback from "@/components/error-boundary/ErrorBoundaryFallback";
import SettingsSidebar from "@/components/sidebar/Settings";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const SettingsLayout = () => {
  return (
    <div className="md:grid md:grid-cols-3 px-4 gap-5 bg-bgColor">
      <div className="md:col-span-1">
        <SettingsSidebar />
      </div>
      <main className="w-full md:mt-2 md:col-span-2">
        <ErrorBoundary fallback={<ErrorBoundaryFallback />}>
          <Suspense fallback={<SettingsLoader />}>{<Outlet />}</Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default SettingsLayout;
