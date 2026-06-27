import Home from "./pages/Home";
import { Route, Routes, useLocation } from "react-router-dom";
import MovieDetails from "./components/MovieDetails";
import About from "./pages/About";
import GroupBooking from "./pages/GroupBooking";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQs from "./pages/FAQs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UpcomingShows from "./pages/UpcomingShows";
import FoodDrinks from "./pages/FoodDrinks";
import FoodDetails from "./pages/FoodDetails";
import Memberships from "./pages/Memberships";
import Offers from "./pages/Offers";
import LoginSidebar from "./pages/LoginSidebar";
import UpcomingMoviesDetails from "./pages/UpcomingMoviesDetails";
import FilmByDay from "./pages/FilmByDay";
import Booking from "./pages/Booking";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MyBookings from "./pages/MyBookings";

// Admin Imports
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMovies from "./pages/admin/AdminMovies";
import AdminShows from "./pages/admin/AdminShows";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";


const App = () => {
  const location = useLocation();
  const isBookingPage = location.pathname.startsWith("/booking");
  const { openLogin, setOpenLogin } = useAuth();

  return (
    <div className="bg-black min-h-screen text-white">
      {!isBookingPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upcoming-shows" element={<UpcomingShows />} />
        <Route path="/food-drinks" element={<FoodDrinks />} />
        <Route path="/food-details/:category" element={<FoodDetails />} />
        <Route path="/memberships" element={<Memberships />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/login-sidebar" element={<LoginSidebar />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/upcoming-movies/:id" element={<UpcomingMoviesDetails />} />
        <Route path="/film-by-day/:day" element={<FilmByDay />} />
        <Route path="/booking/:showId" element={<Booking />} />

        {/* Admin Section */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="shows" element={<AdminShows />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>

        <Route path="/about" element={<About />} />
        <Route path="/faqs" element={<FAQs />} />

        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/group-booking" element={<GroupBooking />} />
      </Routes>
      {!isBookingPage && <Footer />}
      <LoginSidebar openLogin={openLogin} setOpenLogin={setOpenLogin} />
    </div>
  );
};

export default App;
