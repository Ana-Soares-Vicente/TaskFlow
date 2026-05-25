import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import "./layout.css";

const Layout = () => {
  return (
    <div className="container-layout">
      <main className="container-main">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;