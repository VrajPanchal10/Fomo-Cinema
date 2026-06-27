import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMovieImage, showService } from "../services/api";
import { formatTime } from "../utils/dateUtils";
import { ChevronLeft } from "lucide-react";

// Helper to get formatted calendar date label for a given day param
const getCalendarDateForDay = (dayNameParam) => {
  const ordinals = ["th", "st", "nd", "rd"];
  const getOrdinal = (n) => {
    const v = n % 100;
    return n + (ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0]);
  };
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const today = new Date();
  
  // Look ahead up to 7 days to find the matching weekday
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + i);
    const currentDayName = daysOfWeek[nextDate.getDay()];
    
    const isTodayMatch = (i === 0 && dayNameParam.toLowerCase() === "today");
    if (currentDayName.toLowerCase() === dayNameParam.toLowerCase() || isTodayMatch) {
      const dayDate = getOrdinal(nextDate.getDate());
      const monthName = months[nextDate.getMonth()];
      return `${currentDayName} ${dayDate} ${monthName}`;
    }
  }

  // Fallback distance calculation
  const targetDayIndex = daysOfWeek.findIndex(d => d.toLowerCase() === dayNameParam.toLowerCase());
  if (targetDayIndex !== -1) {
    const nextDate = new Date();
    const currentDayIndex = today.getDay();
    let distance = targetDayIndex - currentDayIndex;
    if (distance < 0) distance += 7;
    nextDate.setDate(today.getDate() + distance);
    const dayDate = getOrdinal(nextDate.getDate());
    const monthName = months[nextDate.getMonth()];
    const dayName = daysOfWeek[nextDate.getDay()];
    return `${dayName} ${dayDate} ${monthName}`;
  }

  return dayNameParam;
};

const FilmByDay = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve target day index (0 = Sunday, 1 = Monday, etc.)
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  let targetDayIndex;
  if (day.toLowerCase() === "today") {
    targetDayIndex = new Date().getDay();
  } else {
    targetDayIndex = daysOfWeek.indexOf(day.toLowerCase());
  }

  const formattedDate = getCalendarDateForDay(day);
  // Safe label for empty state message (uses 'day' param, not undefined 'dayKey')
  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

  useEffect(() => {
    const fetchMoviesAndShows = async () => {
      try {
        const allShows = await showService.getShows();
        
        // Filter shows for the chosen day index (using IST date via virtual showDate or showDateTime)
        // Only show future Active / Scheduled / Sold Out shows
        const filteredShows = (allShows || []).filter((show) => {
          if (!show.showDateTime || !show.movie) return false;

          // Use the IST date string from the virtual if available, else compute
          let showDayIndex;
          if (show.showDate) {
            // showDate is "YYYY-MM-DD" in IST
            showDayIndex = new Date(show.showDate + "T00:00:00").getDay();
          } else {
            // fall back to UTC day
            showDayIndex = new Date(show.showDateTime).getDay();
          }

          const isFuture = new Date(show.showDateTime) >= new Date();
          const isPublicStatus = ["Active", "Scheduled", "Sold Out"].includes(show.status);
          
          return showDayIndex === targetDayIndex && isFuture && isPublicStatus;
        });

        // Group by movie
        const movieMap = {};
        filteredShows.forEach((show) => {
          const m = show.movie;
          const movieId = m._id.toString();
          
          if (!movieMap[movieId]) {
            movieMap[movieId] = {
              id: m.id,
              _id: m._id,
              title: m.title,
              image: getMovieImage(m.poster),
              summary: m.description,
              genre: m.genre || [],
              cast: m.cast || [],
              isUpcoming: m.status === "upcoming",
              shows: []
            };
          }
          movieMap[movieId].shows.push(show);
        });

        const groupedMovies = Object.values(movieMap).map((m) => {
          // Sort shows by showDateTime ascending
          m.shows.sort((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime));
          return m;
        });

        setAllMovies(groupedMovies);
      } catch (error) {
        console.error("Failed to load movies by day:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMoviesAndShows();
  }, [day, targetDayIndex]);

  if (loading) {
    return (
      <div className="text-white text-center py-20 text-3xl">
        Loading scheduled films...
      </div>
    );
  }

  return (
    <section className="bg-black text-white min-h-screen py-8 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition cursor-pointer text-white"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Films showing on <span className="capitalize">{day}</span>
          </h1>
        </div>

        {/* Movies List */}
        <div className="space-y-6">
          {allMovies.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-xl font-semibold">
              No films scheduled to show on {dayLabel} at this time.
            </div>
          ) : (
            allMovies.map((movie) => {
              const detailUrl = movie.isUpcoming ? `/upcoming-movies/${movie.id}` : `/movies/${movie.id}`;
              
              return (
                <div
                  key={movie._id?.toString() || movie.id}
                  className="bg-[#111116]/80 border border-zinc-850 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-stretch shadow-lg hover:border-zinc-800 transition duration-200"
                >
                  {/* Poster Thumbnail */}
                  <Link
                    to={detailUrl}
                    className="w-full md:w-[150px] h-[210px] rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 relative border border-zinc-850 block"
                  >
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Movie Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={detailUrl}
                        className="text-xl sm:text-3xl font-extrabold text-white hover:text-[#e5007d] transition duration-150 inline-block mb-2"
                      >
                        {movie.title}
                      </Link>

                      <p className="text-zinc-300 text-base leading-relaxed mb-3 max-w-4xl line-clamp-3 md:line-clamp-2">
                        {movie.summary}{" "}
                        <Link to={detailUrl} className="text-[#e5007d] hover:underline font-semibold text-xs ml-1">
                          More
                        </Link>
                      </p>

                      {/* Genre & Cast info */}
                      <div className="flex flex-col gap-2 mb-4 text-sm">
                        {movie.genre && movie.genre.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-400 font-semibold min-w-[55px]">Genre:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {movie.genre.map((g, idx) => (
                                <span key={idx} className="bg-zinc-900 border border-zinc-850 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {movie.cast && movie.cast.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-semibold min-w-[55px]">Cast:</span>
                            <span className="text-zinc-300 truncate">{movie.cast.slice(0, 4).join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                      <h4 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        {formattedDate}
                      </h4>

                      {/* Timings – from MongoDB */}
                      <div className="flex flex-wrap gap-3">
                        {movie.shows.map((show) => (
                          <Link
                            key={show._id}
                            to={`/booking/${show._id}`}
                            className="border border-[#e5007d] text-white hover:bg-[#e5007d] hover:text-black rounded-lg px-5 py-2 text-sm font-semibold transition duration-200 cursor-pointer min-w-[70px] text-center"
                          >
                            {show.showTime || formatTime(show.showDateTime)}{" "}
                            {show.screenName && `(${show.screenName})`}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};

export default FilmByDay;
