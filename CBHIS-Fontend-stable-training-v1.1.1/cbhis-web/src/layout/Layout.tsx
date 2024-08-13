import { Outlet } from "react-router-dom";

type Props = {};

const Layout = ({}: Props) => {
  return (
    <div>
      Layout
      <Outlet />
    </div>
  );
};

export default Layout;
