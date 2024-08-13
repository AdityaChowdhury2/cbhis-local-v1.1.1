import { RootState } from "@/app/store";
import CustomPagination from "@/components/core/custom-pagination/CustomPagination";
import TableSkeleton from "@/components/core/loader/TableSkeleton";
import DefaultModal from "@/components/core/modal/DefaultModal";
import Table from "@/components/core/table/Table";
import TableBody from "@/components/core/table/TableBody";
import TableHeader from "@/components/core/table/TableHeader";
import ErrorPage from "@/components/error-page/ErrorPage";
import NotFound from "@/components/not-found/NotFound";
import { settingsModalTypes } from "@/constants/modal-types/modal-types";
import {
  closeAddModal,
  closeEditModal,
  openAddModal,
  openEditModal,
} from "@/features/modal/modal-slice";
import {
  useDeleteWashesMutation,
  useGetWashesQuery,
} from "@/features/wash/Wash";
import useDataHandling from "@/hooks/shared/useDataHandle";
import useSideEffects from "@/hooks/shared/useSideEffect";
import { swalWarning } from "@/utilities/swal-fire";
import { useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import WashCreate from "./Create";
import WashEdit from "./Edit";

function Wash() {
  const dispatch = useDispatch();
  const { addModal, editModal } = useSelector(
    (state: RootState) => state.modal
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isError, isLoading, isSuccess } = useGetWashesQuery({
    page: page,
    pageSize: limit,
  });

  // Data status handling
  const { dataNotFound, isDataError, isDataLoading, isDataSuccess } =
    useDataHandling({
      isError,
      isLoading,
      isSuccess,
      length: data?.data?.totalItems,
    });

  // delete mutation
  const [
    deleteWashes,
    {
      data: safeWaterData,
      isSuccess: isSuccessWater,
      isError: isErrorWater,
      error,
      status,
    },
  ] = useDeleteWashesMutation();

  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  //  Add Modal open handler
  const createHandler = () => {
    dispatch(
      openAddModal({
        modalId: settingsModalTypes.washCreate,
        data: null,
      })
    );
  };

  //  Edit Modal open handler
  const editHandler = (data) => {
    dispatch(
      openEditModal({
        modalId: settingsModalTypes.washEdit,
        data: data,
      })
    );
  };

  //Delete Alert
  const deleteFunction = (id: number) => {
    Swal.fire(swalWarning({}))?.then((result) => {
      if (result.isConfirmed) {
        deleteWashes(id);
      }
    });
  };

  // Delete SideEffect
  useSideEffects({
    error,
    isError: isErrorWater,
    isSuccess: isSuccessWater,
    message: "safe water sources",
    messageType: "delete",
    response: safeWaterData,
    status,
  });

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-textColor">WASH's</h3>

        <button className="main_btn" onClick={createHandler}>
          Add New
        </button>
      </div>

      <div className="bg-whiteColor rounded-lg">
        {isDataLoading && <TableSkeleton />}
        {isDataError && <ErrorPage />}
        {dataNotFound && <NotFound />}
        {isDataSuccess && (
          <>
            <Table className="min-w-[500px]">
              <TableHeader
                data={[
                  {
                    title: "Description",
                    w: "200px",
                  },
                  {
                    title: "",
                    w: "150px",
                  },
                ]}
              />
              {data?.data?.data?.map((item, index) => {
                return (
                  <TableBody
                    index={index}
                    key={index}
                    data={[
                      {
                        title: item?.description,
                        w: "200px",
                      },
                      {
                        title: (
                          <div className="flex items-center gap-3">
                            <button onClick={() => editHandler(item)}>
                              <BiEdit className="text-base font-bold text-cyan-600" />
                            </button>
                            <button onClick={() => deleteFunction(item?.oid)}>
                              <BiTrash className="text-base font-bold text-red-400" />
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

      {addModal?.modalId === settingsModalTypes.washCreate && (
        <DefaultModal title="Create Wash's " size="1xl" toggler={closeModal}>
          <WashCreate toggler={closeModal} />
        </DefaultModal>
      )}

      {editModal?.modalId === settingsModalTypes.washEdit && (
        <DefaultModal title="Edit Wash's " size="1xl" toggler={closeModal}>
          <WashEdit toggler={closeModal} />
        </DefaultModal>
      )}
    </>
  );
}

export default Wash;
