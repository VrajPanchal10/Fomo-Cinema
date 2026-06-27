import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Film, Calendar, Ticket, Users, Home, MessageSquare } from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Movies", path: "/admin/movies", icon: Film },
    { name: "Shows", path: "/admin/shows", icon: Calendar },
    { name: "Bookings", path: "/admin/bookings", icon: Ticket },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            FoMo <span className="text-[#e5007d]">Admin</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-semibold tracking-wider">Cinema Management</p>

          <nav className="mt-8 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition duration-200 ${
                    isActive
                      ? "bg-[#e5007d] text-white shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-zinc-900">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-zinc-400 hover:text-white text-sm font-semibold transition"
          >
            <Home size={18} />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden bg-zinc-950/40">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
