import React, { useState } from "react";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/dinery-logo.png";
import bg from "../assets/background-login.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const redirectBasedOnRole = async (uid) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = (userData.role || "").toLowerCase();

        if (role === "owner") {
          const isConfirmed =
            userData.User_confirm === true ||
            userData.user_confirm === true ||
            userData.userConfirm === true;

          if (!isConfirmed) {
            await auth.signOut();
            setError("PENDING_APPROVAL");
            return;
          }
        }

        if (role === "admin") {
          navigate("/super-admin-dashboard");
        } else {
          navigate("/");
        }

        return;
      }

      const restaurantsSnap = await getDocs(
        collection(firestore, "restaurants")
      );

      for (const restaurantDoc of restaurantsSnap.docs) {
        const staffSnap = await getDocs(
          query(
            collection(
              firestore,
              "restaurants",
              restaurantDoc.id,
              "staff"
            ),
            where("uid", "==", uid)
          )
        );

        if (!staffSnap.empty) {
          const staffData = staffSnap.docs[0].data();
          const role = (staffData.role || "staff").toLowerCase();

          sessionStorage.setItem(
            "staffRestaurantId",
            restaurantDoc.id
          );
          sessionStorage.setItem("staffRole", role);

          if (role === "admin" || role === "manager") {
            navigate("/");
          } else {
            navigate("/staff-dashboard");
          }

          return;
        }
      }

      navigate("/");
    } catch (err) {
      console.error("Error fetching role:", err);
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await redirectBasedOnRole(userCredential.user.uid);
    } catch (err) {
      setError(err.message);
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
      <div className="absolute inset-0 bg-black/30"></div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-white/20 relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="Dinery Logo"
            className="h-16 object-contain"
          />
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to your Dinery account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && error !== "PENDING_APPROVAL" && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-[#ff8d21] focus:border-[#ff8d21]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute inset-y-0 right-0 px-3 text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#ff8d21] text-white font-medium py-2.5 rounded transition ${
              isSubmitting
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-[#e67e22]"
            }`}
          >
            {isSubmitting
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            <Link
              to="/forgot-password"
              className="text-gray-500 hover:text-[#ff8d21] hover:underline"
            >
              Forgot Password?
            </Link>
          </p>

          <p className="mt-3">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#ff8d21] font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Pending Approval Modal */}
        {error === "PENDING_APPROVAL" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-center mb-3">
                Account Pending Approval
              </h3>

              <p className="text-center text-gray-600 mb-5">
                Your account has not been approved yet.
                Please contact your administrator.
              </p>

              <button
                onClick={() => setError("")}
                className="w-full bg-[#ff8d21] text-white py-2.5 rounded hover:bg-[#e67e22]"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}