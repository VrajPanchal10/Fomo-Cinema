import { Link } from "react-router-dom";

const MovieCard = ({ id, title, image }) => {
  return (
    <Link to={`/movies/${id}`}>
      <div className=" rounded-md overflow-hidden bg-[#e5007d] cursor-pointer hover:scale-105 transition duration-300">
        {/* Movie Image */}
        <img
          src={image}
          alt={title}
          className="w-full h-[260px] sm:h-[320px] lg:h-[450px] object-cover block"
        />

        {/* Movie Title */}
        <div className="p-1">
          <h2 className="text-white text-base sm:text-xl font-medium flex items-center justify-center">
            {title}
          </h2>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
