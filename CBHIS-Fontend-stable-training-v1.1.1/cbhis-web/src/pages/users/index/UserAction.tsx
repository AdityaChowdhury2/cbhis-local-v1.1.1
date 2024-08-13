import { userModalTypes } from "@/constants/modal-types/modal-types";
import { openEditModal } from "@/features/modal/modal-slice";
import { BiEdit, BiTrash } from "react-icons/bi";
import { useDispatch } from "react-redux";

const UserAction = ({ user }) => {
  const dispatch = useDispatch();

  //Update Modal open handler
  const handleUpdateUser = (user) => {
    dispatch(
      openEditModal({
        modalId: userModalTypes.userEditModalTypes,
        data: user,
      })
    );
  };

  return (
    <div className="flex items-center gap-3">
      <button
        className="flex border px-1 py-0.5   text-cyan-600 rounded-sm items-center"
        onClick={() => handleUpdateUser(user)}
      >
        <BiEdit className="text-base font-bold " /> &nbsp; Edit
      </button>
      {false && (
        <button>
          <BiTrash className="text-base font-bold text-red-400" />
        </button>
      )}
      {false && (
        <button className="btn btn-xs text-[12px] font-normal rounded-md border-primaryColor text-primaryColor">
          Details
        </button>
      )}
    </div>
  );
};

export default UserAction;
