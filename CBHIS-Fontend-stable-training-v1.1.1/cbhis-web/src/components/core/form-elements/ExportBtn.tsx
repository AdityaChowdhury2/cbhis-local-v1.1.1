/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";
import { CiExport } from "react-icons/ci";

// export button component
const ExportBtn = ({
  csvDownloadHandler,
  xlsxDownloadHandler,
  disabled = false,
  className = "",
  isLoading = false,
}) => {
  return (
    // TITLE
    <div title="Export" className="dropdown">
      {/* EXPORT ICON */}
      <div
        tabIndex={0}
        role="button"
        className={styles("main_btn py-2.5 2xl:py-3", className)}
      >
        <CiExport size={20} />
      </div>

      {/* EXPORT DROPDOWN ITEM */}
      {!disabled && (
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu shadow rounded-lg bg-base-100  px-0 py-0"
        >
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <li
                onClick={csvDownloadHandler}
                className="p-2 hover:bg-gray-200 rounded-t-lg"
              >
                <a>CSV</a>
              </li>
              <li
                onClick={xlsxDownloadHandler}
                className="p-2 hover:bg-gray-200 rounded-b-lg"
              >
                <a>XLSX</a>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default ExportBtn;
