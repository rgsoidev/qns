import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const login = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Complete all fields");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username),
        where("password", "==", password)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("Invalid credentials");
        setLoading(false);
        return;
      }

      const user: any = {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      };

      // 💾 save session
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      alert("Login success!");

      console.log("Logged user:", user);
      if ((user && user?.role) === 'super admin') {
        navigate('/')
      } else if ((user && user?.role) === 'admin') {
        navigate('/admin')
      }

      //  redirect example (if using router)
      // window.location.href = "/admin";

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };
  //    const [isChecked, setIsChecked] = useState(false);
  // console.log(isChecked)

  const handleOnChange = () => {
    setShowPass(!showPass);
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Queue
          </h1>

          <p className="text-gray-500 mt-2">
            Admin Login
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={login}
          className="space-y-5"
        >

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
            id="showpass"
              type="checkbox"
              checked={showPass}
              onChange={handleOnChange}
            />
            <label className="cursor-pointer" htmlFor="showpass">Show Password</label>
          </div>
          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Queue System
        </p>
      </div>
    </div>
  );
}