import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { formatDate, formatTime, weekday } from "../../utils/dateUtils";
import { Loader2, Plus, Edit2, Trash2, X, AlertTriangle, Search } from "lucide-react";

// ─── Seat layout presets ──────────────────────────────────────────────────────
const layouts = {
  default44: {
    name: "Default Layout (44 seats)",
    totalSeats: 44,
    config: null, // Backend fills in the default
  },
  premium30: {
    name: "Premium Recliner Layout (30 seats)",
    totalSeats: 30,
    config: [
      {
        row: "A",
        type: "recliner",
        seats: [
          { type: "seat", num: 1 }, { type: "seat", num: 2 }, { type: "seat", num: 3 },
          { type: "spacer" },
          { type: "seat", num: 4 }, { type: "seat", num: 5 }, { type: "seat", num: 6 },
        ],
      },
      {
        row: "B",
        type: "recliner",
        seats: [
          { type: "seat", num: 1 }, { type: "seat", num: 2 }, { type: "seat", num: 3 },
          { type: "spacer" },
          { type: "seat", num: 4 }, { type: "seat", num: 5 }, { type: "seat", num: 6 },
        ],
      },
      {
        row: "C",
        type: "share",
        seats: [
          { type: "seat", num: 1 }, { type: "seat", num: 2 },
          { type: "spacer" },
          { type: "seat", num: 3 }, { type: "seat", num: 4 },
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
const AdminShows = () => {
  const { addToast } = useToast();

  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters & sort
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateTimeAsc");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingShow, setEditingShow] = useState(null);

  // Form fields
  const [movieId, setMovieId] = useState("");
  const [showDate, setShowDate] = useState("");   // YYYY-MM-DD
  const [showTime, setShowTime] = useState("");   // HH:MM
  const [ticketPrice, setTicketPrice] = useState(15.0);
  const [screenName, setScreenName] = useState("Screen 1");
  const [totalSeats, setTotalSeats] = useState(44);
  const [status, setStatus] = useState("Active");
  const [layoutType, setLayoutType] = useState("default44");

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToDelete, setShowToDelete] = useState(null);

  // ── Data loading ────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [showData, movieData] = await Promise.all([
        adminService.getShows(),
        adminService.getMovies(),
      ]);
      const activeMovies = (movieData || []).filter((m) => m.isActive !== false);
      setShows(showData || []);
      setMovies(activeMovies);
      if (activeMovies.length > 0 && !movieId) {
        setMovieId(activeMovies[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch shows/movies:", err);
      setErrorMsg(err.message || "Failed to load show data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setEditingShow(null);
    setMovieId(movies.length > 0 ? movies[0]._id : "");
    setShowDate("");
    setShowTime("");
    setTicketPrice(15.0);
    setScreenName("Screen 1");
    setTotalSeats(44);
    setStatus("Active");
    setLayoutType("default44");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (show) => {
    setEditingShow(show);
    setMovieId(show.movie?._id || "");

    if (show.showDateTime) {
      // Parse the showDateTime and extract IST components for the form
      // showDate and showTime virtuals come from the backend, use them directly
      setShowDate(show.showDate || "");
      setShowTime(show.showTime || "");
    } else {
      setShowDate("");
      setShowTime("");
    }

    setTicketPrice(show.ticketPrice || 15.0);
    setScreenName(show.screenName || "Screen 1");
    setTotalSeats(show.totalSeats || 44);
    setStatus(show.status || "Active");
    setLayoutType(
      show.seatConfiguration && Array.isArray(show.seatConfiguration) &&
      show.seatConfiguration.length === 3
        ? "premium30"
        : "default44"
    );
    setShowModal(true);
  };

  // ── Form submission ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieId) { addToast("Please select a movie.", "error"); return; }
    if (!showDate || !showTime) { addToast("Please specify show date and time.", "error"); return; }

    // Combine YYYY-MM-DD + HH:MM into an ISO local string.
    // The backend stores as UTC; the Show model's virtuals derive IST display.
    // We send the datetime with IST offset so the server stores the correct UTC.
    const IST_OFFSET = "+05:30";
    const showDateTimeStr = `${showDate}T${showTime}:00${IST_OFFSET}`;

    const selectedLayout = layouts[layoutType];
    const payload = {
      movieId,
      showDateTime: showDateTimeStr,
      ticketPrice: Number(ticketPrice),
      screenName,
      totalSeats: Number(totalSeats),
      seatConfiguration: selectedLayout.config,
      status,
    };

    try {
      if (editingShow) {
        await adminService.updateShow(editingShow._id, payload);
        addToast("Show session updated successfully.", "success");
      } else {
        await adminService.createShow(payload);
        addToast("Show session created successfully.", "success");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Error saving show:", err);
      addToast(err.message || "Failed to save show session.", "error");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const confirmDelete = (show) => {
    setShowToDelete(show);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!showToDelete) return;
    try {
      await adminService.deleteShow(showToDelete._id);
      addToast("Show session deleted.", "success");
      setShowDeleteConfirm(false);
      setShowToDelete(null);
      fetchData();
    } catch (err) {
      console.error("Error deleting show:", err);
      addToast(err.message || "Failed to delete show.", "error");
    }
  };

  const handleLayoutChange = (e) => {
    const val = e.target.value;
    setLayoutType(val);
    setTotalSeats(layouts[val]?.totalSeats || 44);
  };

  // ── Filtering & sorting ─────────────────────────────────────────────────────
  const getFilteredAndSortedShows = () => {
    let result = [...shows];
    const now = new Date();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.movie?.title?.toLowerCase().includes(q) ||
          s.screenName?.toLowerCase().includes(q) ||
          s.status?.toLowerCase().includes(q)
      );
    }

    if (filterStatus === "today") {
      const todayStr = now.toDateString();
      result = result.filter((s) => s.showDateTime && new Date(s.showDateTime).toDateString() === todayStr);
    } else if (filterStatus === "upcoming") {
      result = result.filter((s) => s.showDateTime && new Date(s.showDateTime) >= now && s.status !== "Archived");
    } else if (filterStatus === "completed") {
      result = result.filter((s) => s.status === "Completed");
    } else if (filterStatus === "cancelled") {
      result = result.filter((s) => s.status === "Cancelled");
    } else if (filterStatus === "archived") {
      result = result.filter((s) => s.status === "Archived");
    }

    result.sort((a, b) => {
      if (sortBy === "dateTimeAsc") return new Date(a.showDateTime) - new Date(b.showDateTime);
      if (sortBy === "dateTimeDesc") return new Date(b.showDateTime) - new Date(a.showDateTime);
      if (sortBy === "movieTitle") return (a.movie?.title || "").localeCompare(b.movie?.title || "");
      return 0;
    });

    return result;
  };

  const filteredShows = getFilteredAndSortedShows();

  // ── Render ──────────────────────────────────────────────────────────────────
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
        <h2 className="text-lg font-bold mb-2">Error Loading Shows</h2>
        <p className="text-sm font-semibold">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Showtimes Management</h1>
          <p className="text-zinc-400 mt-1">Schedule and manage movie sessions dynamically.</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={movies.length === 0}
          className={`bg-[#e5007d] hover:bg-pink-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-[#e5007d]/20 transition transform hover:scale-[1.02] duration-200 ${movies.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Plus size={18} />
          <span>Add Show</span>
        </button>
      </div>

      {movies.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl text-sm">
          Please add at least one active Movie before managing show sessions.
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search movie, screen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e5007d]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
            >
              <option value="all">All Shows</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
            >
              <option value="dateTimeAsc">Date &amp; Time (Asc)</option>
              <option value="dateTimeDesc">Date &amp; Time (Desc)</option>
              <option value="movieTitle">Movie Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shows Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Screen</th>
                <th className="px-6 py-4">Weekday</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {filteredShows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-zinc-500">
                    No shows match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredShows.map((show) => {
                  const bookedCount = show.bookedSeats ? show.bookedSeats.length : 0;
                  const availableCount = Math.max(0, (show.totalSeats || 0) - bookedCount);

                  let statusColor = "bg-zinc-900 text-zinc-400";
                  if (show.status === "Active") statusColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  else if (show.status === "Scheduled") statusColor = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                  else if (show.status === "Cancelled") statusColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  else if (show.status === "Sold Out") statusColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                  else if (show.status === "Completed") statusColor = "bg-zinc-800 text-zinc-400";
                  else if (show.status === "Archived") statusColor = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

                  // Use shared dateUtils or fall back to virtual fields from API
                  const displayWeekday = show.weekday || weekday(show.showDateTime) || "—";
                  const displayDate = show.showDate
                    ? show.showDate
                    : formatDate(show.showDateTime) || "—";
                  // The virtual showTime (HH:MM) comes from the API; fall back to formatTime
                  const displayTime = show.showTime || formatTime(show.showDateTime) || "—";

                  return (
                    <tr key={show._id} className="hover:bg-zinc-900/20 transition">
                      <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">
                        {show.movie?.title || "Unknown Movie"}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 capitalize">{show.screenName || "Screen 1"}</td>
                      <td className="px-6 py-4 text-zinc-300">{displayWeekday}</td>
                      <td className="px-6 py-4 text-zinc-300">{displayDate}</td>
                      <td className="px-6 py-4 text-zinc-300 font-mono">{displayTime}</td>
                      <td className="px-6 py-4 text-zinc-300">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-zinc-200">Total: {show.totalSeats}</span>
                          <span className="text-zinc-400">Booked: {bookedCount}</span>
                          <span className="text-zinc-500">Available: {availableCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        ${typeof show.ticketPrice === "number" ? show.ticketPrice.toFixed(2) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                          {show.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(show)}
                            className="p-2 rounded-lg bg-zinc-950/40 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition cursor-pointer"
                            title="Edit Session"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => confirmDelete(show)}
                            className="p-2 rounded-lg bg-rose-950/20 text-rose-400 hover:text-rose-300 hover:bg-rose-900 border border-rose-900/30 transition cursor-pointer"
                            title="Delete Session"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white">
                {editingShow ? "Edit Show Session" : "Add Show Session"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
              <div className="p-6 space-y-4 flex-1">
                {/* Movie Selector */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold uppercase">Select Movie *</label>
                  <select
                    required
                    value={movieId}
                    onChange={(e) => setMovieId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                  >
                    <option value="" disabled>-- Select a Movie --</option>
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Show Date (IST) *</label>
                    <input
                      type="date"
                      required
                      value={showDate}
                      onChange={(e) => setShowDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Show Time (IST) *</label>
                    <input
                      type="time"
                      required
                      value={showTime}
                      onChange={(e) => setShowTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                </div>

                {/* Ticket Price & Screen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Ticket Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Screen Name *</label>
                    <select
                      value={screenName}
                      onChange={(e) => setScreenName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    >
                      <option value="Screen 1">Screen 1</option>
                      <option value="Screen 2">Screen 2</option>
                      <option value="Screen 3">Screen 3</option>
                    </select>
                  </div>
                </div>

                {/* Layout & Seat Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Seat Configuration *</label>
                    <select
                      value={layoutType}
                      onChange={handleLayoutChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    >
                      <option value="default44">Default Layout (44 Seats)</option>
                      <option value="premium30">Premium Recliner Layout (30 Seats)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Seat Capacity *</label>
                    <input
                      type="number"
                      required
                      readOnly
                      value={totalSeats}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold uppercase">Show Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Active">Active</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Sold Out">Sold Out</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-900 bg-zinc-950 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-medium text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#e5007d] hover:bg-pink-700 text-white font-semibold text-sm transition cursor-pointer shadow-lg shadow-[#e5007d]/20"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold">Delete Show Session</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Are you sure you want to permanently delete the session of{" "}
              <span className="text-white font-semibold">"{showToDelete?.movie?.title}"</span> on{" "}
              <span className="text-white font-semibold">
                {showToDelete?.showDate || formatDate(showToDelete?.showDateTime)}
              </span>{" "}
              at{" "}
              <span className="text-white font-semibold">
                {showToDelete?.showTime || formatTime(showToDelete?.showDateTime)}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setShowToDelete(null); }}
                className="flex-1 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition text-zinc-300 hover:text-white font-medium text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 transition text-white font-semibold text-sm cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShows;
