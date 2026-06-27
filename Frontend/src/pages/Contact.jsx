import { useState } from "react";
import { queryService } from "../services/api";
import { Loader2 } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await queryService.submitContact(name, email, message);
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center sm:text-left">
          Contact Us
        </h1>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm mb-6 font-medium text-center">
            Your message has been sent successfully! We will get back to you soon.
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
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-700 outline-none text-sm sm:text-base focus:border-[#e5007d] transition"
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-700 outline-none text-sm sm:text-base focus:border-[#e5007d] transition"
            disabled={loading}
          />

          <textarea
            rows="6"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-700 outline-none text-sm sm:text-base focus:border-[#e5007d] transition"
            disabled={loading}
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#e5007d] hover:bg-pink-700 px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
