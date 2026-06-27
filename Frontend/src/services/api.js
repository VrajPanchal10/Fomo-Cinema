import movie1 from "../assets/movie1.jpg";
import movie2 from "../assets/movie2.jpg";
import movie3 from "../assets/movie3.jpg";
import movie4 from "../assets/movie4.jpg";
import movie5 from "../assets/movie5.jpg";
import movie6 from "../assets/movie6.jpg";
import movie7 from "../assets/movie7.jpg";
import movie8 from "../assets/movie8.jpg";
import movie9 from "../assets/movie9.jpg";
import movie10 from "../assets/movie10.jpg";
import movie11 from "../assets/movie11.jpg";
import movie12 from "../assets/movie12.jpg";
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

// Map database-stored asset filenames to loaded React image assets
const imageMap = {
  "movie1.jpg": movie1,
  "movie2.jpg": movie2,
  "movie3.jpg": movie3,
  "movie4.jpg": movie4,
  "movie5.jpg": movie5,
  "movie6.jpg": movie6,
  "movie7.jpg": movie7,
  "movie8.jpg": movie8,
  "movie9.jpg": movie9,
  "movie10.jpg": movie10,
  "movie11.jpg": movie11,
  "movie12.jpg": movie12,
  "movie13.jpg": movie13,
  "movie14.jpg": movie14,
  "movie15.jpg": movie15,
  "movie16.jpg": movie16,
  "movie17.jpg": movie17,
  "movie18.jpg": movie18,
  "movie19.jpg": movie19,
  "movie20.jpg": movie20,
  "movie21.jpg": movie21,
  "movie22.jpg": movie22,
  "movie23.jpg": movie23,
  "movie24.jpg": movie24,
  "movie25.jpg": movie25,
  "movie26.jpg": movie26,
};

export const getMovieImage = (filename) => {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  return imageMap[filename] || filename;
};

// Base URL detection: production vs local dev
const API_BASE_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export class ApiError extends Error {
  constructor(message, status, errors = null, errorCode = null) {
    super(message);
    this.status = status;
    this.errors = errors;       // Array of { field, message } for field-level errors
    this.errorCode = errorCode; // Machine-readable code e.g. "EMAIL_EXISTS"
    this.name = "ApiError";
  }
}

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(`API Error: ${response.statusText}`, response.status);
    }
    return null;
  }

  if (!response.ok) {
    const message   = (data && data.message)   || "An error occurred. Please try again.";
    const errorCode = (data && data.errorCode) || null;
    const errors    = (data && data.errors && Array.isArray(data.errors) && data.errors.length > 0)
      ? data.errors
      : null;
    throw new ApiError(message, response.status, errors, errorCode);
  }
  return data;
};

export const movieService = {
  getMovies: async () => {
    const res = await fetch(`${API_BASE_URL}/movies`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getUpcomingMovies: async () => {
    const res = await fetch(`${API_BASE_URL}/movies/upcoming`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getMovie: async (id) => {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getMoviesByDay: async (day) => {
    const res = await fetch(`${API_BASE_URL}/movies/film-by-day/${day}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const showService = {
  findShow: async (movieId, date, time) => {
    const res = await fetch(
      `${API_BASE_URL}/shows/find?movieId=${movieId}&date=${date}&time=${time}`,
      { headers: getHeaders() }
    );
    return handleResponse(res);
  },

  getShowsByMovie: async (movieId) => {
    const res = await fetch(`${API_BASE_URL}/shows/movie/${movieId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getShow: async (id) => {
    const res = await fetch(`${API_BASE_URL}/shows/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getShows: async () => {
    const res = await fetch(`${API_BASE_URL}/shows`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const authService = {
  register: async (name, email, phone, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, phone, password }),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const bookingService = {
  createBooking: async (showId, selectedSeats, totalAmount) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        showId,
        selectedSeats,
        totalAmount,
      }),
    });
    return handleResponse(res);
  },

  getMyBookings: async () => {
    const res = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  cancelBooking: async (id) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const queryService = {
  submitContact: async (name, email, message) => {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, email, message }),
    });
    return handleResponse(res);
  },

  submitGroupBooking: async (companyName, numberOfPeople, message) => {
    const res = await fetch(`${API_BASE_URL}/group-booking`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ companyName, numberOfPeople, message }),
    });
    return handleResponse(res);
  },
};

export const adminService = {
  getStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getBookings: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/bookings`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getMovies: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/movies`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createMovie: async (movieData) => {
    const res = await fetch(`${API_BASE_URL}/admin/movies`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(movieData),
    });
    return handleResponse(res);
  },

  updateMovie: async (id, movieData) => {
    const res = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(movieData),
    });
    return handleResponse(res);
  },

  archiveMovie: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/movies/${id}/archive`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  restoreMovie: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/movies/${id}/restore`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getArchivedMovies: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/movies/archived`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getShows: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/shows`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createShow: async (showData) => {
    const res = await fetch(`${API_BASE_URL}/admin/shows`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(showData),
    });
    return handleResponse(res);
  },

  updateShow: async (id, showData) => {
    const res = await fetch(`${API_BASE_URL}/admin/shows/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(showData),
    });
    return handleResponse(res);
  },

  deleteShow: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/shows/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getReviews: async (status = "", search = "") => {
    const res = await fetch(
      `${API_BASE_URL}/admin/reviews?status=${status}&search=${encodeURIComponent(search)}`,
      { headers: getHeaders() }
    );
    return handleResponse(res);
  },

  approveReview: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/approve`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  rejectReview: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/reject`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  deleteReview: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const reviewService = {
  createReview: async (movieId, bookingId, rating, review) => {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ movieId, bookingId, rating, review }),
    });
    return handleResponse(res);
  },

  getMovieReviews: async (movieId) => {
    const res = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getFooterReviews: async () => {
    const res = await fetch(`${API_BASE_URL}/reviews/footer`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const uploadService = {
  uploadImage: async (formData, folderType = "posters") => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // Content-Type is deliberately omitted for FormData uploads so the boundary is automatically set
    const res = await fetch(`${API_BASE_URL}/upload/image?type=${folderType}`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse(res);
  },
};

