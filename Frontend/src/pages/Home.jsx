import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import MovieSection from "../components/MovieSection";
import { movieService, getMovieImage } from "../services/api";
import { Search, Calendar, ChevronDown } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [currentMovies, setCurrentMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  const searchRef = useRef(null);
  const dayRef = useRef(null);

  // Load movies from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const nowShowing = await movieService.getMovies();
        const upcoming = await movieService.getUpcomingMovies();

        // Map posters to resolved Vite assets
        setCurrentMovies(
          nowShowing.map((m) => ({ ...m, image: getMovieImage(m.poster) }))
        );
        setUpcomingMovies(
          upcoming.map((m) => ({ ...m, image: getMovieImage(m.poster) }))
        );
      } catch (error) {
        console.error("Failed to load movies from API:", error);
      }
    };
    loadData();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (dayRef.current && !dayRef.current.contains(event.target)) {
        setShowDayDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prepare combined movies for search (deduplicated by ID)
  const combinedMovies = [];
  const addedIds = new Set();

  currentMovies.forEach((m) => {
    combinedMovies.push({ ...m, isUpcoming: false });
    addedIds.add(m.id);
  });

  upcomingMovies.forEach((m) => {
    if (!addedIds.has(m.id)) {
      combinedMovies.push({ ...m, isUpcoming: true });
      addedIds.add(m.id);
    }
  });

  // Filter movies for search suggestions
  const filteredSuggestions = searchQuery.trim() === ""
    ? []
    : combinedMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const days = [
    { label: "Today", value: "Today" },
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
    { label: "Sunday", value: "Sunday" },
  ];

  const handleSelectMovie = (movie) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    if (movie.isUpcoming) {
      navigate(`/upcoming-movies/${movie.id}`);
    } else {
      navigate(`/movies/${movie.id}`);
    }
  };

  const getSelectedDayLabel = () => {
    return "Select Day";
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Hero />

      {/* Search and Day filter bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2">
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row gap-6 items-center justify-between backdrop-blur-md">
          
          {/* Left Text */}
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              Find Your Next Show
            </h2>
            <p className="text-zinc-400 text-sm">
              Search across all titles or choose a day to view showing movies.
            </p>
          </div>

          {/* Controls Container */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
            
            {/* Search Input Container */}
            <div ref={searchRef} className="relative flex-1 sm:w-80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-[#e5007d] focus:ring-1 focus:ring-[#e5007d] transition duration-200"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSearchDropdown && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {filteredSuggestions.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => handleSelectMovie(movie)}
                      className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#e5007d]/10 text-left border-b border-zinc-800 last:border-0 transition duration-200 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-14 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Movie Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-base font-semibold truncate">
                          {movie.title}
                        </h4>
                        <p className="text-zinc-400 text-xs mt-0.5">
                          {movie.isUpcoming ? "Coming Soon" : movie.duration || "Now Showing"}
                        </p>
                      </div>

                      {/* Tag */}
                      <span className={`text-[11px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                        movie.isUpcoming 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                          : "bg-[#e5007d]/10 text-[#e5007d] border border-[#e5007d]/20"
                      }`}>
                        {movie.isUpcoming ? "Upcoming" : "Showing"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions Dropdown - Empty State */}
              {showSearchDropdown && searchQuery.trim() !== "" && filteredSuggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 text-center text-zinc-500 text-sm z-50">
                  No movies match "{searchQuery}"
                </div>
              )}
            </div>

            {/* Custom Day Dropdown */}
            <div ref={dayRef} className="relative sm:w-48">
              <button
                onClick={() => setShowDayDropdown(!showDayDropdown)}
                className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-[#e5007d] rounded-xl px-4 py-3 text-base font-medium text-white transition duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="text-zinc-400" size={18} />
                  <span>{getSelectedDayLabel()}</span>
                </div>
                <ChevronDown className={`text-zinc-400 transition-transform duration-200 ${showDayDropdown ? "rotate-180" : ""}`} size={16} />
              </button>

              {/* Day Dropdown Options */}
              {showDayDropdown && (
                <div className="absolute top-full right-0 left-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  {days.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => {
                        navigate(`/film-by-day/${day.value}`);
                        setShowDayDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-base transition duration-150 cursor-pointer hover:bg-[#e5007d]/10 text-zinc-300 hover:text-white"
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MovieSection />
    </div>
  );
};

export default Home;
