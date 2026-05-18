import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  where,
  query,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../firebase";

export default function SuperAdminDashBoard() {
  const [companyName, setCompanyName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ================= USERS =================
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "admin")
    );

    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= REGISTER =================
  const registerCompany = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!companyName || !username || !password) {
      alert("Complete all fields");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        companyName,
        username,
        password,
        role: "admin",

        // unique company id
        companyId: crypto.randomUUID(),

        createdAt: Date.now(),
      });

      alert("Company account created!");

      setCompanyName("");
      setUsername("");
      setPassword("");

      // 🔥 refresh table
      fetchUsers();

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  const deleteUser = async (id: string) => {
    const confirmDelete = confirm(
      "Delete this company account?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", id));

      // refresh table
      fetchUsers();

    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* TOP */}
      <div className="py-2 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Super Admin Dashboard
        </h1>

        <button
          onClick={logout}
          className="border border-red-400 text-red-400 px-4 py-1 uppercase cursor-pointer rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4 mt-4">

        {/* LEFT SIDE */}
        <div className="w-full bg-white rounded-2xl shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Queue
            </h1>

            <p className="text-gray-500 mt-2">
              Register New Company
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={registerCompany}
            className="space-y-5"
          >

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>

              <input
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl"
            >
              Create Company Account
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Queue System
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            List of Company Accounts
          </h2>

          <div className="overflow-auto">

            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">
                    Company
                  </th>

                  <th className="border p-3 text-left">
                    Username
                  </th>

                  <th className="border p-3 text-left">
                    Password
                  </th>

                  <th className="border p-3 text-left">
                    Company ID
                  </th>
                  <th className="border p-3 text-left">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border p-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="border p-3">
                        {user.companyName}
                      </td>

                      <td className="border p-3">
                        {user.username}
                      </td>

                      <td className="border p-3">
                        {user.password}
                      </td>

                      <td className="border p-3 text-xs">
                        {user.companyId}
                      </td>
                      <td className="border p-3">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
}