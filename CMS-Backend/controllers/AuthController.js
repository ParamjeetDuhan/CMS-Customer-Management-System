/**
 * controllers/authController.js
 *
 * All Salesforce responses are normalised through userParser
 * before being sent to the frontend.
 */
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sfSignUp,
  sfLogin,
  sfUpdateProfile,
  sfChangePassword,
  sfGetProfileByEmail,
  sfSaveResetToken,
  sfGetUserByResetToken,
  sfClearResetToken,
  sfUpdatePassword,
} = require("../services/salesforce/sfAuthService");
const { parseUser } = require("../parsers/userParser");
const {sendPasswordResetEmail} = require("../config/emailService");

/* ── helpers ── */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

/* ── POST /api/auth/signup ── */
const signup = async (req, res) => {
  try {
    const { name, email, phone, password,usertype } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sfResult = await sfSignUp({
      Name:     name,
      Email:    email,
      Phone:    phone || "",
      Password: hashedPassword,
      UserType: usertype,
    });

    const parsed = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    if (parsed?.status && parsed.status !== "Success") {
      return res.status(400).json({ message: parsed.message || "Signup failed" });
    }

    const user  = parseUser(parsed?.data || parsed);
    const token = signToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("signup error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── POST /api/auth/login ── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const sfResult = await sfLogin({ Email: email, Password: password });
    const parsed   = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;

    if (!parsed || parsed.status !== "Success") {
      return res.status(404).json({ message: "User not found" });
    }

    const sfUser = parsed.data;

    /* bcrypt compare against the hashed password stored in Salesforce */
    const isMatch = await bcrypt.compare(password, sfUser.Password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user  = parseUser(sfUser);
    const token = signToken(user);

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error("login error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};


/* ── PUT /api/auth/profile ── */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, email, customerid} = req.body;
    const sfResult = await sfUpdateProfile( customerid, {  Name: name, Phone: phone, Email: email });
    const parsed   = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const user     = parseUser(parsed?.data || parsed);
    return res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/auth/change-password ── */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword ,customerid} = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword required" });
    }
    if(currentPassword == newPassword){
      return res.status(400).json({message :"current Password and NewPasswor cannot be same "});
    }
    const hashedNew = await bcrypt.hash(newPassword, 10);
    await sfChangePassword( customerid, {
      currentPassword,
      newPassword: hashedNew,
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};
const forgotPassword = async (req, res) => {

  const SAFE_MSG = "If that email is registered, a reset link has been sent.";
 
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });
 
    /* 1. Look up the user */
    let sfUser = null;
    try {
      const sfResult = await sfGetProfileByEmail( email);
      const parsed   = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
      sfUser = parsed?.data || parsed;
    } catch {
      return res.status(200).json({ message: SAFE_MSG });
    }
 
    if (!sfUser) return res.status(200).json({ message: SAFE_MSG });
 
    /* 2. Generate secure random token */
    const plainToken  = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");
    const expiresAt   = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
 
    /* 3. Persist hashed token + expiry in Salesforce */
    await sfSaveResetToken(sfUser.Account_ID || sfUser.Id, hashedToken, expiresAt);
 
    /* 4. Build frontend reset URL */
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl    = `${frontendUrl}/reset-password?token=${plainToken}`;
 
    /* 5. Send email */
    await sendPasswordResetEmail(email, sfUser.Name || "", resetUrl);
 
    return res.status(200).json({ message: SAFE_MSG });
  } catch (err) {
    console.error("forgotPassword error:", err.message);
     console.error("forgotPassword error:", err.response?.data);
    /* Still return 200 — don't leak whether the email exists */
    return res.status(200).json({ message: SAFE_MSG });
  }
};
 

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "token and newPassword are required" });
 
    /* 1. Hash incoming token */
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
 
    const sfResult = await sfGetUserByResetToken(hashedToken);
    const parsed   = typeof sfResult === "string" ? JSON.parse(sfResult) : sfResult;
    const sfUser   = parsed?.data || parsed;
 
    if (!sfUser)
      return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
 
    /* 3. Check token expiry */
    console.log(sfUser.TokenExpiry);
    const expiry = new Date(sfUser.TokenExpiry || 0);
    if (Date.now() > expiry.getTime())
      return res.status(400).json({ message: "Reset link has expired. Please request a new one." });
 
    /* 4. Hash new password and save */
    const hashedNew = await bcrypt.hash(newPassword, 10);
    await sfUpdatePassword(sfUser.Account_ID || sfUser.Id, hashedNew);
 
    /* 5. Clear reset token from Salesforce */
    await sfClearResetToken(sfUser.Account_ID || sfUser.Id);
 
    return res.status(200).json({ message: "Password reset successfully. You can now sign in." });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};
 
module.exports = {
  signup,
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
