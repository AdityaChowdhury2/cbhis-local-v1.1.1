import { closeAddModal, closeEditModal } from "@/features/modal/modal-slice";
import { styles } from "@/utilities/cn";
import { useDispatch } from "react-redux";

// Modal component props
type Props = {
  toggler?: () => void;
  children: React.ReactNode;
  title?: string;
  size?: string;
  className?: string;
  childrenStyle?: string;
};

// Modal component
const DefaultModal = ({
  toggler = () => {},
  children,
  title = "Modal title",
  size = "5xl",
  className = "",
  childrenStyle = "",
}: Props) => {
  // * Hokes
  const dispatch = useDispatch();

  let maxWidthClass = "max-w-[924px] 2xl:max-w-[1224px]"; // Default value

  switch (size) {
    case "1xl":
      maxWidthClass = "max-w-[572px]";
      break;
    case "2xl":
      maxWidthClass = "max-w-[672px]";
      break;
    case "3xl":
      maxWidthClass = "max-w-[768px]";
      break;
    case "4xl":
      maxWidthClass = "max-w-[896px]";
      break;
    case "5xl":
      maxWidthClass = "max-w-[924px] 2xl:max-w-[1224px]";
      break;

    default:
      break;
  }

  // * Close Modal Handler
  const closeModal = () => {
    dispatch(closeAddModal());
    dispatch(closeEditModal());
  };

  return (
    <>
      <div>
        {/* Toggler checkbox */}
        <input
          type="checkbox"
          checked
          id="my_modal_6"
          className="modal-toggle"
          onChange={() => {}}
        />

        {/* Modal */}
        <div className="modal !bg-modalOverlay" role="dialog">
          <div
            className={styles(
              `modal-box p-0 bg-whiteColor border border-borderColor min-h-[200px] overflow-hidden ${maxWidthClass} `,
              className
            )}
          >
            <div className="flex justify-between items-center border-b border-borderColor py-2 mx-8 pb sticky pt-5 top-0 bg-whiteBgColor z-50">
              {/* Title */}
              <h3 className="font-semibold text-textColor">{title}</h3>

              {/* Close button */}
              <button
                className="text-textColor flex items-center justify-center hover:bg-ashColor h-5 w-5 2xl:h-7 2xl:w-7 2xl:me-2 rounded absolute right-2 "
                onClick={toggler ? toggler : closeModal}
              >
                ✕
              </button>
            </div>

            {/* Children */}
            <div
              className={`px-8 py-6 pt-6 ${childrenStyle}`}
              style={{ maxHeight: "calc(100vh - 145px)", overflowY: "auto" }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DefaultModal;
