import CustomPagination from "@/components/core/custom-pagination/CustomPagination";
import Table from "@/components/core/table/Table";
import TableBody from "@/components/core/table/TableBody";
import TableHeader from "@/components/core/table/TableHeader";
import LineChart from "@/components/line-chart/LineChart";
import PieChart from "@/components/pie-chart/PieChart";
import { FaNotesMedical, FaUserCheck, FaUserFriends } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdPendingActions } from "react-icons/md";

function Dashboard() {
  return (
    <div className="mx-5 my-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        <DashboardBox
          title={"Facility Referrals"}
          icon={<FaNotesMedical size={26} className="text-textColor" />}
          value={"Total 200"}
          footer={"Assigned 200"}
        />
        <DashboardBox
          title={"Appointment"}
          icon={<MdPendingActions size={26} className="text-textColor" />}
          value={"Pending 500"}
          footer={"total 102"}
        />
        <DashboardBox
          title={"RHM's under me"}
          icon={<FaUserFriends size={26} className="text-textColor" />}
          value={"200"}
          footer={"140"}
        />
        <DashboardBox
          title={"RHM's in field"}
          icon={<FaUserCheck size={26} className="text-textColor" />}
          value={"200"}
          footer={"50%"}
        />
      </div>

      <div className="grid mt-5 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="rounded-lg border border-borderColor bg-whiteColor col-span-1 xl:col-span-2">
          <div className="flex justify-between border-b px-4 py-3 border-borderColor items-center">
            <p className="text-md font-bold">Data Sync rate</p>
            <IoMdSettings size={20} className="text-textColor" />
          </div>

          <div className="p-5">
            <LineChart />
          </div>
        </div>

        <div className="rounded-lg border border-borderColor bg-whiteColor col-span-1">
          <div className="flex justify-between border-b px-4 py-3 border-borderColor items-center">
            <p className="text-md font-bold">Top 3 Data Sync</p>
          </div>

          <div className="p-14">
            <PieChart />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <>
          <div className="bg-whiteColor rounded-lg">
            <Table className="min-w-[500px]">
              <TableHeader
                data={[
                  {
                    title: "RHM",
                    w: "200px",
                  },
                  {
                    title: "Sync Date",
                    w: "200px",
                  },
                  {
                    title: "Phone Number",
                    w: "200px",
                  },
                  {
                    title: "Total Records",
                    w: "200px",
                  },
                  {
                    title: "Pending Tasks",
                    w: "200px",
                  },
                  {
                    title: "",
                    w: "150px",
                  },
                ]}
              />
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]?.map((item, index) => {
                return (
                  <TableBody
                    index={index}
                    key={index}
                    data={[
                      {
                        title: "Reason Name " + item,
                        w: "200px",
                      },
                      {
                        title: "Reason Name " + item,
                        w: "200px",
                      },
                      {
                        title: "Reason Name " + item,
                        w: "200px",
                      },
                      {
                        title: "Reason Name " + item,
                        w: "200px",
                      },
                      {
                        title: "Reason Name " + item,
                        w: "200px",
                      },
                      {
                        title: (
                          <div className="flex items-center gap-3">
                            <button className="underline text-[12px]">
                              Details
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
                take={10}
                setTake={() => 10}
                start={1}
                setStart={() => 1}
                totalItemsCount={12}
                showInPage={[10, 20]}
                activePage={1}
                setActivePage={() => 1}
              />
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

export default Dashboard;

interface boxProps {
  title: string;
  icon: any;
  value: string;
  footer: string;
}

const DashboardBox = ({ footer, title, value, icon }: boxProps) => {
  return (
    <div className="rounded-lg border border-borderColor bg-whiteColor">
      <div className="flex justify-between border-b px-4 py-3 border-borderColor items-center">
        <p className="text-md font-bold">{title}</p>

        {icon}
      </div>
      <div className="mx-4 my-3">
        <b className="text-primaryColor text-xl">{value}</b>
        <p className="text-[9px]">{footer}</p>
      </div>
    </div>
  );
};
