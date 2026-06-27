import { useEffect, useState } from "react";
import { bookingService, getMovieImage, reviewService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Loader2, Calendar, Clock, Square, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const MyBookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // Review states
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleOpenReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewText("");
  };

  const handleCloseReviewModal = () => {
    setReviewBooking(null);
  };

  const handleSubmittingReview = async (e) => {
    e.preventDefault();
    if (reviewText.trim().length < 10) {
      addToast("Review must be at least 10 characters long.", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      const movieId = reviewBooking.movie ? reviewBooking.movie._id || reviewBooking.movie.id : "";
      await reviewService.createReview(movieId, reviewBooking._id, reviewRating, reviewText);
      addToast("Review submitted successfully. Waiting for admin approval.", "success");
      handleCloseReviewModal();
      
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      addToast(err.message || "Failed to submit review.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        if (active) {
          setBookings(data || []);
        }
      } catch (err) {
        if (active) {
          addToast(err.message || "Failed to load bookings.", "error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      active = false;
    };
  }, [addToast]);

  const handleCancelBooking = async (id) => {
    setCancellingId(id);
    try {
      await bookingService.cancelBooking(id);
      addToast("Booking cancelled successfully.", "success");
      setConfirmCancelId(null);
      
      // Refresh list immediately after cancellation
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      addToast(err.message || "Failed to cancel booking.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    if (days.includes(dateStr.toLowerCase())) {
      return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-black flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin text-[#e5007d]" size={44} />
        <p className="text-zinc-400 font-medium animate-pulse text-sm">Loading bookings history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 border-b border-zinc-900 pb-4 flex items-center justify-between">
          <span>My Bookings 🎬</span>
          <span className="text-xs bg-zinc-900 text-zinc-400 px-3 py-1.5 rounded-full font-medium uppercase tracking-wider">
            {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
          </span>
        </h1>

        {bookings.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 bg-zinc-950/50 rounded-2xl border border-zinc-900 px-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6 text-zinc-500">
              <Calendar size={28} />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No bookings yet.</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              You haven't booked any movie shows yet. Check out the latest movies playing in theaters now and secure your seats today!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#e5007d] hover:bg-pink-700 transition px-6 py-3 rounded-lg text-base font-semibold shadow-lg shadow-pink-900/10 cursor-pointer"
            >
              <span>Browse Movies</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          /* BOOKINGS LIST */
          <div className="flex flex-col gap-6">
            {bookings.map((booking) => {
              const isActive = booking.bookingStatus === "active";
              const showDate = booking.show ? booking.show.date : "";
              const showTime = booking.show ? booking.show.time : "";
              const movieTitle = booking.movie ? booking.movie.title : "Unknown Movie";
              const posterFilename = booking.movie ? booking.movie.poster : "";

              return (
                <div
                  key={booking._id}
                  className={`bg-zinc-950 rounded-2xl border ${
                    isActive ? "border-zinc-900" : "border-zinc-900/60 opacity-80"
                  } p-5 sm:p-6 shadow-xl flex flex-col md:flex-row gap-6 relative overflow-hidden transition duration-300 hover:border-zinc-800`}
                >
                  {/* Status Ribbon (Top Right) */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}
                    >
                      {booking.bookingStatus}
                    </span>
                  </div>

                  {/* Movie Poster */}
                  <div className="w-full md:w-32 h-44 sm:h-48 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-850">
                    {posterFilename ? (
                      <img
                        src={getMovieImage(posterFilename)}
                        alt={movieTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-650 bg-zinc-900">
                        🎬
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Booking ID */}
                      <span className="text-xs text-[#e5007d] font-semibold tracking-widest uppercase">
                        ID: {booking.bookingId}
                      </span>
                      {/* Movie Name */}
                      <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white truncate pr-20">
                        {movieTitle}
                      </h2>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4 text-sm text-zinc-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#e5007d] shrink-0" />
                          <span>{formatDate(showDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-[#e5007d] shrink-0" />
                          <span>{showTime}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Square size={16} className="text-[#e5007d] shrink-0" />
                          <span>
                            Seats: <strong className="text-white">{booking.selectedSeats.join(", ")}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row (Amount & Cancel Action) */}
                    <div className="flex items-center justify-between border-t border-zinc-900/80 pt-4 mt-5 flex-wrap gap-4">
                      <div>
                        <span className="text-xs text-zinc-450 block uppercase tracking-wider font-semibold">
                          Total Paid
                        </span>
                        <span className="text-xl font-extrabold text-white">
                          ${booking.totalAmount?.toFixed(2)}
                        </span>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                          {confirmCancelId === booking._id ? (
                            /* Confirm Cancel State */
                            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl text-xs sm:text-sm text-rose-350">
                              <AlertTriangle size={16} className="text-rose-500" />
                              <span>Are you sure?</span>
                              <button
                                disabled={cancellingId === booking._id}
                                onClick={() => handleCancelBooking(booking._id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 transition font-bold text-white rounded-md cursor-pointer disabled:opacity-50"
                              >
                                {cancellingId === booking._id ? "Cancelling..." : "Yes, Cancel"}
                              </button>
                              <button
                                disabled={cancellingId === booking._id}
                                onClick={() => setConfirmCancelId(null)}
                                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-medium transition rounded-md cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            /* Regular Action State with Review Toggle */
                            <>
                              {booking.isReviewed ? (
                                <span
                                  className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg border select-none ${
                                    booking.reviewStatus === "approved"
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                      : booking.reviewStatus === "rejected"
                                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  }`}
                                >
                                  {booking.reviewStatus === "approved"
                                    ? "Review Approved ✓"
                                    : booking.reviewStatus === "rejected"
                                    ? "Review Rejected ✗"
                                    : "Waiting For Approval ⏳"}
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenReviewModal(booking)}
                                  className="px-4 py-2 text-xs sm:text-sm font-semibold bg-[#e5007d] hover:bg-pink-700 text-white rounded-lg transition cursor-pointer shrink-0"
                                >
                                  Leave Review
                                </button>
                              )}
                              <button
                                onClick={() => setConfirmCancelId(booking._id)}
                                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-zinc-850 hover:border-rose-500/30 text-zinc-400 hover:text-rose-500 transition cursor-pointer font-semibold"
                              >
                                Cancel Booking
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Leave a Review
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              Share your experience for <strong className="text-white">{reviewBooking.movie?.title}</strong> (Booking ID: {reviewBooking.bookingId})
            </p>

            <form onSubmit={handleSubmittingReview} className="space-y-6">
              {/* Star Rating Select */}
              <div>
                <label className="text-sm font-semibold text-zinc-300 block mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-2xl transition duration-155 transform hover:scale-110 cursor-pointer"
                    >
                      {star <= reviewRating ? (
                        <span className="text-yellow-400">★</span>
                      ) : (
                        <span className="text-zinc-650">☆</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="text-sm font-semibold text-zinc-300 block mb-2">
                  Your Review
                </label>
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us what you thought of the movie..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-[#e5007d] focus:outline-none transition min-h-[120px] resize-none"
                  maxLength={1000}
                ></textarea>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>Minimum 10 characters</span>
                  <span>{reviewText.length}/1000</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end border-t border-zinc-900 pt-4 mt-6">
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={handleCloseReviewModal}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white rounded-lg transition font-medium text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-[#e5007d] hover:bg-pink-700 text-white rounded-lg transition font-bold text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
