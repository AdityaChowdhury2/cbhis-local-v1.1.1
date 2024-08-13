import { styles } from "@/utilities/cn";
import { IoArrowBackSharp } from "react-icons/io5";

type Props = {
  className?: string;
  size?: number;
};

const BackIcon = ({ className = "" , size= 14 }: Props) => {
  return <IoArrowBackSharp size={size} className={styles("", className)} />;
};

export default BackIcon;
