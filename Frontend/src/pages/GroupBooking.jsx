import { useState } from "react";
import { queryService } from "../services/api";
import { Loader2 } from "lucide-react";

const GroupBooking = () => {
  const [companyName, setCompanyName] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!companyName || !numberOfPeople || !message) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await queryService.submitGroupBooking(
        companyName,
        Number(numberOfPeople),
        message
      );
      setSuccess(true);
      setCompanyName("");
      setNumberOfPeople("");
      setMessage("");
    } catch (err) {
      setError(
        err.message || "Failed to submit group booking request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center sm:text-left">
          Group Booking
        </h1>

        <p className="text-gray-300 text-sm sm:text-base mb-8 leading-relaxed text-center sm:text-left">
          Planning a corporate event, birthday, or private screening? Contact us
          for customized group booking packages.
        </p>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm mb-6 font-medium text-center">
            Your group booking request has been submitted successfully! We will contact you soon.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg text-sm mb-6 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Organization / Group Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-700 outline-none text-sm sm:text-base focus:border-[#e5007d] transition"
            disabled={loading}
          />

          <input
            type="number"
            placeholder="Number of Guests"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-700 outline-none text-sm sm:text-base focus:border-[#e5007d] transition"
            disabled={loading}
          />

          <textarea
            rows="5"
            placeholder="Event Details"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-700 outline-none text-sm sm:text-base focus:border-[#e5007d] transition"
            disabled={loading}
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#e5007d] px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base hover:bg-pink-700 transition font-semibold cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupBooking;
