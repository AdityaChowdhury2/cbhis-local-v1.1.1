import { RootState } from "@/app/store";
import CustomPagination from "@/components/core/custom-pagination/CustomPagination";
import DefaultModal from "@/components/core/modal/DefaultModal";
import Table from "@/components/core/table/Table";
import TableBody from "@/components/core/table/TableBody";
import TableHeader from "@/components/core/table/TableHeader";
import { settingsModalTypes } from "@/constants/modal-types/modal-types";
import { useGetSingleChiefdomQuery } from "@/features/chiefdom/chiefdom";
import {
  closeAddModal,
  closeEditModal,
  openAddModal,
  openEditModal,
} from "@/features/modal/modal-slice";
import { useGetSingleRegionQuery } from "@/features/region/region";
import { useGetSingleTinkhundlaQuery } from "@/features/tinkhundla/tinkhundla";
import {
  useDeleteVillageMutation,
  useReadVillageByChiefdomQuery,
} from "@/features/village/village-api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiEdit, BiTrash } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import VillageCreate from "./Create";
import VillageEdit from "./Edit";

const table = [
  {
    title: "Description",
    w: "200px",
  },
  {
    title: "",
    w: "80px",
  },
];
function Village() {
  // * Local State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // * Hokes
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addModal, editModal } = useSelector(
    (state: RootState) => state.modal
  );
  const { id } = useParams();
  const { data, isLoading } = useReadVillageByChiefdomQuery({
    chiefdomId: id,
    page,
    limit,
  });
  const { data: selectedData } = useGetSingleChiefdomQuery(id);
  const { data: tinkhundla } = useGetSingleTinkhundlaQuery(
    selectedData?.data?.inkhundlaId
  );
  const { data: regionData } = useGetSingleRegionQuery(
    tinkhundla?.data?.regionId
  );
  const [deleteVillage, { deleteSuccess, deleteLoading }]: any =
    useDeleteVillageMutation();

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Add Modal open handler
  const createHandler = () => {
    dispatch(
      openAddModal({
        modalId: settingsModalTypes.villageCreate,
        data: null,
      })
    );
  };

  // * Edit Modal Open
  const handleEditModalOpen = (data) => {
    dispatch(
      openEditModal({
        modalId: settingsModalTypes.villageEdit,
        data: data,
      })
    );
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
        deleteVillage(id);
      }
    });
  };

  // * Action After Delete
  useEffect(() => {
    if (deleteSuccess && !deleteLoading) {
      toast.success("Delete Success");
    }
  }, [deleteLoading, deleteSuccess]);

  // * Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px] bg-whiteColor">
        <p className="text-[15px]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <button
          className="btn btn-sm text-[12px] font-normal rounded-md border-primaryColor text-primaryColor"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>
        <button className="main_btn" onClick={createHandler}>
          Add New
        </button>
      </div>

      <div className="my-5 border rounded-md p-5 bg-[#3E5EB920]">
        <div className="flex items-center text-textColor">
          <b className="text-[15px] w-[100px]">Regions</b>
          <p>: {regionData?.data?.description}</p>
        </div>

        <div className="flex items-center text-textColor mt-2">
          <b className="text-[15px] w-[100px]">Tinkhundla</b>
          <p>: {tinkhundla?.data?.description}</p>
        </div>

        <div className="flex items-center text-textColor mt-2">
          <b className="text-[15px] w-[100px]">Chiefdoms</b>
          <p>: {selectedData?.data?.description}</p>
        </div>
      </div>

      <div className="bg-whiteColor rounded-lg">
        {data?.data?.data?.length > 0 && (
          <>
            <Table className="min-w-[600px]">
              <TableHeader data={table} />
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
                        title: (
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleEditModalOpen(item)}>
                              <BiEdit className="text-base font-bold text-cyan-600" />
                            </button>
                            <button onClick={() => handleDelete(item?.oid)}>
                              <BiTrash className="text-base font-bold text-red-400" />
                            </button>
                          </div>
                        ),
                        w: "80px",
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
                showInPage={[10, 20, 30, 40, 50]}
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

      {addModal?.modalId === settingsModalTypes.villageCreate && (
        <DefaultModal title="Create Village " size="1xl" toggler={closeModal}>
          <VillageCreate toggler={closeModal} />
        </DefaultModal>
      )}

      {editModal?.modalId === settingsModalTypes.villageEdit && (
        <DefaultModal title="Edit Village " size="1xl" toggler={closeModal}>
          <VillageEdit toggler={closeModal} />
        </DefaultModal>
      )}
    </>
  );
}

export default Village;
