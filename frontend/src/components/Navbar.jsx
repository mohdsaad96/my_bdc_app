import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-2 sm:px-4 h-12 sm:h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3 sm:gap-8">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 hover:opacity-80 transition-all">
              <div className="size-7 sm:size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              </div>
              <h1 className="text-base sm:text-lg font-bold">BDC Messenger</h1>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to={"/settings"}
              className={`btn btn-xs sm:btn-sm gap-1 sm:gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <button className="flex gap-1 sm:gap-2 items-center btn btn-xs sm:btn-sm" onClick={logout}>
                  <LogOut className="size-4 sm:size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
