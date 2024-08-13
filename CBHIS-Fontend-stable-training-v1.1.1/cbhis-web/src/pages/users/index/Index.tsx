import { RootState } from "@/app/store";
import CustomPagination from "@/components/core/custom-pagination/CustomPagination";
import Table from "@/components/core/table/Table";
import TableBody from "@/components/core/table/TableBody";
import TableHeader from "@/components/core/table/TableHeader";
import { userModalTypes } from "@/constants/modal-types/modal-types";
import {
  closeAddModal,
  closeEditModal,
  openAddModal,
} from "@/features/modal/modal-slice";

import TableSkeleton from "@/components/core/loader/TableSkeleton";
import ErrorPage from "@/components/error-page/ErrorPage";
import NotFound from "@/components/not-found/NotFound";
import { EnumUserType } from "@/constants/api-interface/user";
import { User, useGetUsersQuery } from "@/features/user/user-api";
import useDataHandling from "@/hooks/shared/useDataHandle";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserFilters from "../../../components/users/Filters";
import UserCreate from "../create/UserCreate";
import UserEdit from "../edit/UserEdit";
import UserAction from "./UserAction";

type Props = {};

const UsersList = ({}: Props) => {
  const { addModal, editModal } = useSelector(
    (state: RootState) => state.modal
  );

  // *  pagination state
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const {
    data: usersRes,
    isLoading,
    isSuccess,
    isError,
  } = useGetUsersQuery({ page, limit, search, filter });
  const userList = usersRes?.data?.data || [];

  console.log("usersRes =>", {
    search,
    achem: "",

    filter,
  });

  const { dataNotFound, isDataError, isDataLoading, isDataSuccess } =
    useDataHandling({
      isError,
      isLoading,
      isSuccess,
      length: usersRes?.data?.totalItems,
    });

  // *  Dispatcher
  const dispatch = useDispatch();

  // * Modal Close handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Add Modal open handler
  const handleAddUser = () => {
    dispatch(
      openAddModal({
        modalId: userModalTypes.userAddModalTypes,
        data: null,
      })
    );
  };

  return (
    <div className="px-4 pt-1">
      <h3 className="font-semibold text-textColor">User List</h3>

      <div className="sm:flex justify-between items-center m-0 p-0 ">
        <UserFilters
          search={search}
          setSearch={setSearch}
          setFilter={setFilter}
        />
        <button
          onClick={handleAddUser}
          className="main_btn mb-3 w-full xs:w-auto sm:mb-0"
        >
          Add New
        </button>
      </div>

      <div className="bg-whiteColor rounded-lg">
        {isDataLoading && <TableSkeleton />}
        {isDataError && <ErrorPage />}
        {dataNotFound && <NotFound />}
        {isDataSuccess && (
          <Table className="min-w-[1024px]">
            <TableHeader data={createUserTableData({} as User, null)} />
            {userList?.map((user, index) => {
              return (
                <TableBody
                  index={index}
                  key={index}
                  data={createUserTableData(user, UserAction)?.map((d) => ({
                    w: d.w,
                    title: d.data,
                  }))}
                />
              );
            })}

            {isLoading && ""}
          </Table>
        )}
        <div className="p-5">
          <CustomPagination
            take={limit}
            setTake={(e) => setLimit(e)}
            start={page}
            setStart={(e) => setPage(e)}
            totalItemsCount={usersRes?.data?.totalItems}
            showInPage={[10, 20, 30, 50]}
            activePage={page}
            setActivePage={(e) => setPage(e)}
          />
        </div>
      </div>

      {/* Create user account  modal */}
      {addModal?.modalId === userModalTypes?.userAddModalTypes && (
        <UserCreate toggler={closeModal} />
      )}
      {/* Update user account modal */}
      {editModal?.modalId === userModalTypes?.userEditModalTypes && (
        <UserEdit toggler={closeModal} />
      )}
    </div>
  );
};

export default UsersList;

// *  create user table data
const createUserTableData = (user = {} as User, UserAction) => {
  let name = "";
  if (user?.firstName) name += user?.firstName;
  if (user?.middleName) name += ` ${user?.middleName}`;
  if (user?.lastName) name += ` ${user?.lastName}`;

  const createTableData = [
    {
      title: "Name",
      w: "200px",
      data: name,
    },
    {
      title: "Email",
      w: "200px",
      data: user?.email || "--",
    },
    {
      title: "Contact",
      w: "200px",
      data: user?.cellphone || "--",
    },
    {
      title: "Role",
      w: "200px",
      data: user?.userType ? EnumUserType[user?.userType] : "--",
    },
    {
      title: "Username",
      w: "200px",
      data: user?.username,
    },
    {
      title: "",
      w: "100px",
      data: user?.oid ? <UserAction key={user?.oid} user={user} /> : "--",
    },
  ];
  return createTableData;
};
