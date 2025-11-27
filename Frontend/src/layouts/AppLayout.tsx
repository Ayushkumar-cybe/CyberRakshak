import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export const AppLayout = () => {
  return (
    <div className="flex bg-white dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;