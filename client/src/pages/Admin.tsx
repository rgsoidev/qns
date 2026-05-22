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

type QueueItem = {
  id?: string;
  name: string;
  number: string;
  queueType: "loading" | "dispatching";
  order: number;
  companyId: string;
  companyName: string;
};

export default function Admin() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [queueType, setQueueType] = useState<
    "loading" | "dispatching"
  >("loading");

  const [loadingQueue, setLoadingQueue] = useState<
    QueueItem[]
  >([]);

  const [dispatchQueue, setDispatchQueue] = useState<
    QueueItem[]
  >([]);

  const [loadingCurrent, setLoadingCurrent] =
    useState<QueueItem | null>(null);

  const [dispatchCurrent, setDispatchCurrent] =
    useState<QueueItem | null>(null);

  const [msg, setMsg] = useState<string>("");

  // ================= ADD QUEUE =================

  const addQueue = async () => {
    if (!name || !number) return;

    if (!user?.companyId) {
      setMsg("No company found");
      return;
    }

    await addDoc(collection(db, "queue"), {
      name,
      number,
      queueType,
      order: Date.now(),
      companyId: user.companyId,
      companyName: user.companyName,
    });

    setName("");
    setNumber("");
    setMsg("Queue added successfully");

    setTimeout(() => setMsg(""), 3000);
  };

  // ================= SPEECH =================

  const playSound = () => {
    return new Promise<void>((resolve) => {
      const audio = new Audio(
        "/announcer1.mp3"
      );

      audio.onended = () => resolve();
      audio.play().catch(resolve);
    });
  };

  const speak = async (
    number: string,
    name: string
  ) => {
    await playSound();

    const synth = window.speechSynthesis;
    synth.cancel();

    const utter =
      new SpeechSynthesisUtterance(
        `Now serving ${number}. ${name}`
      );

    utter.lang = "en-US";
    utter.rate = 1;

    synth.speak(utter);
  };

  // ================= NEXT =================

  const nextQueue = async (
    type: "loading" | "dispatching"
  ) => {
    setMsg("");

    const q = query(
      collection(db, "queue"),
      where(
        "companyId",
        "==",
        user.companyId
      ),
      where(
        "queueType",
        "==",
        type
      ),
      orderBy("order", "asc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      setMsg("No queue available");
      return;
    }

    const first = snap.docs[0];

    const firstData =
      first.data() as QueueItem;

    if (snap.docs.length === 1) {
      speak(
        firstData.number,
        firstData.name
      );
      return;
    }

    await deleteDoc(
      doc(
        db,
        "queue",
        first.id
      )
    );

    const next =
      snap.docs[1].data() as QueueItem;

    speak(
      next.number,
      next.name
    );
  };

  // ================= NOTIFY =================

  const notify = async (
    type: "loading" | "dispatching"
  ) => {
    const q = query(
      collection(db, "queue"),
      where(
        "companyId",
        "==",
        user.companyId
      ),
      where(
        "queueType",
        "==",
        type
      ),
      orderBy("order", "asc")
    );

    const snap = await getDocs(q);

    if (snap.empty) return;

    const current =
      snap.docs[0].data() as QueueItem;

    speak(
      current.number,
      current.name
    );
  };

  // ================= REALTIME =================

  useEffect(() => {
    if (!user?.companyId) return;

    const loadingQ = query(
      collection(db, "queue"),
      where(
        "companyId",
        "==",
        user.companyId
      ),
      where(
        "queueType",
        "==",
        "loading"
      ),
      orderBy("order", "asc")
    );

    const dispatchQ = query(
      collection(db, "queue"),
      where(
        "companyId",
        "==",
        user.companyId
      ),
      where(
        "queueType",
        "==",
        "dispatching"
      ),
      orderBy("order", "asc")
    );

    const unsub1 = onSnapshot(
      loadingQ,
      (snap) => {
        const list =
          snap.docs.map(
            (d) => ({
              id: d.id,
              ...d.data(),
            })
          ) as QueueItem[];

        setLoadingQueue(list);
        setLoadingCurrent(
          list[0] || null
        );
      }
    );

    const unsub2 = onSnapshot(
      dispatchQ,
      (snap) => {
        const list =
          snap.docs.map(
            (d) => ({
              id: d.id,
              ...d.data(),
            })
          ) as QueueItem[];

        setDispatchQueue(list);
        setDispatchCurrent(
          list[0] || null
        );
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user.companyId]);

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
console.log(dispatchCurrent)
  return (
    <div className="grid grid-cols-2 gap-4 p-4">

      {/* LEFT PANEL */}
      <div className="border rounded-xl p-6">

        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {user.companyName}
          </h1>

          <button
            onClick={logout}
            className="text-red-500 border px-3 rounded"
          >
            Logout
          </button>
        </div>

        {/* ADD QUEUE */}
        <div className="flex gap-2 mb-6">

          <input
            className="border p-2"
            placeholder="Number"
            value={number}
            onChange={(e) =>
              setNumber(e.target.value)
            }
          />

          <input
            className="border p-2"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <select
            className="border p-2"
            value={queueType}
            onChange={(e) =>
              setQueueType(
                e.target
                  .value as any
              )
            }
          >
            <option value="loading">
              Loading
            </option>

            <option value="dispatching">
              Dispatching
            </option>
          </select>

          <button
            onClick={addQueue}
            className="bg-blue-500 cursor-pointer text-white px-4"
          >
            Add Queue
          </button>
        </div>

        {/* CONTROLLERS */}
        <div className="mb-6">
          <h2 className="font-bold">
            Loading Controller
          </h2>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() =>
                nextQueue("loading")
              }
              className="bg-green-500 cursor-pointer text-white w-full py-2"
            >
              Next
            </button>

            <button
              onClick={() =>
                notify("loading")
              }
              className="bg-yellow-500 cursor-pointer text-white w-full py-2"
            >
              Notify
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-bold">
            Dispatch Controller
          </h2>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() =>
                nextQueue("dispatching")
              }
              className="bg-green-500 cursor-pointer text-white w-full py-2"
            >
              Next
            </button>

            <button
              onClick={() =>
                notify("dispatching")
              }
              className="bg-yellow-500 cursor-pointer text-white w-full py-2"
            >
              Notify
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {msg && (
          <p className="text-red-500 mt-4">
            {msg}
          </p>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="border rounded-xl p-6">
          <a className="block mb-3 border w-fit p-2 rounded-md" href={import.meta.env.VITE_VIEWING_URL} target="_blank" rel="noopener noreferrer">
            Open Viewing Page
          </a>
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-blue-500 text-white p-4 rounded">
            <h3>LOADING</h3>
            <p className="text-3xl font-bold">
              {loadingCurrent?.number ||
                "--"}
            </p>
            <p>
              {loadingCurrent?.name ||
                "No Queue"}
            </p>
          </div>

          <div className="bg-orange-500 text-white p-4 rounded">
            <h3>DISPATCH</h3>
            <p className="text-3xl font-bold">
              {dispatchCurrent?.number ||
                "--"}
            </p>
            <p>
              {dispatchCurrent?.name ||
                "No Queue"}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div>
            <h2 className="font-bold mb-2">
              Loading Queue
            </h2>

            {loadingQueue.map((q) => (
              <div
                key={q.id}
                className="border p-2 mb-2"
              >
                {q.number} - {q.name}
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-bold mb-2">
              Dispatch Queue
            </h2>

            {dispatchQueue.map((q) => (
              <div
                key={q.id}
                className="border p-2 mb-2"
              >
                {q.number} - {q.name}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import {
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   getDocs,
//   deleteDoc,
//   onSnapshot,
//   doc,
//   where,
// } from "firebase/firestore";
// import { db } from "../firebase";

// export default function Admin() {
//   const [name, setName] = useState("");
//   const [number, setNumber] = useState("");

//   // 🔐 GET USER FROM LOCALSTORAGE
//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   // ADDING QUEUE
//   const addQueue = async () => {
//     if (!name || !number) return;

//     if (!user?.companyId) {
//       alert("No company found. Please login again.");
//       return;
//     }

//     await addDoc(collection(db, "queue"), {
//       name,
//       number,
//       order: Date.now(),

//       companyId: user.companyId,
//       companyName: user.companyName,
//     });

//     setName("");
//     setNumber("");
//   };

//   // TEXT TO SPEECH
//   const playSound = () => {
//     return new Promise<void>((resolve) => {
//       const audio = new Audio("/announcer1.mp3");

//       audio.onended = () => resolve();

//       audio.play().catch(() => resolve());
//     });
//   };

//   const speak = async (number: string, name: string) => {
//     await playSound();

//     const synth = window.speechSynthesis;
//     synth.cancel();

//     const utter = new SpeechSynthesisUtterance(
//       `Now serving ${number}. ${name}`
//     );

//     utter.rate = 1;
//     utter.pitch = 1;
//     utter.lang = "en-US";

//     const voices = synth.getVoices();

//     const femaleVoice =
//       voices.find(
//         (v) =>
//           v.lang.includes("en") &&
//           (v.name.toLowerCase().includes("female") ||
//             v.name.toLowerCase().includes("zira") ||
//             v.name.toLowerCase().includes("samantha"))
//       ) || voices[0];

//     utter.voice = femaleVoice;

//     synth.speak(utter);
//   };

//   const [msg, setMsg] = useState("");

//   // ================= NEXT =================
//   const nextQueue = async () => {
//     setMsg("");

//     const q = query(
//       collection(db, "queue"),
//       where("companyId", "==", user.companyId),
//       orderBy("order", "asc")
//     );

//     const snap = await getDocs(q);

//     if (snap.empty) {
//       setMsg("No queue available");
//       return;
//     }

//     if (snap.docs.length === 1) {
//       const only = snap.docs[0].data() as any;
//       speak(only.number, only.name);
//       setMsg("Last queue no.");
//       return;
//     }

//     const current = snap.docs[0];
//     await deleteDoc(doc(db, "queue", current.id));

//     const next = snap.docs[1].data() as any;
//     speak(next.number, next.name);
//   };

//   //NOTIFY BUTTON
//   const notify = async () => {
//     const q = query(
//       collection(db, "queue"),
//       where("companyId", "==", user.companyId),
//       orderBy("order", "asc")
//     );

//     const snap = await getDocs(q);

//     if (snap.empty) {
//       setMsg("No queue available");
//       return;
//     }

//     const current = snap.docs[0].data() as any;
//     speak(current.number, current.name);
//   };


//   const [queues, setQueues] = useState<any[]>([]);
//   const [current, setCurrent] = useState<any>(null);

//   useEffect(() => {
//     if (!user?.companyId) return;

//     const q = query(
//       collection(db, "queue"),
//       where("companyId", "==", user.companyId),
//       orderBy("order", "asc")
//     );

//     const unsub = onSnapshot(q, (snap) => {
//       const list = snap.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setQueues(list);
//       setCurrent(list.length > 0 ? list[0] : null);
//     });

//     return () => unsub();
//   }, []);
//   const logout = () => {
//     localStorage.removeItem("user");
//     window.location.href = "/login"; // or navigate if gamit react-router
//   };
//   return (
//     <div className="grid grid-cols-2 p-4 gap-4">
//       {/* LEFT SIDE */}
//       <div className="p-6 border border-[#dddd] rounded-2xl">

//         <div className="flex justify-between items-center gap-4">
//           <h1 className="text-3xl font-bold mb-4">
//             Admin Panel ({user.companyName})
//           </h1>
//           <button
//             onClick={logout}
//             className="border border-red-400 text-red-400 px-4 py-1 uppercase cursor-pointer rounded-lg"
//           >
//             Logout
//           </button>
//         </div>
//         {/* ADD QUEUE */}
//         <div className="w-full">
//           <input
//             className="border p-2 mr-2"
//             placeholder="Queue Number (L01)"
//             value={number}
//             onChange={(e) => setNumber(e.target.value)}
//           />

//           <input
//             className="border p-2 mr-2"
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />

//           <button
//             onClick={addQueue}
//             className="bg-blue-500 cursor-pointer text-white px-4 py-2"
//           >
//             Add Queue
//           </button>
//         </div>

//         {/* CONTROLLER */}
//         <div className="mt-6">
//           <h1 className="text-xl font-bold mb-4">
//             Queue Loading Controller
//           </h1>

//           <div className="flex gap-2">
//             <button
//               onClick={nextQueue}
//               className="bg-green-500 w-full cursor-pointer text-white px-4 py-2"
//             >
//               Next
//             </button>

//             <button
//               onClick={notify}
//               className="bg-yellow-500 w-full cursor-pointer text-white px-4 py-2"
//             >
//               Notify
//             </button>
//           </div>

//           {msg && (
//             <p className="text-red-500 mt-3">{msg}</p>
//           )}
//         </div>

//         <div className="mt-6">
//           <h1 className="text-xl font-bold mb-4">
//             Queue Dispatching Controller
//           </h1>

//           <div className="flex gap-2">
//             <button
//               onClick={nextQueue}
//               className="bg-green-500 w-full cursor-pointer text-white px-4 py-2"
//             >
//               Next
//             </button>

//             <button
//               onClick={notify}
//               className="bg-yellow-500 w-full cursor-pointer text-white px-4 py-2"
//             >
//               Notify
//             </button>
//           </div>

//           {msg && (
//             <p className="text-red-500 mt-3">{msg}</p>
//           )}
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div className="p-6 border border-[#dddd] rounded-2xl">
//         <div className="mb-2">
//           <a className="uppercase font-bold" href={import.meta.env.VITE_VIEWING_URL} target="_blank" rel="noopener noreferrer">
//             Open Viewing Page
//           </a>

//         </div>
//         {/* NOW SERVING */}
//         <div className="bg-green-600 text-white p-4 rounded mb-6">
//           <h2 className="text-sm">NOW SERVING</h2>

//           <p className="text-3xl font-bold">
//             {current ? current.number : "--"}
//           </p>

//           <p className="text-lg">
//             {current ? current.name : "No queue"}
//           </p>
//         </div>

//         {/* QUEUE LIST */}
//         <h2 className="text-lg font-semibold mb-2">
//           Queue List
//         </h2>

//         <div className="space-y-2">
//           {queues.length === 0 ? (
//             <p className="text-gray-500">
//               No queue available
//             </p>
//           ) : (
//             queues.map((q, index) => (
//               <div
//                 key={q.id}
//                 className={`p-3 border rounded flex justify-between ${index === 0 ? "bg-yellow-100" : ""
//                   }`}
//               >
//                 <span className="font-bold">
//                   {q.number}
//                 </span>
//                 <span>{q.name}</span>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
