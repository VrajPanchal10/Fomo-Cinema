/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { movieService, getMovieImage, showService } from "../services/api";
import { groupShows, formatTime } from "../utils/dateUtils";
import logoFallback from "../assets/fomo-cinema2.png";

// ─── Legacy upcomingMovieDetails & fallbackDetails are exported for backward
// compatibility but no longer contain hardcoded timings arrays.
export const upcomingMovieDetails = {};
export const fallbackDetails = {
  title: "Coming Soon",
  duration: "—",
  rating: "—",
  summary: "Details for this upcoming movie will be available soon. Stay tuned!",
  cast: [],
  genre: [],
  trailer: "",
};

// Safe helper to convert standard YouTube links to embeddable nocookie links
const getEmbedUrl = (url) => {
  if (!url) return "";
  try {
    let embedUrl = "";
    if (url.includes("/embed/")) {
      embedUrl = url.replace("youtube.com", "youtube-nocookie.com");
    } else if (url.includes("watch?v=")) {
      const parts = url.split("watch?v=");
      if (parts.length > 1) {
        const videoId = parts[1].split("&")[0];
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    } else if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      if (parts.length > 1) {
        const videoId = parts[1].split("?")[0].split("&")[0];
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    } else {
      embedUrl = url;
    }

    if (embedUrl.includes("youtube-nocookie.com/embed/")) {
      const hasParams = embedUrl.includes("?");
      embedUrl += hasParams ? "&" : "?";
      embedUrl += "modestbranding=1&rel=0&iv_load_policy=3&showinfo=0";
    }

    return embedUrl;
  } catch (e) {
    console.error("Error formatting trailer URL", e);
  }
  return url;
};

const UpcomingMoviesDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [details, setDetails] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await movieService.getMovie(id);
        setMovie({
          ...data,
          image: getMovieImage(data.poster)
        });

        setDetails({
          title: data.title,
          duration: data.duration,
          rating: data.rating,
          summary: data.description,
          cast: data.cast ? data.cast.map(c => ({ name: c, role: "Actor" })) : [],
          genre: data.genre || [],
          trailer: data.trailerUrl || "",
        });

        // Fetch active shows from database (no legacy fallback timings)
        try {
          const dbShows = await showService.getShowsByMovie(id);
          setShows(Array.isArray(dbShows) ? dbShows : []);
        } catch (err) {
          console.error("Failed to load shows for upcoming movie:", err);
          setShows([]);
        }

      } catch (error) {
        console.error("Failed to load movie details:", error);
        // Use a minimal fallback so the page still renders
        setDetails(fallbackDetails);
        setShows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="text-white text-center py-20 text-3xl">
        Loading upcoming movie details...
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-white text-center py-20 text-3xl">
        Movie details not found
      </div>
    );
  }

  const movieTitle = movie ? movie.title : details.title;
  const movieImage = movie ? movie.image : logoFallback;
  const movieDuration = details.duration;
  const movieRating = details.rating;
  const movieSummary = details.summary;
  const movieCast = details.cast || [];
  const movieGenres = details.genre || [];
  const movieTrailer = getEmbedUrl(details.trailer);

  const isFallbackImage = !movie || !movie.image;

  // Group shows by IST date using shared utility
  const groupedShows = groupShows(shows);

  return (
    <section className="bg-black text-white min-h-screen px-4 sm:px-8 md:px-12 lg:px-16 font-sans select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Title, Subtitle, and Session Selection */}
        <div className="lg text-left max-w-[520px]">
          {/* Movie Title */}
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1">
            {movieTitle}
          </h1>

          {/* Duration + Rating */}
          <p className="text-gray-300 text-base sm:text-xl font-medium mb-3 sm:mb-6">
            {movieDuration} | {movieRating}
          </p>

          {/* Session Heading */}
          <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-extrabold">Select Session</h2>

          {/* Days */}
          <div className="mt-2">
            {groupedShows.length === 0 ? (
              <p className="text-zinc-500 italic text-sm py-2">
                No upcoming sessions scheduled for this movie. Check back later!
              </p>
            ) : (
              groupedShows.map((group, index) => (
                <div key={index} className="mb-3 sm:mb-5">
                  <h3 className="text-white text-base sm:text-xl font-semibold mb-1 sm:mb-2 capitalize">
                    {group.weekday} {group.date}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                    {group.shows.map((show) => (
                      <Link
                        key={show._id}
                        to={`/booking/${show._id}`}
                        className="border border-[#e5007d] text-white rounded-lg
                                   px-3 py-1.5 sm:py-2
                                   text-sm sm:text-base font-medium
                                   hover:bg-[#e5007d] hover:text-black transition duration-200 cursor-pointer flex items-center justify-center min-w-[55px] sm:min-w-[65px]"
                      >
                        {show.showTime || formatTime(show.showDateTime)}{" "}
                        {show.screenName && `(${show.screenName})`}
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center & Right Column Combined Wrapper */}
        <div className="lg:col-span-2 space-y-2 mt-4">
          {/* Top Row of right wrapper: Poster (Left) and Description (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-start">

            {/* Center Column: Poster */}
            <div className="flex justify-center md:justify-start">
              <div className="w-full max-w-[200px] sm:max-w-[260px] lg:max-w-[340px] bg-[#222] rounded overflow-hidden border border-zinc-900 shadow-xl flex items-center justify-center relative">
                <img
                  src={movieImage}
                  alt={movieTitle}
                  className={
                    isFallbackImage
                      ? "max-w-[80%] max-h-[80%] object-contain"
                      : "w-full h-auto object-contain"
                  }
                  onError={(e) => {
                    e.target.src = logoFallback;
                  }}
                />
              </div>
            </div>

            {/* Right Column: Description */}
            <div className="text-left">
              <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-6 sm:leading-relaxed font-normal">
                {movieSummary}
              </p>
            </div>
          </div>

          {/* Movie Cast Section */}
          {movieCast.length > 0 && (
            <div className="text-left pt-4">
              <h3 className="text-white text-lg font-bold mb-2">Movie Cast</h3>
              <div className="flex flex-wrap gap-2">
                {movieCast.map((cast, idx) => (
                  <div
                    key={idx}
                    className="border border-[#e5007d] bg-transparent px-2 py-2 rounded text-left min-w-[110px]"
                  >
                    <span className="text-white text-base font-semibold block">{cast.name}</span>
                    <span className="text-gray-400 text-[13px] block">{cast.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre Section */}
          {movieGenres.length > 0 && (
            <div className="text-left pt-4">
              <h3 className="text-white text-lg font-bold mb-2">Genre</h3>
              <div className="flex flex-wrap gap-2">
                {movieGenres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="border border-[#e5007d] text-white px-4 py-2 rounded text-base font-medium bg-transparent"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trailer Section */}
          {movieTrailer && (
            <div className="pt-4 mb-5">
              <div className="w-full aspect-video rounded overflow-hidden shadow-2xl bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={movieTrailer}
                  title={`${movieTitle} Official Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UpcomingMoviesDetails;
