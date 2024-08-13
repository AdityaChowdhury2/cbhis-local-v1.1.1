import { styles } from "@/utilities/cn";
import { HiOutlinePlusSm } from "react-icons/hi";

type Props = {
  className?: string;
  size?: number;
};

const PlusIcon = ({ className = "", size = 17 }: Props) => {
  return <HiOutlinePlusSm size={size} className={styles("", className)} />;
};

export default PlusIcon;
