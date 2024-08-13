/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import Loader from "@/components/core/loader/Loader";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Index";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="bg-bgColor h-[100vh]">
      <Header />
      <div className="">
        <Sidebar>
          <main className="w-full pt-14 bg-bgColor">
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </main>
        </Sidebar>
      </div>
    </div>
  );
};

export default RootLayout;
