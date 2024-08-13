/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { styles } from "@/utilities/cn";
import { BiLoader } from "react-icons/bi";

// Card loader component
function CardLoader() {
  return (
    <div className={styles("flex justify-center items-center w-full h-40  ")}>
      <div className="animate-spin ">
        <BiLoader size={40} />
      </div>
    </div>
  );
}

export default CardLoader;
