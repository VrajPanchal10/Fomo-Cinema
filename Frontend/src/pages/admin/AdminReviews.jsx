import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader2, Search, Check, X, Trash2, MessageSquare, AlertTriangle } from "lucide-react";

const AdminReviews = () => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" means All
  const [errorMsg, setErrorMsg] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchReviews = async () => {
    try {
      const data = await adminService.getReviews(statusFilter, searchQuery);
      setReviews(data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setErrorMsg(error.message || "Failed to load customer reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchReviews();
  };

  const handleApprove = async (id) => {
    setSubmittingId(id);
    try {
      await adminService.approveReview(id);
      addToast("Review approved successfully.", "success");
      fetchReviews();
    } catch (error) {
      addToast(error.message || "Failed to approve review.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id) => {
    setSubmittingId(id);
    try {
      await adminService.rejectReview(id);
      addToast("Review rejected successfully.", "success");
      fetchReviews();
    } catch (error) {
      addToast(error.message || "Failed to reject review.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setSubmittingId(id);
    try {
      await adminService.deleteReview(id);
      addToast("Review deleted successfully.", "success");
      setDeleteConfirmId(null);
      fetchReviews();
    } catch (error) {
      addToast(error.message || "Failed to delete review.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <span className="text-yellow-400 font-semibold tracking-wide">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </span>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#e5007d]" size={48} />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-10 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-2xl max-w-md mx-auto p-6 shadow-2xl">
        <h2 className="text-lg font-bold mb-2">Error Loading Reviews</h2>
        <p className="text-sm font-semibold">{errorMsg}</p>
        <p className="text-xs text-zinc-500 mt-4">Please verify your administrator session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <MessageSquare className="text-[#e5007d]" />
            <span>Customer Reviews</span>
          </h1>
          <p className="text-zinc-400 mt-1">Moderate, search, and approve reviews submitted by moviegoers.</p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-800 pb-4">
        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "All Reviews", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                statusFilter === tab.value
                  ? "bg-[#e5007d] text-white shadow-lg shadow-pink-900/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, email, movie, content..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#e5007d] transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs sm:text-sm font-semibold text-white transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Reviews Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review Text</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-zinc-500">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-[#e5007d]" size={18} />
                        Loading results...
                      </span>
                    ) : (
                      "No reviews found matching the filters."
                    )}
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const username = r.user ? r.user.name : "Anonymous";
                  const email = r.user ? r.user.email : "";
                  const movieTitle = r.movie ? r.movie.title : "Unknown Movie";
                  const bookingId = r.booking ? r.booking.bookingId : "N/A";
                  const statusColors = {
                    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
                    approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                    rejected: "text-rose-400 bg-rose-400/10 border-rose-400/20",
                  };

                  return (
                    <tr key={r._id} className="hover:bg-zinc-900/10 transition">
                      <td className="px-6 py-4 max-w-[180px]">
                        <div className="font-bold text-white truncate">{username}</div>
                        <div className="text-xs text-zinc-500 truncate mt-0.5">{email}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium truncate max-w-[150px]">
                        {movieTitle}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs font-mono">
                        {bookingId}
                      </td>
                      <td className="px-6 py-4 shrink-0">
                        {renderStars(r.rating)}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 text-xs max-w-[250px] truncate group relative cursor-help">
                        <span>{r.review}</span>
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-zinc-950 border border-zinc-800 p-3 rounded-lg w-72 text-zinc-200 text-xs whitespace-pre-line z-50 shadow-2xl leading-relaxed">
                          {r.review}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusColors[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status !== "approved" && (
                            <button
                              disabled={submittingId === r._id}
                              onClick={() => handleApprove(r._id)}
                              title="Approve Review"
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              disabled={submittingId === r._id}
                              onClick={() => handleReject(r._id)}
                              title="Reject Review"
                              className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <button
                            disabled={submittingId === r._id}
                            onClick={() => setDeleteConfirmId(r._id)}
                            title="Delete Review"
                            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-rose-600 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer disabled:opacity-50"
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Review?</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              This action is permanent and cannot be undone. Any ratings associated with this review will be removed.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                disabled={submittingId === deleteConfirmId}
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white rounded-lg transition font-semibold text-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={submittingId === deleteConfirmId}
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition font-bold text-sm cursor-pointer disabled:opacity-50"
              >
                {submittingId === deleteConfirmId ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
