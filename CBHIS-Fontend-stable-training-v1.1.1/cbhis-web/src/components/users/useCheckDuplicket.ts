import { useAppDispatch } from "@/app/store";
import { User, userApiEndpoints } from "@/features/user/user-api";
import { useEffect, useState } from "react";

type Props = {
  username: string;
  cellphone: string;
  prevUser: User;
};

// Custom hook for check
export const useCheckDuplicate = ({ username, cellphone, prevUser }: Props) => {
  // const prevCellphone = prevUser?.cellphone;
  // const prevUsername = prevUser?.username;

  const delay = 400;
  const appDispatch = useAppDispatch();

  const [usernameExist, setUsernameExist] = useState("");
  const [cellphoneExist, setCellphoneExist] = useState("");
  console.log(usernameExist);

  useEffect(() => {
    const timeout = setTimeout(() => {
      appDispatch(
        userApiEndpoints.checkUsername.initiate(username, {
          forceRefetch: true,
        })
      )
        .unwrap()
        .then((res) => {
          console.log(res);
          if (prevUser?.oid) {
            if (res?.oid && res?.data?.oid !== prevUser?.oid) {
              setUsernameExist("Username already exist");
            } else {
              setUsernameExist("");
            }
          } else if (!prevUser?.oid && res?.data?.oid) {
            setUsernameExist("Username already exist");
          } else {
            setUsernameExist("");
          }
        })
        .catch(() => {
          setUsernameExist("");
        });
    }, delay);

    return () => clearTimeout(timeout);
  }, [username, delay]);

  // check cellphone
  useEffect(() => {
    const timeout = setTimeout(() => {
      appDispatch(
        userApiEndpoints.getUserByCellphone.initiate(cellphone, {
          forceRefetch: true,
        })
      )
        .unwrap()
        .then((res) => {
          if (prevUser?.oid) {
            if (res?.oid && res?.oid !== prevUser?.oid) {
              setCellphoneExist("Cellphone already exist");
            } else {
              setCellphoneExist("");
            }
          } else if (!prevUser?.oid && res?.oid) {
            setCellphoneExist("Cellphone already exist");
          } else {
            setCellphoneExist("");
          }
        })
        .catch(() => {
          setCellphoneExist("");
        });
    }, delay);

    return () => clearTimeout(timeout);
  }, [cellphone, delay]);

  return { usernameExist, cellphoneExist };
};
