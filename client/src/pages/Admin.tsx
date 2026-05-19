

// ================= ADMIN PAGE =================
// Admin.tsx
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  onSnapshot,
  doc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Admin() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  // 🔐 GET USER FROM LOCALSTORAGE
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ADDING QUEUE
  const addQueue = async () => {
    if (!name || !number) return;

    if (!user?.companyId) {
      alert("No company found. Please login again.");
      return;
    }

    await addDoc(collection(db, "queue"), {
      name,
      number,
      order: Date.now(),

      companyId: user.companyId,
      companyName: user.companyName,
    });

    setName("");
    setNumber("");
  };

  // TEXT TO SPEECH 
  const playSound = () => {
    return new Promise<void>((resolve) => {
      const audio = new Audio("/announcer1.mp3");

      audio.onended = () => resolve();

      audio.play().catch(() => resolve());
    });
  };

  const speak = async (number: string, name: string) => {
    await playSound();

    const synth = window.speechSynthesis;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(
      `Now serving ${number}. ${name}`
    );
    
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = "en-US";

    const voices = synth.getVoices();

    const femaleVoice =
      voices.find(
        (v) =>
          v.lang.includes("en") &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha"))
      ) || voices[0];

    utter.voice = femaleVoice;

    synth.speak(utter);
  };

  const [msg, setMsg] = useState("");

  // ================= NEXT =================
  const nextQueue = async () => {
    setMsg("");

    const q = query(
      collection(db, "queue"),
      where("companyId", "==", user.companyId),
      orderBy("order", "asc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      setMsg("No queue available");
      return;
    }

    if (snap.docs.length === 1) {
      const only = snap.docs[0].data() as any;
      speak(only.number, only.name);
      setMsg("Last queue no.");
      return;
    }

    const current = snap.docs[0];
    await deleteDoc(doc(db, "queue", current.id));

    const next = snap.docs[1].data() as any;
    speak(next.number, next.name);
  };

  //NOTIFY BUTTON
  const notify = async () => {
    const q = query(
      collection(db, "queue"),
      where("companyId", "==", user.companyId),
      orderBy("order", "asc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      setMsg("No queue available");
      return;
    }

    const current = snap.docs[0].data() as any;
    speak(current.number, current.name);
  };


  const [queues, setQueues] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    if (!user?.companyId) return;

    const q = query(
      collection(db, "queue"),
      where("companyId", "==", user.companyId),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQueues(list);
      setCurrent(list.length > 0 ? list[0] : null);
    });

    return () => unsub();
  }, []);
  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login"; // or navigate if gamit react-router
  };
  return (
    <div className="grid grid-cols-2 p-4 gap-4">
      {/* LEFT SIDE */}
      <div className="p-6 border border-[#dddd] rounded-2xl">

        <div className="flex justify-between items-center gap-4">
          <h1 className="text-3xl font-bold mb-4">
            Admin Panel ({user.companyName})
          </h1>
          <button
            onClick={logout}
            className="border border-red-400 text-red-400 px-4 py-1 uppercase cursor-pointer rounded-lg"
          >
            Logout
          </button>
        </div>
        {/* ADD QUEUE */}
        <div className="w-full">
          <input
            className="border p-2 mr-2"
            placeholder="Queue Number (L01)"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />

          <input
            className="border p-2 mr-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={addQueue}
            className="bg-blue-500 cursor-pointer text-white px-4 py-2"
          >
            Add Queue
          </button>
        </div>

        {/* CONTROLLER */}
        <div className="mt-6">
          <h1 className="text-xl font-bold mb-4">
            Queue Controller
          </h1>

          <div className="flex gap-2">
            <button
              onClick={nextQueue}
              className="bg-green-500 w-full cursor-pointer text-white px-4 py-2"
            >
              Next
            </button>

            <button
              onClick={notify}
              className="bg-yellow-500 w-full cursor-pointer text-white px-4 py-2"
            >
              Notify
            </button>
          </div>

          {msg && (
            <p className="text-red-500 mt-3">{msg}</p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="p-6 border border-[#dddd] rounded-2xl">

        {/* NOW SERVING */}
        <div className="bg-green-600 text-white p-4 rounded mb-6">
          <h2 className="text-sm">NOW SERVING</h2>

          <p className="text-3xl font-bold">
            {current ? current.number : "--"}
          </p>

          <p className="text-lg">
            {current ? current.name : "No queue"}
          </p>
        </div>

        {/* QUEUE LIST */}
        <h2 className="text-lg font-semibold mb-2">
          Queue List
        </h2>

        <div className="space-y-2">
          {queues.length === 0 ? (
            <p className="text-gray-500">
              No queue available
            </p>
          ) : (
            queues.map((q, index) => (
              <div
                key={q.id}
                className={`p-3 border rounded flex justify-between ${index === 0 ? "bg-yellow-100" : ""
                  }`}
              >
                <span className="font-bold">
                  {q.number}
                </span>
                <span>{q.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
// import { useState } from "react";
// import { db } from "../firebase";
// import { doc, setDoc } from "firebase/firestore";

// export default function Admin() {
//   const [queueInput, setQueueInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const addManual = async () => {
//     if (!queueInput.trim()) {
//       alert("Please enter a queue number");
//       return;
//     }

//     // Basic format validation (A001, B12, etc.)
//     const valid = /^[A-Za-z]\d+$/.test(queueInput);
//     if (!valid) {
//       alert("Format must be like A001, B12, etc.");
//       return;
//     }

//     setLoading(true);

//     // Save as LAST queue
//     await setDoc(doc(db, "meta", "last"), {
//       value: queueInput.toUpperCase(),
//     });

//     alert(`Added Queue: ${queueInput.toUpperCase()}`);
//     setQueueInput("");
//     setLoading(false);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen gap-6">
//       <h1 className="text-3xl font-bold">Admin Panel</h1>

//       <input
//         type="text"
//         value={queueInput}
//         onChange={(e) => setQueueInput(e.target.value)}
//         placeholder="Enter Queue (e.g. A001)"
//         className="border p-3 rounded w-64 text-center text-lg"
//       />

//       <button
//         onClick={addManual}
//         disabled={loading}
//         className="bg-green-500 cursor-pointer text-white px-6 py-3 rounded"
//       >
//         Add Queue Number
//       </button>
//     </div>
//   );
// }