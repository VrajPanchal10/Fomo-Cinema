import { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../services/api";

// ─── Mapping from backend errorCode → user-facing message ────────────────────
const ERROR_MESSAGES = {
  EMAIL_EXISTS:     "An account with this email already exists.",
  EMAIL_RESERVED:   "This email address is reserved. Please use a different email.",
  USER_NOT_FOUND:   "No account found with this email address.",
  INVALID_PASSWORD: "Incorrect password. Please try again.",
  ACCOUNT_DISABLED: "This account has been disabled. Please contact support.",
  TOKEN_EXPIRED:    "Your session has expired. Please log in again.",
  VALIDATION_ERROR: null, // handled via field-level errors array
};

// ─── Resolve the best user-facing message from an ApiError ───────────────────
const resolveMessage = (err) => {
  if (!(err instanceof ApiError)) return err.message || "Something went wrong. Please try again.";
  if (err.errorCode && ERROR_MESSAGES[err.errorCode] !== undefined && ERROR_MESSAGES[err.errorCode] !== null) {
    return ERROR_MESSAGES[err.errorCode];
  }
  return err.message || "Something went wrong. Please try again.";
};

// ─── Email regex ──────────────────────────────────────────────────────────────
const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

// ─── Password strength checks ─────────────────────────────────────────────────
const passwordChecks = (pw) => ({
  length:  pw.length >= 8,
  letter:  /[A-Za-z]/.test(pw),
  number:  /\d/.test(pw),
});

const LoginSidebar = ({ openLogin, setOpenLogin }) => {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading]           = useState(false);

  const PhoneInputComponent = PhoneInput.default || PhoneInput;

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setPassword("");
    setShowPassword(false);
    setFieldErrors({ name: "", email: "", phone: "", password: "" });
  };

  const clearFieldError = (field) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Apply server field-level errors returned as an array ─────────────────
  const applyFieldErrors = (errArr) => {
    const mapped = {};
    errArr.forEach(({ field, message }) => { mapped[field] = message; });
    setFieldErrors((prev) => ({ ...prev, ...mapped }));
  };

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = { name: "", email: "", phone: "", password: "" };

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }

    if (errors.email || errors.password) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim().toLowerCase(), password);
      addToast(`Welcome back, ${loggedUser.name.split(" ")[0]}! 👋`, "success");
      resetForm();
      setOpenLogin(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorCode === "USER_NOT_FOUND" || err.status === 404) {
          setFieldErrors((prev) => ({ ...prev, email: "No account found with this email address." }));
        } else if (err.errorCode === "INVALID_PASSWORD" || err.status === 401 || err.status === 400) {
          setFieldErrors((prev) => ({ ...prev, password: "Incorrect password. Please try again." }));
        } else if (err.errorCode === "TOKEN_EXPIRED") {
          addToast("Your session has expired. Please log in again.", "error");
        } else if (err.errorCode === "ACCOUNT_DISABLED") {
          addToast("This account has been disabled. Please contact support.", "error");
        } else if (err.errors) {
          applyFieldErrors(err.errors);
        } else {
          addToast(resolveMessage(err), "error");
        }
      } else {
        addToast("Login failed. Please check your connection and try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTER ───────────────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errors = { name: "", email: "", phone: "", password: "" };
    let hasErrors = false;

    if (!name.trim()) {
      errors.name = "Full name is required.";
      hasErrors = true;
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
      hasErrors = true;
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address.";
      hasErrors = true;
    }

    const digits = phone.replace(/[^\d]/g, "");
    if (!phone) {
      errors.phone = "Mobile number is required.";
      hasErrors = true;
    } else if (digits.length < 8) {
      errors.phone = "Please enter a valid mobile number (minimum 8 digits).";
      hasErrors = true;
    }

    const pwChecks = passwordChecks(password);
    if (!password) {
      errors.password = "Password is required.";
      hasErrors = true;
    } else if (!pwChecks.length) {
      errors.password = "Password must be at least 8 characters.";
      hasErrors = true;
    } else if (!pwChecks.letter) {
      errors.password = "Password must contain at least one letter.";
      hasErrors = true;
    } else if (!pwChecks.number) {
      errors.password = "Password must contain at least one number.";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(name.trim(), email.trim().toLowerCase(), phone, password);
      addToast(`Welcome to FoMo Cinema, ${newUser.name.split(" ")[0]}! 🎬`, "success");
      resetForm();
      setOpenLogin(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorCode === "EMAIL_EXISTS" || err.status === 409) {
          setFieldErrors((prev) => ({
            ...prev,
            email: resolveMessage(err),
          }));
        } else if (err.errorCode === "EMAIL_RESERVED") {
          setFieldErrors((prev) => ({
            ...prev,
            email: "This email address is not available for registration.",
          }));
        } else if (err.errorCode === "VALIDATION_ERROR" && err.errors) {
          applyFieldErrors(err.errors);
        } else if (err.errors) {
          applyFieldErrors(err.errors);
        } else {
          addToast(resolveMessage(err), "error");
        }
      } else {
        addToast("Registration failed. Please check your connection and try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setOpenLogin(false);
  };

  // ─── Shared input class builder ──────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full h-[48px] rounded-md px-4 bg-white text-black border ${
      fieldErrors[field]
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-[#e5007d]"
    } placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition`;

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1 font-medium" role="alert">
        <span aria-hidden="true">✗</span> {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <>
      {/* Background Overlay */}
      {openLogin && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 z-40 transition-opacity cursor-pointer"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-[100vh] w-full sm:w-[430px] bg-black border-l border-zinc-800 rounded-l-2xl text-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          openLogin ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={isRegister ? "Create Account" : "Login"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-none">
          <h1 className="text-2xl font-semibold">
            {isRegister ? "Create Account" : "Login"}
          </h1>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={28} className="text-gray-400 hover:text-white transition" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-8 py-10 flex-1 overflow-y-auto">
          {!isRegister ? (
            /* ────── LOGIN FORM ────── */
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold leading-snug mb-4">
                  Login or register a new FOMO account
                </h2>
                <p className="text-gray-400 text-sm leading-5">
                  An account is necessary to purchase memberships, tickets, gift
                  cards, food and beverages at FOMO.
                </p>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="login-email" className="block text-base font-medium mb-2 text-gray-300">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  className={inputClass("email")}
                  disabled={loading}
                  autoComplete="email"
                />
                <FieldError field="email" />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label htmlFor="login-password" className="block text-base font-medium mb-2 text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                    className={`${inputClass("password")} pr-12`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FieldError field="password" />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e5007d] hover:bg-pink-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition py-3 rounded-md text-lg font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin text-white" size={20} />}
                {loading ? "Logging in…" : "Login"}
              </button>

              {/* Switch to Register */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm mb-2">Don't have an account?</p>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); resetForm(); }}
                  className="text-[#e5007d] hover:underline text-base font-medium cursor-pointer"
                  disabled={loading}
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            /* ────── REGISTER FORM ────── */
            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold mb-2">Create Account</h2>
                <p className="text-gray-400 text-sm">Register your new FOMO account</p>
              </div>

              {/* Full Name */}
              <div className="mb-5">
                <label htmlFor="reg-name" className="block mb-2 text-base font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                  className={inputClass("name")}
                  disabled={loading}
                  autoComplete="name"
                />
                <FieldError field="name" />
              </div>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="reg-email" className="block mb-2 text-base font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  className={inputClass("email")}
                  disabled={loading}
                  autoComplete="email"
                />
                <FieldError field="email" />
              </div>

              {/* Mobile */}
              <div className="mb-5">
                <label htmlFor="reg-phone" className="block text-base font-medium mb-2 text-gray-300">
                  Mobile Number
                </label>
                <PhoneInputComponent
                  country={"au"}
                  value={phone}
                  onChange={(value) => { setPhone(value); clearFieldError("phone"); }}
                  containerClass="!w-full"
                  inputClass={`!w-full !h-[48px] !bg-white !text-black !text-base !rounded-md focus:!ring-2 ${
                    fieldErrors.phone
                      ? "!border-red-500 focus:!ring-red-500"
                      : "!border-gray-300 focus:!ring-[#e5007d]"
                  }`}
                  buttonClass="!bg-white !border-r !border-gray-300 !rounded-l-md"
                  dropdownClass="!bg-white !text-black"
                  disabled={loading}
                  inputProps={{ id: "reg-phone", required: true }}
                />
                <FieldError field="phone" />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label htmlFor="reg-password" className="block mb-2 text-base font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters, 1 letter &amp; 1 number"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                    className={`${inputClass("password")} pr-12`}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Live password strength indicators */}
                {password && (() => {
                  const checks = passwordChecks(password);
                  return (
                    <div className="mt-2 flex flex-col gap-0.5 text-xs">
                      <span className={checks.length ? "text-green-400" : "text-zinc-500"}>
                        {checks.length ? "✓" : "○"} At least 8 characters
                      </span>
                      <span className={checks.letter ? "text-green-400" : "text-zinc-500"}>
                        {checks.letter ? "✓" : "○"} At least one letter
                      </span>
                      <span className={checks.number ? "text-green-400" : "text-zinc-500"}>
                        {checks.number ? "✓" : "○"} At least one number
                      </span>
                    </div>
                  );
                })()}
                <FieldError field="password" />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e5007d] hover:bg-pink-700 disabled:bg-zinc-700 disabled:cursor-not-allowed transition py-3 rounded-md text-lg font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="animate-spin text-white" size={20} />}
                {loading ? "Creating Account…" : "Create Account"}
              </button>

              {/* Back to Login */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm mb-2">Already have an account?</p>
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); resetForm(); }}
                  className="text-[#e5007d] hover:underline text-base font-medium cursor-pointer"
                  disabled={loading}
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginSidebar;
