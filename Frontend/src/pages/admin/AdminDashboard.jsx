import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import { Loader2, Users, Film, Calendar, Ticket, CheckCircle, XCircle, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await adminService.getStats();
        setData(result);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
        setErrorMsg(error.message || "Failed to retrieve statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#e5007d]" size={48} />
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="text-center py-10 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-2xl max-w-md mx-auto p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-2">Error Loading Statistics</h2>
        <p className="text-sm font-semibold">{errorMsg || "Database or network failure occurred."}</p>
        <p className="text-xs text-zinc-500 mt-4">Please ensure you are authenticated with an administrator account.</p>
      </div>
    );
  }

  const { stats, recentActivity } = data;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "Total Movies", value: stats.totalMovies, icon: Film, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { label: "Total Shows", value: stats.totalShows, icon: Calendar, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { label: "Total Bookings", value: stats.totalBookings, icon: Ticket, color: "text-[#e5007d] bg-[#e5007d]/10 border-[#e5007d]/20" },
    { label: "Active Bookings", value: stats.activeBookings, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Cancelled Bookings", value: stats.cancelledBookings, icon: XCircle, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
    { label: "Estimated Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-1">Real-time statistics and activity updates.</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border bg-zinc-900/40 backdrop-blur-md flex items-center justify-between shadow-xl ${card.color}`}
            >
              <div className="space-y-1">
                <span className="text-zinc-400 text-sm font-semibold block">{card.label}</span>
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white block">{card.value}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/40">
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Recent Bookings */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2 border-b border-zinc-900 pb-2">
            <Ticket className="text-[#e5007d]" size={20} />
            <span>Recent Bookings</span>
          </h2>
          <div className="flex-1 space-y-4">
            {recentActivity.bookings.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4">No recent bookings.</p>
            ) : (
              recentActivity.bookings.map((booking) => (
                <div key={booking._id} className="text-sm bg-zinc-950/20 border border-zinc-900 p-3 rounded-lg flex justify-between items-start">
                  <div className="space-y-0.5 truncate">
                    <p className="font-semibold text-zinc-100 truncate">
                      {booking.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      Booked <span className="text-white font-medium">{booking.movie?.title || "Unknown Movie"}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Seats: {booking.selectedSeats.join(", ")} | Total: ${booking.totalAmount}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    booking.bookingStatus === "active" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/25" : "text-rose-400 bg-rose-400/10 border border-rose-400/25"
                  }`}>
                    {booking.bookingStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2 border-b border-zinc-900 pb-2">
            <Users className="text-blue-500" size={20} />
            <span>Recent Users</span>
          </h2>
          <div className="flex-1 space-y-4">
            {recentActivity.users.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4">No recent registrations.</p>
            ) : (
              recentActivity.users.map((u) => (
                <div key={u._id} className="text-sm bg-zinc-950/20 border border-zinc-900 p-3 rounded-lg space-y-1">
                  <p className="font-semibold text-zinc-100 truncate">{u.name}</p>
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span className="truncate">{u.email}</span>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Movies */}
        <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2 border-b border-zinc-900 pb-2">
            <Film className="text-purple-500" size={20} />
            <span>Latest Movie Additions</span>
          </h2>
          <div className="flex-1 space-y-4">
            {recentActivity.movies.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4">No movies added yet.</p>
            ) : (
              recentActivity.movies.map((movie) => (
                <div key={movie._id} className="text-sm bg-zinc-950/20 border border-zinc-900 p-3 rounded-lg flex justify-between items-center">
                  <div className="truncate">
                    <p className="font-semibold text-zinc-100 truncate">{movie.title}</p>
                    <p className="text-xs text-zinc-400 capitalize">{movie.status.replace("-", " ")}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
