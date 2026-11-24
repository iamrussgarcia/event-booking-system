const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const formatUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const normalizePhone = (raw) => {
  let digits = String(raw || "").replace(/\s+/g, "");
  if (digits.startsWith("+63")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
};

const isValidPassword = (pw) =>
  typeof pw === "string" && pw.length >= 8 && /[0-9\W_]/.test(pw);

const createToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

// [POST] /users/register
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, consent } = req.body;
    const errors = {};

    if (!firstName?.trim()) errors.firstName = "First name is required.";
    if (!lastName?.trim()) errors.lastName = "Last name is required.";
    if (!email?.trim()) errors.email = "Email is required.";

    const cleanPhone = normalizePhone(phone);
    if (!/^\d{9,13}$/.test(cleanPhone)) {
      errors.phone = "Phone must be 9 to 13 digits.";
    }

    if (!isValidPassword(password)) {
      errors.password =
        "Password must be at least 8 characters and include a number or symbol.";
    }

    if (consent !== true) {
      errors.consent = "Consent to the privacy notice is required.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password: hashedPassword,
      consent: true,
    });

    const token = createToken(newUser);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    return res.status(201).json({
      access: token,
      user: formatUser(newUser),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        errors: { email: "Email already used." },
      });
    }
    return res.status(500).json({ message: "Server error." });
  }
};

// [POST] /users/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Wrong email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong email or password." });
    }

    const token = createToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    return res.status(200).json({
      access: token,
      user: formatUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};

// [POST] /users/logout
exports.logoutUser = async (req, res) => {
  res.clearCookie("token");
  return res.status(204).send();
};

// [GET] /users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    return res.status(200).json({ user: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};

// [PATCH] /users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const updates = {};
    const errors = {};

    // email and role are intentionally ignored per spec
    if (firstName !== undefined) {
      if (typeof firstName !== "string" || !firstName.trim()) {
        errors.firstName = "First name is required.";
      } else {
        updates.firstName = firstName.trim();
      }
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || !lastName.trim()) {
        errors.lastName = "Last name is required.";
      } else {
        updates.lastName = lastName.trim();
      }
    }

    if (phone !== undefined) {
      const cleanPhone = normalizePhone(phone);
      if (!/^\d{9,13}$/.test(cleanPhone)) {
        errors.phone = "Phone must be 9 to 13 digits.";
      } else {
        updates.phone = cleanPhone;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    return res.status(200).json({ user: formatUser(updatedUser) });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};

// [PATCH] /users/password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const errors = {};

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "Unauthorized." });

    const isMatch = await bcrypt.compare(currentPassword || "", user.password);
    if (!isMatch) {
      errors.currentPassword = "Current password is incorrect.";
    }

    if (!isValidPassword(newPassword)) {
      errors.newPassword =
        "Password must be at least 8 characters and include a number or symbol.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};