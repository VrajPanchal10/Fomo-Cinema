import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";
import banner4 from "../assets/banner4.png";
import banner5 from "../assets/banner5.png";
import banner6 from "../assets/banner6.png";

const slides = [
  {
    id: 1,
    image: banner1,
  },
  {
    id: 2,
    image: banner2,
  },
  {
    id: 3,
    image: banner3,
  },
  {
    id: 4,
    image: banner4,
  },
  {
    id: 5,
    image: banner5,
  },
  {
    id: 6,
    image: banner6,
  },
];

const HeroSlider = () => {
  return (
    <div className="bg-black py-3">
      {/* Outer container to position buttons outside the slider */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12">
        <Swiper
          style={{
            "--swiper-theme-color": "#e5007d",
          }}
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            prevEl: ".hero-swiper-button-prev",
            nextEl: ".hero-swiper-button-next",
          }}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full max-w-6xl mx-auto rounded-md overflow-hidden shadow-2xl"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <img
                src={slide.image}
                alt="Cinema Banner"
                className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons (Simple chevrons, positioned outside) */}
        <button className="hero-swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:text-[#e5007d] transition duration-200 cursor-pointer">
          <ChevronLeft size={36} />
        </button>

        <button className="hero-swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:text-[#e5007d] transition duration-200 cursor-pointer">
          <ChevronRight size={36} />
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
