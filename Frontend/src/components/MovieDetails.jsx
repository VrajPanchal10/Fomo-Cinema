import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { movieService, getMovieImage, reviewService, showService } from "../services/api";
import { groupShows, formatTime } from "../utils/dateUtils";

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

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await movieService.getMovie(id);
        
        setMovie({
          ...data,
          image: getMovieImage(data.poster),
          summary: data.description,
          trailer: data.trailerUrl
        });

        // Fetch approved movie reviews
        try {
          const revs = await reviewService.getMovieReviews(id);
          setReviews(revs || []);
        } catch (err) {
          console.error("Failed to load reviews:", err);
        }

        // Fetch active shows for movie
        try {
          const movieShows = await showService.getShowsByMovie(id);
          setShows(movieShows || []);
        } catch (err) {
          console.error("Failed to load shows:", err);
        }
      } catch (error) {
        console.error("Failed to load movie details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="text-white text-center py-20 text-3xl">
        Loading movie details...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-white text-center py-20 text-3xl">
        Movie not found
      </div>
    );
  }

  // Group shows by IST date using shared utility
  const groupedShows = groupShows(shows);

  return (
    <section className="bg-black text-white min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Movie Info: Poster + Details ──────────────────────────────── */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6 sm:gap-8 lg:gap-10">

          {/* Poster */}
          <div>
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full max-w-[200px] sm:max-w-[280px] lg:max-w-none h-auto object-contain rounded-lg shadow-lg mx-auto lg:mx-0 border border-zinc-800"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
              {movie.title}
            </h1>

            <div className="text-gray-300 text-sm sm:text-base space-y-0.5 sm:space-y-1">
              <p>Duration: {movie.duration}</p>
              <p>IMDb: {movie.imdb}</p>
              <p>Rating: {movie.rating}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span>Average Rating:</span>
                {movie.averageRating > 0 ? (
                  <>
                    <span className="text-yellow-500 font-semibold">{movie.averageRating.toFixed(1)}</span>
                    <span className="text-yellow-400">
                      {"★".repeat(Math.round(movie.averageRating))}
                      {"☆".repeat(5 - Math.round(movie.averageRating))}
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-500">No ratings yet</span>
                )}
                <span className="text-zinc-500">({movie.reviewCount || 0} approved reviews)</span>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 sm:mt-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-1">Summary</h2>
              <p className="text-gray-300 leading-6 sm:leading-8 text-sm sm:text-base">
                {movie.summary}
              </p>
            </div>

            {/* Genre */}
            <div className="mt-4 sm:mt-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Genre</h2>
              <div className="flex flex-wrap gap-2">
                {movie.genre && movie.genre.map((g, index) => (
                  <span
                    key={index}
                    className="border border-[#e5007d] px-3 py-1 sm:px-4 rounded-md font-medium text-white text-sm sm:text-base"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Cast */}
            <div className="mt-4 sm:mt-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">Cast</h2>
              <div className="flex flex-wrap gap-2">
                {movie.cast && movie.cast.map((actor, index) => (
                  <span
                    key={index}
                    className="border border-[#e5007d] px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium text-white text-sm sm:text-base"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Trailer Section ──────────────────────────────────────────── */}
        {movie.trailer && (
          <div className="mt-5 sm:mt-6 border-t border-gray-800 pt-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-center font-bold mb-3 sm:mb-4">
              Official Trailer
            </h2>
            <div className="w-full max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(movie.trailer)}
                title={`${movie.title} Official Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )}

        {/* ── Customer Reviews Section ─────────────────────────────────── */}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
            <span>Customer Reviews</span>
            <span className="text-sm bg-zinc-900 text-zinc-400 px-3 py-1 rounded-full font-medium">
              {reviews.length}
            </span>
          </h2>

          {reviews.length === 0 ? (
            <p className="text-zinc-500 italic text-sm py-4">
              No approved reviews yet for this movie. Be the first to leave a review after booking!
            </p>
          ) : (
            <div className="grid gap-4 max-w-4xl">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-900 hover:border-zinc-800 transition duration-200"
                >
                  <div className="flex justify-between items-start gap-4 mb-2 flex-wrap sm:flex-nowrap">
                    <div>
                      <span className="font-semibold text-white text-base mr-3">
                        {r.user ? r.user.name : "Anonymous"}
                      </span>
                      <span className="text-yellow-400 text-sm tracking-wide">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                    {r.review}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Session Section ───────────────────────────────────────────── */}
        <div className="mt-5 sm:mt-6 border-t border-gray-800 pt-4 sm:pt-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Select Session
          </h2>

          {groupedShows.length === 0 ? (
            <p className="text-zinc-500 italic text-sm py-2">
              No upcoming sessions scheduled for this movie. Check back later!
            </p>
          ) : (
            groupedShows.map((group, index) => (
              <div key={index} className="mb-3 sm:mb-5">
                <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-200 capitalize">
                  {group.weekday} {group.date}
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                  {group.shows.map((show) => (
                    <Link
                      key={show._id}
                      to={`/booking/${show._id}`}
                      className="border border-[#e5007d] text-white rounded-xl
                                 px-3 py-1.5 sm:py-2 lg:py-3
                                 text-sm sm:text-base lg:text-xl font-semibold
                                 hover:bg-[#e5007d] hover:text-black transition duration-200 cursor-pointer"
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
    </section>
  );
};

export default MovieDetails;
