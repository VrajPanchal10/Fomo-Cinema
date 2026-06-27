/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { movieService, getMovieImage } from "../services/api";
import movie13 from "../assets/movie13.jpg";
import movie14 from "../assets/movie14.jpg";
import movie15 from "../assets/movie15.jpg";
import movie16 from "../assets/movie16.jpg";
import movie17 from "../assets/movie17.jpg";
import movie18 from "../assets/movie18.jpg";
import movie19 from "../assets/movie19.jpg";
import movie20 from "../assets/movie20.jpg";
import movie21 from "../assets/movie21.jpg";
import movie22 from "../assets/movie22.jpg";
import movie23 from "../assets/movie23.jpg";
import movie24 from "../assets/movie24.jpg";
import movie25 from "../assets/movie25.jpg";
import movie26 from "../assets/movie26.jpg";
import movie1 from "../assets/movie1.jpg";
import movie11 from "../assets/movie11.jpg";

export const movies = [
  {
    id: 13,
    title: "Mohabbatein",
    image: movie13,
  },
  {
    id: 14,
    title: "Hereditary",
    image: movie14,
  },
  {
    id: 15,
    title: "Partner",
    image: movie15,
  },
  {
    id: 16,
    title: "Mujhse Shaadi Karogi",
    image: movie16,
  },
  {
    id: 17,
    title: "Tere Ishk Mein",
    image: movie17,
  },
  {
    id: 18,
    title: "Avengers: Endgame",
    image: movie18,
  },
  {
    id: 19,
    title: "Toy Story 5",
    image: movie19,
  },
  {
    id: 20,
    title: "The Conjuring",
    image: movie20,
  },
  {
    id: 21,
    title: "Annabelle",
    image: movie21,
  },
  {
    id: 22,
    title: "Donnie Darko",
    image: movie22,
  },
  {
    id: 23,
    title: "Project Hail Mary",
    image: movie23,
  },
  {
    id: 24,
    title: "La La Land",
    image: movie24,
  },
  {
    id: 25,
    title: "Breaking Bad",
    image: movie25,
  },
  {
    id: 26,
    title: "Money Heist",
    image: movie26,
  },
  {
    id: 1,
    title: "Dune 1",
    image: movie1,
  },
  {
    id: 11,
    title: "The Odyssey",
    image: movie11,
  },
];

const UpcomingShows = () => {
  const [upcomingList, setUpcomingList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const data = await movieService.getUpcomingMovies();
        if (data && data.length > 0) {
          const originalOrder = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 1, 11];
          const sorted = data
            .map((m) => ({ ...m, image: getMovieImage(m.poster) }))
            .sort((a, b) => originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id));
          setUpcomingList(sorted);
        } else {
          setUpcomingList(movies);
        }
      } catch (error) {
        console.error("Failed to load upcoming movies, using fallback:", error);
        setUpcomingList(movies);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-black">
        <Loader2 className="animate-spin text-[#e5007d]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 md:px-10 py-3">
      {/* Page Title */}
      <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
        Upcoming Shows
      </h1>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {upcomingList.map((movie) => (
          <Link
            key={movie.id}
            to={`/upcoming-movies/${movie.id}`}
            className="rounded-lg overflow-hidden bg-[#111] hover:scale-[1.02] transition duration-300 block"
          >
            {/* Movie Image */}
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[450px] object-cover"
            />

            {/* Movie Title */}
            <div className="bg-[#e5007d] py-2 px-2">
              <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-medium flex justify-center">
                {movie.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UpcomingShows;
