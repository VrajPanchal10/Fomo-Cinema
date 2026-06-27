import { useState, useEffect } from "react";
import { movieService, getMovieImage } from "../services/api";
import MovieCard from "./MovieCard";

const MovieSection = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await movieService.getMovies();
        setMovies(
          data.map((m) => ({ ...m, image: getMovieImage(m.poster) }))
        );
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <section className="bg-black min-h-screen pb-5 flex justify-center">
      <div className="max-w-7xl mt-2 w-full px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start">
          {movies.map((Movie) => (
            <MovieCard
              key={Movie.id}
              id={Movie.id}
              title={Movie.title}
              image={Movie.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieSection;