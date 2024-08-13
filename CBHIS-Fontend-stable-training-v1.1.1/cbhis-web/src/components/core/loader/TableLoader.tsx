/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

import { LineSkeleton } from "../skeleton/Skeleton";

// Lader for table
function TableLoader() {
  return (
    <div className="mt-2 mb-5">
      <LineSkeleton className="rounded" />
      <LineSkeleton className="rounded" />
      <LineSkeleton className="rounded" />
      <LineSkeleton className="rounded" />
    </div>
  );
}

export default TableLoader;
