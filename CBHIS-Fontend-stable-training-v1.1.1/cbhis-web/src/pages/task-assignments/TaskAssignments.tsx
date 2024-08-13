import TaskAssignmentForm from "@/components/task-assignments/TaskAssignmentForm";
import { styles } from "@/utilities/cn";
import { useState } from "react";

type Props = {};

const TaskAssignments = ({}: Props) => {
  const [isActiveButton, setIsActiveButton] = useState("1");
  return (
    <div className="px-3">
      <div className="grid xl:grid-cols-3 gap-5 w-full">
        <div className="space-y-4 md:space-y-0 xl:space-y-4 md:flex xl:block items-center justify-center gap-4 w-full">
          <Button
            onClick={() => setIsActiveButton("1")}
            title="Referrals from facilities"
            subTitle="Unassigned referrals"
            count="404"
            isActiveButton={isActiveButton}
            index={1}
            className="full"
          />
          <Button
            onClick={() => setIsActiveButton("2")}
            title="General Activities"
            subTitle="Average page load time"
            count="444"
            isActiveButton={isActiveButton}
            index={2}
            className="w-full"
          />
        </div>
        <div className="col-span-2">
          <h2 className="my-4 md:my-0">Appointment Details</h2>
          {isActiveButton && <TaskAssignmentForm state={isActiveButton} />}
        </div>
      </div>
      <div className="bg-whiteColor rounded-lg p-5">
        <h2>Appointments</h2>
        <div className="border border-borderColor p-4 mt-5 rounded-lg">
          {array?.map((item, index) => {
            return (
              <div
                key={index}
                className={styles(
                  "border-b py-5",
                  {
                    "border-none pb-0": array?.length - 1 === index,
                  },
                  {
                    "pt-0": 0 === index,
                  }
                )}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="">{item?.name}</h4>
                    <h4 className="text-grayTextColor">{item?.title}</h4>
                  </div>
                  <div className="space-x-2">
                    <button className="text-sm bg-borderColor px-5 py-0.5 rounded-full">
                      {item?.priority}
                    </button>
                    <button className="text-sm bg-borderColor px-5 py-0.5 rounded-full">
                      {item?.status}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-textColor mt-2">{item?.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskAssignments;

const array = [
  {
    name: "Client 1",
    title: "Assign to RHM 1",
    priority: "Low",
    status: "Pending",
    desc: "In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available.",
  },
  {
    name: "Client 1",
    title: "Assign to RHM 1",
    priority: "Critical",
    status: "Completed",
    desc: "In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available.",
  },
];

const Button = ({
  onClick,
  isActiveButton,
  title = "",
  subTitle = "",
  count = "",
  index,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={styles(
        "p-4 border border-borderColor rounded-xl flex justify-between items-center gap-8 w-full xl: max-w-[380px]",
        className,
        { "bg-blueColor": isActiveButton == index }
      )}
    >
      <div className="">
        <h3
          className={styles("text-start text-lg xl:text-xl font-semibold", {
            "text-white": isActiveButton == index,
          })}
        >
          {title}
        </h3>
        <h4
          className={styles("text-start text-grayTextColor", {
            "text-gray-300": isActiveButton == index,
          })}
        >
          {subTitle}
        </h4>
      </div>
      <h2 className={styles("", { "text-white": isActiveButton == index })}>
        {count}
      </h2>
    </button>
  );
};
