import { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { reviewService } from "../services/api";

import "swiper/css";
import "swiper/css/navigation";

const Footer = () => {
  const [footerReviews, setFooterReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getFooterReviews();
        if (data && data.length > 0) {
          const mapped = data.map((r) => ({
            text: r.review,
            author: r.user ? r.user.name : "Anonymous",
            movieTitle: r.movie ? r.movie.title : "",
          }));
          setFooterReviews(mapped);
        } else {
          setFooterReviews([]);
        }
      } catch (err) {
        console.error("Failed to load footer reviews:", err);
        setFooterReviews([]);
      }
    };
    fetchReviews();
  }, []);

  return (
    <footer className="bg-zinc-900 text-white border-t border-zinc-800">
      {/*
        py-4 → py-6: gives a little more breathing room on desktop
        but keeps the footer compact.
        gap-8 md:gap-16 stays — already fixed last session.
      */}
      <div className="max-w-[1400px] mx-auto px-5 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-16 items-start">

          {/* ── Column 1: Newsletter ──────────────────────────────────── */}
          <div className="text-center md:text-left">
            {/* Header row — mb-3 instead of mb-5 on mobile */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3 md:mb-5">
              <Mail className="text-pink-500 shrink-0" size={28} />
              <h2 className="text-xl md:text-2xl font-semibold">Join Our Newsletter</h2>
            </div>

            {/*
              leading-8 is very loose (2rem line-height) — switched to
              leading-6 on mobile, leading-8 on md+ to keep desktop
              appearance unchanged while tightening mobile.
              mb-6 → mb-4 md:mb-6 saves ~8px vertical on mobile.
            */}
            <p className="text-zinc-400 leading-6 md:leading-8 mb-4 md:mb-6 text-sm md:text-base">
              Get latest movie updates, upcoming shows, exclusive offers and
              food deals directly in your inbox.
            </p>

            <button className="bg-[#e5007d] hover:bg-pink-600 px-6 py-3 rounded-lg font-medium transition duration-300">
              Subscribe
            </button>
          </div>

          {/* ── Column 2: Contact ─────────────────────────────────────── */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3 md:mb-5">
              <MapPin className="text-pink-500 shrink-0" size={28} />
              <h2 className="text-xl md:text-2xl font-semibold">Contact Us</h2>
            </div>

            {/*
              space-y-4 is fine on desktop; on mobile/tablet single-column
              layout it adds 16px between each text block which is a lot.
              Reduced to space-y-2 md:space-y-4.
            */}
            <div className="space-y-2 md:space-y-4 text-zinc-400 leading-5 text-sm md:text-base">
              <p>
                FoMo Cinemas <br />
                5 Bluestone Way <br />
                East Brunswick
              </p>
              <p>Phone: +91 98765 43210</p>
              <p>Email: support@fomocinemas.com</p>
            </div>
          </div>

          {/* ── Column 3: Customer Reviews ────────────────────────────── */}
          <div className="text-center flex flex-col items-center w-full">
            {/*
              mb-5 → mb-3 md:mb-5: shaves a little vertical space between
              the heading and the review content on mobile.
            */}
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-5 text-pink-500 text-center">
              Customer Reviews
            </h2>

            {/*
              min-h-[220px] forces a large fixed empty zone when the
              review text is short. Replaced with min-h-[150px] md:min-h-[180px]
              which still gives the swiper room but removes excess dead space.
            */}
            <div className="relative w-full px-8 flex items-center justify-center min-h-[150px] md:min-h-[180px]">
              {footerReviews.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-sm select-none">
                  No customer reviews available yet.
                </div>
              ) : (
                <>
                  {/* Left Arrow */}
                  <button className="custom-footer-prev absolute left-0 top-1/2 -translate-y-1/2 text-pink-500 hover:text-white transition duration-200 cursor-pointer z-10 select-none">
                    <ChevronLeft size={24} />
                  </button>

                  {/* Swiper Slider */}
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    navigation={{
                      prevEl: ".custom-footer-prev",
                      nextEl: ".custom-footer-next",
                    }}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    loop={footerReviews.length > 1}
                    slidesPerView={1}
                    className="w-full h-full"
                  >
                    {footerReviews.map((review, index) => (
                      <SwiperSlide key={index}>
                        <div className="text-center flex flex-col justify-between h-full px-4">
                          <p className="text-zinc-400 italic text-sm leading-6">
                            "{review.text}"
                          </p>
                          <p className="mt-3 text-white font-medium text-sm">
                            — {review.author}{review.movieTitle ? ` (on ${review.movieTitle})` : ""}
                          </p>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Right Arrow */}
                  <button className="custom-footer-next absolute right-0 top-1/2 -translate-y-1/2 text-pink-500 hover:text-white transition duration-200 cursor-pointer z-10 select-none">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Column 4: Follow Us ───────────────────────────────────── */}
          <div className="text-center md:text-left">
            {/*
              mb-5 → mb-3 md:mb-5 on heading.
            */}
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-5">Follow Us</h2>

            {/*
              OLD: empty <div className="flex gap-5 mb-8"></div>
                   then <div className="space-y-4 mt-6">
              This was a phantom div with mb-8 + the real content's mt-6
              = 56px of pure dead space before the app buttons.

              FIX: remove the empty div entirely.
                   Keep space-y-3 md:space-y-4 on the buttons container.
                   No extra margin-top needed since the heading mb already
                   provides the gap.
            */}
            <div className="space-y-3 md:space-y-4">
              <button className="w-full bg-black border border-zinc-700 py-2.5 md:py-3 rounded-lg hover:border-pink-500 transition duration-300 text-sm md:text-base">
                Download on App Store
              </button>
              <button className="w-full bg-black border border-zinc-700 py-2.5 md:py-3 rounded-lg hover:border-pink-500 transition duration-300 text-sm md:text-base">
                Get it on Google Play
              </button>
            </div>
          </div>

        </div>

        {/* ── Bottom Footer ─────────────────────────────────────────────── */}
        {/*
          pt-2 stays; gap-4 → gap-2 md:gap-4 for tighter stacking on mobile.
          mt-4 md:mt-0 added on the links div so it doesn't crowd the copyright
          when they stack vertically.
        */}
        <div className="border-t border-zinc-800 mt-4 md:mt-6 pt-3 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          <p className="text-zinc-500 text-sm">
            © 2026 FoMo Cinemas. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-zinc-500 text-sm">
            <Link to="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition">
              Terms &amp; Conditions
            </Link>
            <Link to="/contact" className="hover:text-white transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
