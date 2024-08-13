import { RootState } from "@/app/store";
import CustomPagination from "@/components/core/custom-pagination/CustomPagination";
import DefaultModal from "@/components/core/modal/DefaultModal";
import Table from "@/components/core/table/Table";
import TableBody from "@/components/core/table/TableBody";
import TableHeader from "@/components/core/table/TableHeader";
import { settingsModalTypes } from "@/constants/modal-types/modal-types";
import {
  useDeleteChiefdomMutation,
  useGetChiefdomByRegionIdQuery,
} from "@/features/chiefdom/chiefdom";
import {
  closeAddModal,
  closeEditModal,
  openAddModal,
  openEditModal,
} from "@/features/modal/modal-slice";
import { useGetSingleRegionQuery } from "@/features/region/region";
import { useGetSingleTinkhundlaQuery } from "@/features/tinkhundla/tinkhundla";
import { URLVillage } from "@/routers/routes-link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiEdit, BiTrash } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import ChiefdomCreate from "./Create";
import ChiefdomEdit from "./Edit";

const table = [
  {
    title: "Description",
    w: "200px",
  },
  {
    title: "",
    w: "150px",
  },
];
function Chiefdoms() {
  // * Local State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // * Hokes
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addModal, editModal } = useSelector(
    (state: RootState) => state.modal
  );
  const { data: selectedData } = useGetSingleTinkhundlaQuery(id);
  const { data: regionData } = useGetSingleRegionQuery(
    selectedData?.data?.regionId
  );
  const { data, isLoading } = useGetChiefdomByRegionIdQuery({
    inkhundlaId: id,
    page,
    limit,
  });
  const [deleteChiefdom, { deleteSuccess, deleteLoading }]: any =
    useDeleteChiefdomMutation();

  console.log(regionData?.data?.oid);

  // * Modal Close Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  // * Add Modal open handler
  const createHandler = () => {
    dispatch(
      openAddModal({
        modalId: settingsModalTypes.chiefdomsCreate,
        data: null,
      })
    );
  };

  // * Handle Open Edit Modal
  const handleOpenEditModal = (data) => {
    dispatch(
      openEditModal({
        modalId: settingsModalTypes.chiefdomsEdit,
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
        deleteChiefdom(id);
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
      <div className="flex items-center justify-center gap-2">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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
          <p>: {selectedData?.data?.description}</p>
        </div>
      </div>

      <div className="bg-whiteColor rounded-lg">
        {data?.data?.data?.length > 0 && (
          <>
            <Table className="min-w-[600px]">
              <TableHeader data={table} />
              {[...data?.data?.data]?.reverse()?.map((item, index) => {
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
                            <button onClick={() => handleOpenEditModal(item)}>
                              <BiEdit className="text-base font-bold text-cyan-600" />
                            </button>
                            <button onClick={() => handleDelete(item?.oid)}>
                              <BiTrash className="text-base font-bold text-red-400" />
                            </button>
                            <button
                              className="btn btn-xs text-[12px] font-normal rounded-md border-primaryColor text-primaryColor"
                              onClick={() => navigate(URLVillage(item?.oid))}
                            >
                              Villages
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
                showInPage={[10, 20]}
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

      {addModal?.modalId === settingsModalTypes.chiefdomsCreate && (
        <DefaultModal title="Create Chiefdom " size="1xl" toggler={closeModal}>
          <ChiefdomCreate toggler={closeModal} />
        </DefaultModal>
      )}

      {editModal?.modalId === settingsModalTypes.chiefdomsEdit && (
        <DefaultModal title="Edit Chiefdom " size="1xl" toggler={closeModal}>
          <ChiefdomEdit toggler={closeModal} />
        </DefaultModal>
      )}
    </>
  );
}

export default Chiefdoms;
