import { RootState } from "@/app/store";
import CustomPagination from "@/components/core/custom-pagination/CustomPagination";
import DefaultModal from "@/components/core/modal/DefaultModal";
import Table from "@/components/core/table/Table";
import TableBody from "@/components/core/table/TableBody";
import TableHeader from "@/components/core/table/TableHeader";
import { settingsModalTypes } from "@/constants/modal-types/modal-types";
import {
  useDeleteAncTopicMutation,
  useGetAncTopicsQuery,
} from "@/features/anc-topic/ancTopic";
import {
  closeAddModal,
  closeEditModal,
  openAddModal,
  openEditModal,
} from "@/features/modal/modal-slice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiEdit, BiTrash } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import AncTopicCreate from "./Create";
import AncTopicEdit from "./Edit";

function AncTopic() {
  // * Local State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // * Hokes
  const dispatch = useDispatch();
  const { addModal, editModal } = useSelector(
    (state: RootState) => state.modal
  );
  const { data, isLoading } = useGetAncTopicsQuery({ page, limit });
  const [
    deleteAncTopic,
    { isLoading: deleteLoading, isSuccess: deleteSuccess },
  ] = useDeleteAncTopicMutation();

  // * Close Modal
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Delete Handler
  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAncTopic(id);
      }
    });
  };

  // * Add Modal open handler
  const createHandler = () => {
    dispatch(
      openAddModal({
        modalId: settingsModalTypes.ancTopicCreate,
        data: null,
      })
    );
  };

  // * Edit Modal open handler
  const handleOpenEditModal = (data) => {
    dispatch(
      openEditModal({
        modalId: settingsModalTypes.ancTopicEdit,
        data: data,
      })
    );
  };

  // * Action After Delete
  useEffect(() => {
    if (deleteSuccess && !deleteLoading) {
      toast.success("Delete Success");
    }
  }, [deleteLoading, deleteSuccess]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner-border text-primaryColor" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-textColor">ANC Topics</h3>

        <button className="main_btn" onClick={createHandler}>
          Add New
        </button>
      </div>

      <div className="bg-whiteColor rounded-lg">
        {data?.data?.data?.length > 0 && (
          <>
            <Table className="min-w-[500px]">
              <TableHeader
                data={[
                  {
                    title: "Topic",
                    w: "200px",
                  },
                  {
                    title: "Jobaid",
                    w: "200px",
                  },
                  {
                    title: "",
                    w: "150px",
                  },
                ]}
              />
              {[...data?.data?.data]?.map((item, index) => {
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
                        title: item?.jobaid,
                        w: "200px",
                      },
                      {
                        title: (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleOpenEditModal(item)}>
                              <BiEdit className="text-base font-bold text-cyan-600" />
                            </button>
                            <button onClick={() => handleDelete(item?.oid)}>
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
                showInPage={[2, 20, 30, 50]}
                activePage={page}
                setActivePage={(e) => setPage(e)}
              />
            </div>
          </>
        )}

        {data?.data?.data?.length === 0 && (
          <div className="flex justify-center items-center h-[200px] bg-whiteColor">
            <p className="text-[15px]">No Data Found</p>
          </div>
        )}
      </div>

      {addModal?.modalId === settingsModalTypes.ancTopicCreate && (
        <DefaultModal title="Create ANC Topic " size="1xl" toggler={closeModal}>
          <AncTopicCreate toggler={closeModal} />
        </DefaultModal>
      )}
      {editModal?.modalId === settingsModalTypes.ancTopicEdit && (
        <DefaultModal title="Edit ANC Topic " size="1xl" toggler={closeModal}>
          <AncTopicEdit toggler={closeModal} />
        </DefaultModal>
      )}
    </>
  );
}

export default AncTopic;
