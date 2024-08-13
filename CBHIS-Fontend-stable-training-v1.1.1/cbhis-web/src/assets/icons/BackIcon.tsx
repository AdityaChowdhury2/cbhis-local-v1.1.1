import { styles } from "@/utilities/cn";
import { MdKeyboardBackspace } from "react-icons/md";

type Props = {
  className?: string;
  size?: number;
};

const BackIconOnly = ({ className = "", size = 20 }: Props) => {
  return (
    <MdKeyboardBackspace
      size={size}
      className={styles("text-textColor", className)}
    />
  );
};

export default BackIconOnly;
