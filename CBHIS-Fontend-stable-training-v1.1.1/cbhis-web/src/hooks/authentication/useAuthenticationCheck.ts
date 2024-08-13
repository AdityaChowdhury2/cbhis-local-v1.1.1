import { logout } from "@/features/authentication/authentication-slice";
import { useGetLoginUserByKeyQuery } from "@/features/user/user-api";

import { cookieManager } from "@/utilities/cookie-manager";
import { decryptedTo } from "@/utilities/encription";
import React from "react";
import { useDispatch } from "react-redux";

/**
 * @description Custom hook to check if authentication is done
 * @returns {boolean} isLoggedIn
 */

function useAuthCheck(): boolean {
  // action dispatcher
  const dispatch = useDispatch();

  // get user id from cookie
  const authToken = cookieManager.getCookie("authToken");
  const userId = authToken ? decryptedTo(authToken) : null;

  // get updated auth slice
  const { status, isLoading, isFetching } = useGetLoginUserByKeyQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  // no user is log in
  if (!userId) dispatch(logout());

  // authentication check status
  const [isChecked, setIsChecked] = React.useState(false);

  // see auth check status
  React.useEffect(() => {
    if (!isLoading && !isFetching && status !== "pending") {
      setIsChecked(true);
    }
  }, [status, isLoading, isFetching]);

  // return the authentication check status
  return isChecked;
}

export default useAuthCheck;
