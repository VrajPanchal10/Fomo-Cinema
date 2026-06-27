import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import { Loader2, Search } from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchBookings = async () => {
    try {
      const data = await adminService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setErrorMsg(error.message || "Failed to retrieve platform bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const query = searchQuery.toLowerCase();
    const bookingId = booking.bookingId?.toLowerCase() || "";
    const userName = booking.user?.name?.toLowerCase() || "";
    const userEmail = booking.user?.email?.toLowerCase() || "";
    const movieTitle = booking.movie?.title?.toLowerCase() || "";
    return (
      bookingId.includes(query) ||
      userName.includes(query) ||
      userEmail.includes(query) ||
      movieTitle.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#e5007d]" size={48} />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-10 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-2xl max-w-md mx-auto p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-2">Error Loading Bookings</h2>
        <p className="text-sm font-semibold">{errorMsg}</p>
        <p className="text-xs text-zinc-500 mt-4">Please verify your administrator session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Bookings Register</h1>
        <p className="text-zinc-400 mt-1">Read-only historical and current booking transactions log.</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3.5 text-zinc-500" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, User, or Movie..."
          className="w-full bg-zinc-905 bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#e5007d] transition"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Session Date/Time</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Booked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-zinc-500">
                    No matching bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-zinc-900/20 transition">
                    <td className="px-6 py-4 font-mono font-bold text-white uppercase tracking-wider">
                      {booking.bookingId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-zinc-100">{booking.user?.name || "Deleted User"}</p>
                        <p className="text-xs text-zinc-400">{booking.user?.email}</p>
                        <p className="text-xs text-zinc-500">{booking.user?.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-200">
                      {booking.movie?.title || "Deleted Movie"}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <p className="capitalize font-semibold">{booking.show?.date || booking.day}</p>
                      <p className="text-xs text-zinc-500">{booking.show?.time || booking.time}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium">
                      {booking.selectedSeats.join(", ")}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ${booking.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        booking.bookingStatus === "active" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border border-rose-400/20"
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {new Date(booking.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
