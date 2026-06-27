import { useNavigate } from "react-router-dom";
import food1 from "../assets/food1.jpg";
import food2 from "../assets/food2.jpg";
import food3 from "../assets/food3.jpg";
import side1 from "../assets/side1.jpg";
import side2 from "../assets/side2.jpg";
import side3 from "../assets/side3.jpg";
import shake1 from "../assets/shake1.jpg";

const specials = [
  {
    id: 1,
    title: "Food",
    image: food1,
    slug: "food",
  },
  {
    id: 2,
    title: "Combos",
    image: food2,
    slug: "combos",
  },
  {
    id: 3,
    title: "Drinks",
    image: food3,
    slug: "drinks",
  },
];

const sides = [
  {
    id: 1,
    title: "Loaded Fries & Crispy Fries",
    image: side1,
    slug: "loaded-fries",
  },
  {
    id: 2,
    title: "Crispy Snacks & Starters",
    image: side2,
    slug: "crispy-snacks",
  },
  {
    id: 3,
    title: "Pizza, Pasta & Platters",
    image: side3,
    slug: "pizza-pasta",
  },
];

const milkshakes = [
  {
    id: 1,
    title: "Vanilla",
    image: shake1,
    slug: "milkshakes",
  },
  // {
  //   id: 2,
  //   title: "Strawberry",
  //   image: shake2,
  //   slug: "milkshakes",
  // },
  // {
  //   id: 3,
  //   title: "Chocolate",
  //   image: shake3,
  //   slug: "milkshakes",
  // },
];

const sweets = [
  {
    id: 1,
    title: "Desserts",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80",
    slug: "sweets",
  },
];

const hotDrinks = [
  {
    id: 1,
    title: "Coffee",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80",
    slug: "coffee",
  },
  {
    id: 2,
    title: "Tea",
    image: "https://www.cookwithkushi.com/wp-content/uploads/2023/07/best_indian_chai_milk_tea_recipe.jpg",
    slug: "tea",
  },
];

const FoodDrinks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 md:px-12 py-6">
      
      {/* Top Description */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <p className="text-base sm:text-xl leading-relaxed text-gray-200">
          All food is cooked fresh in our Cinema Kitchen. 
          The kitchen opens every day from 5:30pm and for weekend afternoons.
          All Food and Drink can be ordered directly from the tablet beside your seat.
          To see the menu in PDF form,{" "}
          <a
            href="/FoMo_OnePageMenu.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e5007d] hover:underline font-semibold"
          >
            CLICK HERE
          </a>
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* SPECIALS */}
        <Section title="SPECIALS" items={specials} navigate={navigate} />

        {/* SIDES */}
        <Section title="SIDES AND SHARES" items={sides} navigate={navigate} />

        {/* MILKSHAKES */}
        <Section title="MILKSHAKES" items={milkshakes} navigate={navigate} />

        {/* SWEETS */}
        <Section title="SWEETS" items={sweets} navigate={navigate} />

        {/* HOT DRINKS */}
        <Section title="HOT DRINKS" items={hotDrinks} navigate={navigate} />
      </div>
    </div>
  );
};

/* REUSABLE SECTION COMPONENT */
const Section = ({ title, items, navigate }) => {
  return (
    <div className="mb-8 sm:mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 uppercase tracking-wide border-b border-zinc-800 pb-2">
        {title}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 mt-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="w-full group cursor-pointer"
            onClick={() => navigate(`/food-details/${item.slug}`)}
          >
            <div className="overflow-hidden rounded-xl shadow-lg border border-zinc-800 transition-all duration-300 group-hover:border-[#e5007d] group-hover:shadow-[#e5007d]/20 group-hover:shadow-xl">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <h3 className="text-sm sm:text-lg font-medium mt-3 text-center text-gray-200 group-hover:text-[#e5007d] transition-colors duration-300">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodDrinks;