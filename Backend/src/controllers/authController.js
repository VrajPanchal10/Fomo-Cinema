const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Helper: sign a JWT carrying id, email, role ─────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ─── Helper: build a consistent success envelope ─────────────────────────────
const ok = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({ success: true, message, ...data });

// ─── Helper: build a consistent error envelope ───────────────────────────────
const fail = (res, statusCode, message, errorCode, extra = {}) =>
  res.status(statusCode).json({ success: false, message, errorCode, ...extra });

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Guard: the admin email address is reserved — it must only be created via
    // `npm run create:admin`.  We return a distinct errorCode so the frontend
    // can show a specific (non-misleading) message rather than "email exists".
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    if (adminEmail && email.toLowerCase().trim() === adminEmail) {
      return fail(
        res, 409,
        "This email address is reserved. Please use a different email.",
        "EMAIL_RESERVED"
      );
    }

    // Check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return fail(
        res, 409,
        "An account with this email already exists.",
        "EMAIL_EXISTS"
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user — role always defaults to "user" for public registration
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = signToken(newUser);

    return ok(res, 201, "Registration successful.", {
      token,
      user: {
        id:    newUser._id,
        name:  newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role:  newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user — search by lowercased email for consistency
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return fail(res, 404, "No account found with this email.", "USER_NOT_FOUND");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return fail(res, 401, "Incorrect password. Please try again.", "INVALID_PASSWORD");
    }

    // Auto-repair: if the env designates this email as admin but DB says "user",
    // self-heal so the system stays consistent without manual DB edits.
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    if (adminEmail && user.email.toLowerCase() === adminEmail && user.role !== "admin") {
      user.role = "admin";
      await User.updateOne({ _id: user._id }, { $set: { role: "admin" } });
    }

    const token = signToken(user);

    return ok(res, 200, "Login successful.", {
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return fail(res, 404, "User not found.", "USER_NOT_FOUND");
    }

    // Auto-repair: keep DB role consistent with env-designated admin email
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    if (adminEmail && user.email.toLowerCase() === adminEmail && user.role !== "admin") {
      user.role = "admin";
      await User.updateOne({ _id: user._id }, { $set: { role: "admin" } });
    }

    return ok(res, 200, "User fetched successfully.", { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
