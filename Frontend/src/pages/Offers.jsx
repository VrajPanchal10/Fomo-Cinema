
const offers = [
  {
    id: 1,
    title: "50% OFF Tuesdays",
    description: "Get 50% discount on all movie tickets every Tuesday.",
  },
  {
    id: 2,
    title: "Student Special",
    description: "Students get free popcorn with every movie ticket.",
  },
  {
    id: 3,
    title: "Family Combo",
    description: "Buy 4 tickets and get a food combo free.",
  },
];

const Offers = () => {
  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 py-5">
      
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-1">
          Offers & Deals
        </h1>

        <p className="text-gray-400 text-lg">
          Enjoy exciting cinema offers and special discounts.
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-[#111116] border border-gray-700 rounded-2xl p-8 hover:border-pink-500 transition duration-300"
          >
            
            {/* Offer Title */}
            <h2 className="text-3xl font-semibold mb-5 text-[#e5007d]">
              {offer.title}
            </h2>

            {/* Offer Description */}
            <p className="text-gray-300 text-lg leading-8">
              {offer.description}
            </p>

            {/* Button */}
            <button className="mt-8 bg-[#e5007d] hover:bg-pink-700 transition px-6 py-3 rounded-md text-white text-lg font-medium">
              Claim Offer
            </button>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Offers;