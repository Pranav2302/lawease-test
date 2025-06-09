import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

import SidebarCol from "@/myComponents/common/Sidebar";
import { useEffect } from "react";

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);

  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate()

  useEffect(() => {
    if(user?.accountType == "Client") {
      console.log(user);
      navigate("/dashboard/your-case")
    }
  }, [user])

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="relative flex">
      <SidebarCol />

      <div className="mt-16 flex-1 overflow-auto items-center justify-center flex">
        <div className="mx-auto w-11/12 max-w-[1000px] h-[90%]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
