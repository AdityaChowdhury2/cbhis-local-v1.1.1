import { RootState } from "@/app/store";
import CustomPagination from "@/components/core/custom-pagination/CustomPagination";
import TableSkeleton from "@/components/core/loader/TableSkeleton";
import DefaultModal from "@/components/core/modal/DefaultModal";
import Table from "@/components/core/table/Table";
import TableBody from "@/components/core/table/TableBody";
import TableHeader from "@/components/core/table/TableHeader";
import { settingsModalTypes } from "@/constants/modal-types/modal-types";
import {
  closeAddModal,
  closeEditModal,
  openAddModal,
} from "@/features/modal/modal-slice";
import { useGetRecoveryRequestQuery } from "@/features/user/user-api";
import dayjs from "dayjs";
import { useState } from "react";
import { BiKey } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import PasswordForm from "./PasswordForm";

function PasswordRecovery() {
  const dispatch = useDispatch();
  const { addModal } = useSelector((state: RootState) => state.modal);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useGetRecoveryRequestQuery(null);

  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  //  Edit Modal open handler
  const openPasswordModal = (data) => {
    dispatch(
      openAddModal({
        modalId: settingsModalTypes.recoveryPass,
        data: data,
      })
    );
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-textColor">Password Recovery</h3>
      </div>
      <div className="bg-whiteColor rounded-lg">
        {data?.data?.length > 0 && (
          <>
            <Table className="min-w-[500px]">
              <TableHeader
                data={[
                  {
                    title: "Username",
                    w: "200px",
                  },
                  {
                    title: "Cellphone",
                    w: "200px",
                  },
                  {
                    title: "Date",
                    w: "200px",
                  },
                  {
                    title: "",
                    w: "150px",
                  },
                ]}
              />
              {data?.data
                ?.filter((i) => i?.isRequestOpen)
                ?.map((item, index) => {
                  return (
                    <TableBody
                      index={index}
                      key={index}
                      data={[
                        {
                          title: item?.username || "--",
                          w: "200px",
                        },
                        {
                          title: item?.cellphone || "--",
                          w: "200px",
                        },
                        {
                          title:
                            dayjs(item?.dateRequested).format(
                              "DD / MM / YYYY - hh:MM"
                            ) || "--",
                          w: "200px",
                        },
                        {
                          title: (
                            <div className="flex items-center gap-3">
                              <button onClick={() => openPasswordModal(item)}>
                                <BiKey
                                  className="text-base font-bold text-cyan-600"
                                  size={20}
                                />
                              </button>
                            </div>
                          ),
                          w: "150px",
                        },
                      ]}
                    />
                  );
                })}
            </Table>
            <div className="p-5">
              <CustomPagination
                take={limit}
                setTake={(e) => setLimit(e)}
                start={page}
                setStart={(e) => setPage(e)}
                totalItemsCount={data?.data?.totalItems}
                showInPage={[10, 20, 30, 50]}
                activePage={page}
                setActivePage={(e) => setPage(e)}
              />
            </div>
          </>
        )}
      </div>

      {addModal?.modalId === settingsModalTypes.recoveryPass && (
        <DefaultModal title="Update Password" size="1xl" toggler={closeModal}>
          <PasswordForm toggler={closeModal} />
        </DefaultModal>
      )}
    </>
  );
}

export default PasswordRecovery;
