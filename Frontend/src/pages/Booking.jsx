import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Ticket, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { showService, bookingService, getMovieImage } from "../services/api";
import { formatDateLong, formatTime } from "../utils/dateUtils";

const defaultSeatConfiguration = [
  {
    row: "A",
    type: "standard",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "empty" },
      { type: "spacer" },
      { type: "seat", num: 4 },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "empty" }
    ]
  },
  {
    row: "B",
    type: "standard",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "seat", num: 9 }
    ]
  },
  {
    row: "C",
    type: "recliner",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "seat", num: 9 }
    ]
  },
  {
    row: "D",
    type: "recliner",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "seat", num: 9 }
    ]
  },
  {
    row: "E",
    type: "share",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "empty" }
    ]
  },
  {
    row: "F",
    type: "share",
    seats: [
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
      { type: "empty" }
    ]
  }
];

const BARCODE_WIDTHS = [
  "w-[2px]", "w-[1px]", "w-[3px]", "w-[1px]", "w-[4px]", "w-[2px]", "w-[1px]", "w-[3px]",
  "w-[2px]", "w-[4px]", "w-[1px]", "w-[3px]", "w-[2px]", "w-[1px]", "w-[4px]", "w-[2px]",
  "w-[3px]", "w-[1px]", "w-[2px]", "w-[4px]", "w-[1px]", "w-[3px]", "w-[2px]", "w-[1px]"
];

const Booking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user, setOpenLogin } = useAuth();

  // States
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [movieData, setMovieData] = useState(null);
  const [showData, setShowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  // Load movie and show details on mount
  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setError("");
        // 1. Fetch specific show details
        const showRecord = await showService.getShow(showId);
        if (!showRecord) {
          throw new Error("Show session not found.");
        }
        setShowData(showRecord);

        // 2. Resolve Movie
        const movieRecord = showRecord.movie;
        if (!movieRecord) {
          throw new Error("Movie details not found for this show.");
        }
        setMovieData({
          ...movieRecord,
          image: getMovieImage(movieRecord.poster)
        });

        // 3. Initialize seat layout with booked status from Show document
        const baseLayout = showRecord.seatConfiguration || defaultSeatConfiguration;
        const updatedLayout = baseLayout.map((row) => ({
          ...row,
          seats: row.seats.map((seat) => {
            if (seat.type === "seat") {
              const seatId = `${row.row}-${seat.num}`;
              if (showRecord.bookedSeats.includes(seatId)) {
                return { ...seat, status: "booked" };
              }
              return { ...seat, status: "available" };
            }
            return seat;
          }),
        }));
        setSeatLayout(updatedLayout);

      } catch (err) {
        console.error("Booking load failed:", err);
        setError("Failed to load session details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [showId]);

  const movieTitle = movieData ? movieData.title : "Movie Details";
  // Use IST-derived virtuals from Show API; fall back to dateUtils helpers
  const formattedDate = showData?.showDateTime
    ? formatDateLong(showData.showDateTime)
    : "";
  const time = showData
    ? (showData.showTime || formatTime(showData.showDateTime))
    : "";

  // Handle seat click
  const handleSeatClick = (rowName, seat, rowIndex, seatIndex) => {
    if (seat.status === "booked") return;

    const seatId = `${rowName}-${seat.num}`;
    const isCurrentlySelected = selectedSeats.find(s => s.id === seatId);

    // Update selectedSeats state
    if (isCurrentlySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, {
        id: seatId,
        row: rowName,
        num: seat.num,
        type: seatLayout[rowIndex].type
      }]);
    }

    // Toggle status in seatLayout
    const newLayout = [...seatLayout];
    newLayout[rowIndex].seats[seatIndex].status = isCurrentlySelected ? "available" : "selected";
    setSeatLayout(newLayout);
  };

  // Pricing calculations using database-driven ticketPrice
  const calculateTotal = () => {
    const basePrice = showData ? showData.ticketPrice : 15.00;
    let ticketCost = 0;
    selectedSeats.forEach(seat => {
      let price = basePrice;
      if (seat.type === "recliner") {
        price = basePrice + 3.00;
      } else if (seat.type === "share") {
        price = basePrice + 5.00;
      }
      ticketCost += price;
    });
    const feeCost = selectedSeats.length * 1.75;
    return {
      tickets: ticketCost,
      fees: feeCost,
      total: ticketCost + feeCost
    };
  };

  const priceInfo = calculateTotal();

  // Booking confirm submit
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    
    if (!user) {
      setError("Please log in to purchase tickets.");
      setOpenLogin(true);
      return;
    }

    setError("");
    setBookingLoading(true);

    try {
      const seatIds = selectedSeats.map((s) => s.id);
      const res = await bookingService.createBooking(
        showId,
        seatIds,
        priceInfo.total
      );

      setBookingId(res.booking.bookingId);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white text-zinc-800 min-h-screen font-sans flex flex-col justify-center items-center select-none">
        <Loader2 className="animate-spin text-[#e5007d] mb-4" size={48} />
        <span className="font-bold text-lg text-zinc-500">Loading seat layout...</span>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-800 min-h-screen font-sans flex flex-col justify-between select-none relative pb-10">
      
      {/* Top Header Section - Sticky, Spacious & Separated layout */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10 w-full">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Back button and Movie Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 text-zinc-500 hover:text-[#e5007d] hover:border-pink-200 transition cursor-pointer shrink-0"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                {movieTitle}
              </h1>
              <p className="text-zinc-500 font-semibold text-xs md:text-sm mt-0.5">
                {formattedDate} • {time}
              </p>
            </div>
          </div>

          {/* Right side - Branding */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">
              Secure Booking
            </span>
            <div className="h-6 w-px bg-zinc-200 hidden sm:block"></div>
            <span className="text-lg font-black tracking-tighter text-[#e5007d] select-none">
              FoMo
            </span>
          </div>
        </div>
      </div>

      {/* Theater Screen Graphics */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 flex flex-col items-center">
        <div className="w-full text-center text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
          All eyes this way please!
        </div>
        
        {/* Screen curved line */}
        <div className="w-full h-8 border-t-2 border-zinc-300 rounded-[50%] shadow-[inset_0_5px_5px_-5px_rgba(0,0,0,0.1)] mb-6"></div>

        {/* Seat Layout Grid - Balanced layout using CSS Grid */}
        <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-3xl overflow-x-auto pb-6 px-1 sm:px-4">
          {seatLayout.map((rowItem, rowIndex) => (
            <div key={rowItem.row} className="grid grid-cols-[24px_1fr_24px] sm:grid-cols-[32px_1fr_32px] md:grid-cols-[40px_1fr_40px] gap-1 sm:gap-2 md:gap-4 items-center w-full min-w-min">
              
              {/* Row Label (Left) - Perfectly aligned vertically */}
              <span className="text-zinc-400 font-extrabold text-sm sm:text-base text-right pr-1 sm:pr-2">
                {rowItem.row}
              </span>

              {/* Seats container - grid with columns alignment for perfect vertical sequencing */}
              <div className="grid grid-cols-10 gap-1 sm:gap-2.5 justify-items-center w-full mx-auto">
                {rowItem.seats.map((seat, seatIndex) => {
                  if (seat.type === "spacer") {
                    return (
                      <div
                        key={`spacer-${seatIndex}`}
                        className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-transparent shrink-0"
                      >
                        |
                      </div>
                    );
                  }
                  
                  if (seat.type === "empty") {
                    return (
                      <div
                        key={`empty-${seatIndex}`}
                        className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center text-transparent shrink-0"
                      ></div>
                    );
                  }

                  // Determine colors based on status and seat type
                  let seatColorClass = "";
                  if (seat.status === "available") {
                    if (rowItem.type === "recliner") {
                      seatColorClass = "border-pink-500 text-pink-600 hover:bg-pink-50 cursor-pointer";
                    } else if (rowItem.type === "share") {
                      seatColorClass = "border-purple-500 text-purple-600 hover:bg-purple-50 cursor-pointer";
                    } else {
                      seatColorClass = "border-zinc-400 text-zinc-600 hover:bg-zinc-50 cursor-pointer";
                    }
                  } else if (seat.status === "booked") {
                    seatColorClass = "bg-zinc-200 border-zinc-200 text-zinc-400 cursor-not-allowed";
                  } else if (seat.status === "selected") {
                    seatColorClass = "bg-teal-700 border-teal-700 text-white cursor-pointer shadow-sm";
                  }

                  const seatLabel = rowItem.type === "share" ? `T${seat.num}` : seat.num;

                  return (
                    <button
                      key={seatIndex}
                      disabled={seat.status === "booked"}
                      onClick={() => handleSeatClick(rowItem.row, seat, rowIndex, seatIndex)}
                      className={`w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 border-2 text-[9px] sm:text-[10px] md:text-[11px] font-bold rounded-md sm:rounded-xl flex items-center justify-center transition-all duration-150 shrink-0 ${seatColorClass}`}
                    >
                      {seatLabel}
                    </button>
                  );
                })}
              </div>

              {/* Row Label (Right) - Perfectly aligned vertically */}
              <span className="text-zinc-400 font-extrabold text-sm sm:text-base text-left pl-1 sm:pl-2">
                {rowItem.row}
              </span>

            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 mb-10 text-xs font-medium text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-zinc-400 rounded-md"></span>
            <span>Standard (${(showData?.ticketPrice || 15.00).toFixed(2)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-pink-500 rounded-md"></span>
            <span>Recliner (${((showData?.ticketPrice || 15.00) + 3.00).toFixed(2)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-purple-500 rounded-md"></span>
            <span>Share Table Seat (${((showData?.ticketPrice || 15.00) + 5.00).toFixed(2)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-zinc-400 bg-transparent rounded-md"></span>
            <span>Available</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-zinc-200 border-2 border-zinc-200 rounded-md"></span>
            <span>Booked</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-teal-700 border-2 border-teal-700 rounded-md"></span>
            <span>Selected</span>
          </div>
        </div>

        {/* Booking CTA */}
        {selectedSeats.length > 0 && (
          <div className="w-full max-w-md bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm text-center mb-4">
            <h3 className="text-zinc-500 font-medium text-sm mb-1">
              Selected Seats: <span className="text-zinc-800 font-bold">{selectedSeats.map(s => s.id).join(", ")}</span>
            </h3>
            <p className="text-zinc-700 text-lg font-bold">
              Total Cost: <span className="text-[#e5007d]">${priceInfo.total.toFixed(2)}</span>
            </p>
            <span className="text-[11px] text-zinc-400 block mt-1">
              Includes ${priceInfo.fees.toFixed(2)} booking fees
            </span>
          </div>
        )}
        {error && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 shadow-sm text-center mb-4 font-semibold">
            {error}
          </div>
        )}

        <button
          onClick={handleConfirmBooking}
          disabled={selectedSeats.length === 0 || bookingLoading}
          className={`w-full max-w-2xl py-2 rounded-xl text-lg font-semibold transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
            selectedSeats.length > 0
              ? "bg-teal-800 text-white hover:bg-teal-900 cursor-pointer"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {bookingLoading && <Loader2 className="animate-spin text-white" size={20} />}
          Book Ticket
        </button>

        {/* Note Warnings list */}
        <div className="max-w-2xl w-full text-left text-black text-xs space-y-1.5 mt-10">
          <p>*Recliner seats cost $3 more than standard seats.</p>
          <p>*Make sure you choose "Share Table Seats" for 2 seats together.</p>
          <p>*Concession price is available for students, pensioners, seniors, children under 15 and FoMo members.</p>
          <p>*Partner and Concession IDs need to be shown with tickets for entry to FoMo.</p>
          <p>*Booking fee is $1.75/ticket.</p>
          <p>*Wheelchair spaces are available, please book on 9000 7440 to reserve seat(s) with bespoke table.</p>
        </div>
      </div>

      {/* Success Booking Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex justify-center items-start p-4 md:p-8">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Header Banner */}
            <div className="bg-[#e5007d] text-white text-center py-6 px-6 relative">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Check className="text-teal-700" size={32} />
              </div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-pink-100 text-xs mt-1">Show this ticket at the cinema entry podium</p>
            </div>

            {/* Ticket details body */}
            <div className="p-6 text-zinc-800">
              <div className="border-b-2 border-dashed border-zinc-200 pb-5 mb-5 relative">
                
                {/* Dashed edge circles */}
                <div className="absolute -bottom-3 -left-9 w-6 h-6 bg-zinc-800 rounded-full hidden sm:block"></div>
                <div className="absolute -bottom-3 -right-9 w-6 h-6 bg-zinc-800 rounded-full hidden sm:block"></div>

                <div className="flex items-center gap-3.5 mb-4 text-[#e5007d]">
                  <Ticket size={24} />
                  <span className="font-extrabold uppercase tracking-widest text-sm">FOMO Ticket Pass</span>
                </div>

                <h3 className="text-2xl font-extrabold tracking-tight mb-1">{movieTitle}</h3>
                <p className="text-zinc-500 font-semibold text-sm">{formattedDate}</p>
                <p className="text-zinc-500 font-bold text-sm mt-0.5">Showtime: {time}</p>
              </div>

              <div className="space-y-3.5 text-sm font-medium border-b border-zinc-100 pb-5 mb-5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Booking ID:</span>
                  <span className="font-bold text-zinc-900">{bookingId}</span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <span className="text-zinc-400 shrink-0">Selected Seats:</span>
                  <span className="font-bold text-zinc-900 text-right max-h-24 overflow-y-auto block pr-1 leading-relaxed w-full">
                    {selectedSeats.map(s => s.id).join(", ")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Quantity:</span>
                  <span className="font-bold text-zinc-900">{selectedSeats.length} ticket(s)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Price:</span>
                  <span className="font-extrabold text-[#e5007d] text-base">${priceInfo.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Mock Barcode Graphic */}
              <div className="flex flex-col items-center justify-center py-2 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="flex gap-0.5 h-10 w-full max-w-[200px] justify-center">
                  {BARCODE_WIDTHS.map((w, i) => (
                    <div key={i} className={`bg-zinc-800 h-full ${w}`}></div>
                  ))}
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold tracking-[0.3em] uppercase mt-1">
                  {bookingId}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    navigate("/");
                  }}
                  className="w-full py-3 bg-[#e5007d] hover:bg-pink-700 text-white rounded-xl font-bold transition duration-150 cursor-pointer text-center"
                >
                  Go to Homepage
                </button>
                
                <button
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setSelectedSeats([]);
                    navigate(-1);
                  }}
                  className="w-full py-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-500 rounded-xl font-semibold transition duration-150 cursor-pointer text-center"
                >
                  Book another movie
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Booking;
