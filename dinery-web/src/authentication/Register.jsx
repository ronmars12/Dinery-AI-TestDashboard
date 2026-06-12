import React, { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, firestore } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import logo from "../assets/dinery-logo.png";
import bg from "../assets/background-register.jpg";
import { motion } from "framer-motion";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!firstName || !lastName || !contact || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = cred;

      const displayName = `${firstName} ${middleName} ${lastName}`
        .trim()
        .replace(/\s+/g, " ");

      await setDoc(
        doc(firestore, "users", user.uid),
        {
          uid: user.uid,

          contact,
          created_at: serverTimestamp(),

          displayName,
          email,

          fcm_token: "",
          fcm_updated_at: null,

          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,

          language: "en",
          language_updated_at: serverTimestamp(),

          photoURL: "",
          plan: "starter",

          role: "owner",

          updated_at: serverTimestamp(),

          user_setup: true,
          user_confirm: true,
        },
        { merge: true }
      );

      await signOut(auth);

      setRegisteredEmail(email);
      setShowModal(true);

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setContact("");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err?.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-white/20 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Dinery Logo" className="h-16 object-contain" />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Create Owner Account
          </h1>
          <p className="text-gray-600 text-sm">
            Register a new Dinery owner account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              placeholder="Middle name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              placeholder="Last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              type="tel"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              placeholder="e.g. 09171234567"
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              placeholder="Confirm password"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="showPassword"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600">
              Show password
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-[#ff8d21] to-[#ff6b21] text-white font-medium py-2.5 rounded transition shadow-md ${
              isSubmitting
                ? "opacity-70 cursor-not-allowed"
                : "hover:from-[#ff7b21] hover:to-[#ff5a21]"
            }`}
          >
            {isSubmitting ? "Creating Account..." : "Create Owner Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#ff8d21] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200"
          >
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">
                ✓
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Owner Account Created!
              </h3>

              <p className="mt-2 text-gray-600">
                Account created for{" "}
                <span className="font-medium text-gray-900">
                  {registeredEmail}
                </span>
              </p>

              <p className="mt-2 text-sm text-gray-500">
                You can now sign in using the password you created.
              </p>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-medium py-2.5 hover:opacity-95"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}