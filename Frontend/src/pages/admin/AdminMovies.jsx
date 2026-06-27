import { useEffect, useState } from "react";
import { adminService, uploadService, getMovieImage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Loader2, Plus, Edit2, Archive, RotateCcw, X, AlertTriangle, CloudUpload, Film } from "lucide-react";

const AdminMovies = () => {
  const { addToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab state: "active" or "archived"
  const [activeTab, setActiveTab] = useState("active");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState("");
  const [imdb, setImdb] = useState("");
  const [poster, setPoster] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [status, setStatus] = useState("now-showing");
  const [cast, setCast] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Upload progress states
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Archive Confirm states
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [movieToArchive, setMovieToArchive] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      if (activeTab === "active") {
        const data = await adminService.getMovies();
        setMovies(data);
      } else {
        const data = await adminService.getArchivedMovies();
        setMovies(data);
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      addToast(error.message || "Failed to load movies.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const openAddModal = () => {
    setEditingMovie(null);
    setTitle("");
    setDescription("");
    setGenre("");
    setLanguage("English");
    setDuration("");
    setRating("");
    setImdb("");
    setPoster("");
    setTrailerUrl("");
    setStatus("now-showing");
    setCast("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setTitle(movie.title || "");
    setDescription(movie.description || "");
    setGenre(movie.genre ? movie.genre.join(", ") : "");
    setLanguage(movie.language || "English");
    setDuration(movie.duration || "");
    setRating(movie.rating || "");
    setImdb(movie.imdb || "");
    setPoster(movie.poster || "");
    setTrailerUrl(movie.trailerUrl || "");
    setStatus(movie.status || "now-showing");
    setCast(movie.cast ? movie.cast.join(", ") : "");
    setIsActive(movie.isActive !== false);
    setShowModal(true);
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Determine target upload directory and load indicators
    let folderType = "posters";
    if (type === "poster") {
      setUploadingPoster(true);
      folderType = "posters";
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadService.uploadImage(formData, folderType);
      
      if (result && result.success) {
        if (type === "poster") setPoster(result.url);
        addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`, "success");
      } else {
        throw new Error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      addToast(error.message || `Upload failed for ${type}.`, "error");
    } finally {
      if (type === "poster") setUploadingPoster(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!poster) {
      addToast("Poster is required.", "error");
      return;
    }

    const moviePayload = {
      title,
      description,
      genre: genre.split(",").map((g) => g.trim()).filter(Boolean),
      language,
      duration,
      rating,
      imdb,
      poster,
      trailerUrl,
      status,
      cast: cast.split(",").map((c) => c.trim()).filter(Boolean),
      isActive,
    };

    try {
      if (editingMovie) {
        await adminService.updateMovie(editingMovie.id, moviePayload);
        addToast("Movie Updated Successfully", "success");
      } else {
        await adminService.createMovie(moviePayload);
        addToast("Movie Created Successfully", "success");
      }
      setShowModal(false);
      fetchMovies();
    } catch (error) {
      console.error("Error saving movie:", error);
      addToast(error.message || "Movie Save Failed", "error");
    }
  };

  const confirmArchive = (movie) => {
    setMovieToArchive(movie);
    setShowArchiveConfirm(true);
  };

  const handleArchive = async () => {
    if (!movieToArchive) return;
    try {
      await adminService.archiveMovie(movieToArchive.id);
      setShowArchiveConfirm(false);
      setMovieToArchive(null);
      addToast("Movie Archived Successfully", "success");
      fetchMovies();
    } catch (error) {
      console.error("Error archiving movie:", error);
      addToast(error.message || "Failed to archive movie.", "error");
    }
  };

  const handleRestore = async (movie) => {
    try {
      await adminService.restoreMovie(movie.id);
      addToast("Movie Restored Successfully", "success");
      fetchMovies();
    } catch (error) {
      console.error("Error restoring movie:", error);
      addToast(error.message || "Failed to restore movie.", "error");
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Movie Catalog Manager</h1>
          <p className="text-zinc-400 mt-1">Manage showing and upcoming films.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#e5007d] hover:bg-pink-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-[#e5007d]/20 transition transform hover:scale-[1.02] duration-200"
        >
          <Plus size={18} />
          <span>Add Movie</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-zinc-800 gap-6 text-sm">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 font-semibold transition cursor-pointer relative ${
            activeTab === "active" ? "text-[#e5007d]" : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>Active Movies</span>
          {activeTab === "active" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e5007d] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-3 font-semibold transition cursor-pointer relative ${
            activeTab === "archived" ? "text-[#e5007d]" : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>Archived Movies</span>
          {activeTab === "archived" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e5007d] rounded-full" />
          )}
        </button>
      </div>

      {/* Movies Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">Poster</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Protection</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-zinc-500">
                    <Loader2 className="animate-spin text-[#e5007d] mx-auto mb-2" size={32} />
                    <span>Loading films...</span>
                  </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-zinc-500">
                    No movies found in this section.
                  </td>
                </tr>
              ) : (
                movies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-zinc-900/20 transition">
                    <td className="px-6 py-4">
                      <img
                        src={getMovieImage(movie.poster)}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-lg border border-zinc-800"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">
                      {movie.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {movie.genre && movie.genre.map((g, i) => (
                          <span key={i} className="text-[10px] bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{movie.language}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        movie.status === "now-showing" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" :
                        movie.status === "upcoming" ? "text-blue-400 bg-blue-400/10 border border-blue-400/20" :
                        "text-purple-400 bg-purple-400/10 border border-purple-400/20"
                      }`}>
                        {movie.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {movie.isSeeded ? (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/20">
                          Seeded (Protected)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full text-zinc-400 bg-zinc-400/10 border border-zinc-800">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(movie)}
                          className="p-2 rounded-lg bg-zinc-950/40 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition cursor-pointer"
                          title="Edit Movie"
                        >
                          <Edit2 size={15} />
                        </button>
                        {movie.isActive !== false ? (
                          <button
                            onClick={() => confirmArchive(movie)}
                            className="p-2 rounded-lg bg-rose-950/20 text-rose-400 hover:text-rose-300 hover:bg-rose-900 border border-rose-900/30 transition cursor-pointer"
                            title="Archive Movie"
                          >
                            <Archive size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(movie)}
                            className="p-2 rounded-lg bg-emerald-950/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900 border border-emerald-900/30 transition cursor-pointer"
                            title="Restore Movie"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header - Sticky */}
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Film size={20} className="text-[#e5007d]" />
                <span>{editingMovie ? `Edit Movie: ${editingMovie.title}` : "Add New Movie"}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form and Scrollable Container */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
              <div className="p-6 space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Movie Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Status *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    >
                      <option value="now-showing">Now Showing</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Language</label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Duration (e.g. 2h 15m)</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Rating (e.g. PG-13)</label>
                    <input
                      type="text"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">IMDb Rating (e.g. 8.2/10)</label>
                    <input
                      type="text"
                      value={imdb}
                      onChange={(e) => setImdb(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-semibold uppercase">Trailer URL</label>
                    <input
                      type="text"
                      value={trailerUrl}
                      onChange={(e) => setTrailerUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold uppercase">Genres (Comma separated)</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Action, Sci-Fi, Adventure"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold uppercase">Cast Members (Comma separated)</label>
                  <input
                    type="text"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                    placeholder="Actor A, Actor B, Actor C"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold uppercase">Summary Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#e5007d]"
                  ></textarea>
                </div>

                {/* Dynamic Image Upload Fields */}
                <div className="grid grid-cols-1 gap-4 border-t border-zinc-900 pt-4 max-w-md">
                  {/* Poster Upload */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-semibold uppercase block">Poster *</label>
                    <div className="space-y-2">
                      {poster ? (
                        <div className="relative group w-full h-32 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/50">
                          <img
                            src={getMovieImage(poster)}
                            alt="Poster Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <label className="cursor-pointer text-xs font-semibold text-white bg-zinc-900/80 px-2 py-1.5 rounded-md hover:bg-zinc-800 transition">
                               Replace
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "poster")}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 transition cursor-pointer">
                          {uploadingPoster ? (
                            <Loader2 className="animate-spin text-[#e5007d]" size={20} />
                          ) : (
                            <CloudUpload className="text-zinc-500 hover:text-zinc-400" size={20} />
                          )}
                          <span className="text-[11px] text-zinc-400 mt-2 font-medium">
                            {uploadingPoster ? "Uploading..." : "Choose Poster"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "poster")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer - Sticky */}
              <div className="p-6 border-t border-zinc-900 bg-zinc-950 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-medium text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPoster}
                  className="px-5 py-2.5 rounded-lg bg-[#e5007d] hover:bg-pink-700 text-white font-semibold text-sm transition cursor-pointer shadow-lg shadow-[#e5007d]/20 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold">Archive Movie</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Are you sure you want to archive <span className="text-white font-semibold">"{movieToArchive?.title}"</span>? 
              It will disappear from the public website, but its historical bookings and shows will be fully preserved.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowArchiveConfirm(false);
                  setMovieToArchive(null);
                }}
                className="flex-1 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition text-zinc-300 hover:text-white font-medium text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 transition text-white font-semibold text-sm cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
