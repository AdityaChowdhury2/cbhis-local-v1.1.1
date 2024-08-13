import { styles } from "@/utilities/cn";
import { TfiSave } from "react-icons/tfi";

type Props = {
  className?: string;
  size?: number;
};

const SaveIcon = ({ className = "", size = 15 }: Props) => {
  return <TfiSave size={size} className={styles("", className)} />;
};

export default SaveIcon;
