import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { menuData } from "../data/menuData";

const FoodDetails = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Simulate a brief loading state for UX
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const timer = setTimeout(() => {
      setItems(menuData[category] || []);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [category]);

  const formatTitle = (slug) => {
    if (!slug) return "";
    return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-12 lg:px-20 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header section */}
        <div className="mb-10 flex flex-col items-start gap-6 border-b border-zinc-800 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#e5007d] transition-colors duration-300 font-medium tracking-wide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            BACK TO MENU
          </button>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider text-white">
            {formatTitle(category)}
          </h1>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col xl:flex-row gap-6 animate-pulse bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50">
                <div className="w-full xl:w-48 h-48 sm:h-64 xl:h-48 bg-zinc-800 rounded-xl"></div>
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-8 bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                  <div className="h-6 bg-zinc-800 rounded w-1/4 mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-400">No menu items found</h2>
            <p className="text-gray-500 mt-3 md:text-lg">Looks like this category is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col xl:flex-row gap-5 lg:gap-6 group bg-zinc-950 hover:bg-zinc-900 p-5 rounded-2xl border border-zinc-900 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-full xl:w-48 shrink-0 overflow-hidden rounded-xl border border-zinc-800">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-56 sm:h-72 xl:h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-100 group-hover:text-[#e5007d] transition-colors duration-300 leading-tight">
                        {item.name}
                      </h2>
                    </div>
                    <p className="text-gray-400 text-sm lg:text-base leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-xl lg:text-2xl font-semibold text-[#e5007d]">
                    {item.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDetails;
