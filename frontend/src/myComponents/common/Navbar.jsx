import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';


import {
  ScaleIcon,
  LayoutDashboardIcon,
  UsersIcon,
  TrophyIcon,
  StarIcon,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "../../assets/logoImg.jpg";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/services/operations/authAPI";
import { useContext } from "react";
import { SocketContext } from "@/context/SocketContext";


export default function Navbar() {

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const {socket} = useContext(SocketContext)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // FIXME:
    // socket.current.emit("signout", user?._id);
    dispatch(logout(navigate));
  }
  

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-opacity-40 backdrop-filter backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <img src={Logo} className="h-10"></img>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary opacity-100 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    : "text-gray-800 opacity-50 hover:opacity-100 transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                }
              >
                <LayoutDashboardIcon className="h-4 w-4 mr-1" />
                Dashboard
              </NavLink>
              <NavLink
                to="/providers"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary opacity-100 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    : "text-gray-800 opacity-50 hover:opacity-100 transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                }
              >
                <UsersIcon className="h-4 w-4 mr-1" />
                Providers
              </NavLink>
              <NavLink
                to="/leaderboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary opacity-100 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    : "text-gray-800 opacity-50 hover:opacity-100 transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                }
              >
                <TrophyIcon className="h-4 w-4 mr-1" />
                Leaderboard
              </NavLink>
            </div>
          </div>
          {token == null ? (
            <NavLink to={"/login"}>
            <div className="hidden md:block">
              <Button variant="outline" className="ml-4">
                Login
              </Button>
            </div>
          </NavLink>
          ) : (
            <div className="hidden md:block">
              <Button onClick={handleLogout} variant="outline" className="ml-4 bg-primary-foreground ">
              Logout<LogOut/>
              </Button>
            </div>
          )}
          <div className="md:hidden">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      
    </nav>
  );
}
