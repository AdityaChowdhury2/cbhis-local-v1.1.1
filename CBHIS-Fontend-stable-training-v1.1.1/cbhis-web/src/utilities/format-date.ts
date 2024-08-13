import dayjs from "dayjs";

export const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return "";
  }

  const parsedDate = dayjs(dateString);

  if (!parsedDate.isValid()) {
    console.error(`Invalid date string: ${dateString}`);
    return "Invalid Date";
  }

  return parsedDate.format("DD/MMM/YYYY, HH:mm:ss A");
};
