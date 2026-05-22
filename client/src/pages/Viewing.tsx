import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

type QueueItem = {
  number: string;
  name: string;
  companyId: string;
  queueType: "loading" | "dispatching";
};

export default function Viewer() {
  const [loadingCurrent, setLoadingCurrent] =
    useState<QueueItem | null>(null);

  const [dispatchCurrent, setDispatchCurrent] =
    useState<QueueItem | null>(null);

  const [time, setTime] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // ================= LOADING =================
  useEffect(() => {
    if (!user?.companyId) return;

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
        "loading"
      ),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setLoadingCurrent(null);
        return;
      }

      setLoadingCurrent(
        snap.docs[0].data() as QueueItem
      );
    });

    return () => unsub();
  }, [user.companyId]);

  // ================= DISPATCH =================
  useEffect(() => {
    if (!user?.companyId) return;

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
        "dispatching"
      ),
      orderBy("order", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setDispatchCurrent(null);
        return;
      }

      setDispatchCurrent(
        snap.docs[0].data() as QueueItem
      );
    });

    return () => unsub();
  }, [user.companyId]);

  // ================= CLOCK =================
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* MAIN */}
      <div className="flex flex-1 flex-col lg:flex-row pb-24">

        {/* LOADING */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r flex flex-col">

          <div className="text-center text-blue-600 font-bold text-3xl md:text-5xl py-8">
            LOADING
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">

            <h1 className="font-bold text-4xl md:text-5xl mb-6">
              Now Serving
            </h1>

            <h2 className="font-bold text-green-600 text-6xl md:text-8xl">
              {loadingCurrent?.number ||
                "--"}
            </h2>

            <p className="mt-6 text-3xl md:text-5xl">
              {loadingCurrent?.name ||
                "Waiting..."}
            </p>

          </div>
        </div>

        {/* DISPATCH */}
        <div className="w-full lg:w-1/2 flex flex-col">

          <div className="text-center text-orange-500 font-bold text-3xl md:text-5xl py-8">
            DISPATCHING
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">

            <h1 className="font-bold text-4xl md:text-5xl mb-6">
              Now Serving
            </h1>

            <h2 className="font-bold text-green-600 text-6xl md:text-8xl">
              {dispatchCurrent?.number ||
                "--"}
            </h2>

            <p className="mt-6 text-3xl md:text-5xl">
              {dispatchCurrent?.name ||
                "Waiting..."}
            </p>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white h-24 px-6">

        <div className="h-full flex items-center justify-between">

          <div className="flex items-center gap-4">

            <img
              src="/rgsoi.png"
              className="h-14 w-14 object-contain"
            />

            <div className="text-lg md:text-2xl font-semibold">
              {user.companyName}
            </div>

          </div>

          <div className="text-2xl md:text-4xl font-bold">
            {time}
          </div>

        </div>
      </div>

    </div>
  );
}

// ================= HOW TO RUN =================
// 1. npm install firebase react-router-dom
// 2. setup firebase config
// 3. npm run dev
// 4. open:
//    /admin   -> add queue
//    /control -> next
//    /view    -> display

// ================= NOTES =================
// - FIFO system (delete first item)
// - No status needed
// - Real-time viewer
// - Works on free Firebase


// import { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { doc, onSnapshot } from "firebase/firestore";

// export default function Viewing() {
//   const [current, setCurrent] = useState<string>("A000");
//   const [time, setTime] = useState<string>("");

//   // 🔥 Firestore listener
//   useEffect(() => {
//     const unsub = onSnapshot(doc(db, "queue", "current"), (snap) => {
//       if (snap.exists()) {
//         setCurrent(snap.data().number);
//       }
//     });

//     return () => unsub();
//   }, []);

//   // ⏰ Real-time clock
// useEffect(() => {
//   const interval = setInterval(() => {
//     const now = new Date();

//     const formatted = now.toLocaleTimeString("en-PH", {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });

//     setTime(formatted);
//   }, 1000);

//   return () => clearInterval(interval);
// }, []);

//   return (
//     <div className="flex h-screen ">

//       {/* LEFT SIDE - QUEUE */}
//       <div className="flex flex-col items-center justify-center w-1/2">
//         <h1 className="text-5xl mb-6 font-bold">Now Serving</h1>

//         <div className="text-9xl font-bold text-green-400">
//           {current}
//         </div>
//       </div>

//       {/* RIGHT SIDE - VIDEO + TIME */}
//       <div className="flex flex-col w-1/2 h-full">

//         {/* 🎬 Video (Top) */}
//         <div className="flex-1">
//           <video
//             className="w-full h-full object-cover"
//             autoPlay
//             muted
//             loop
//           >
//             <source src="rgsoi.mp4" type="video/mp4" />
//           </video>
//         </div>

//         {/* ⏰ Time (Bottom) */}
//         <div className="text-white bg-black/89 text-center py-6">
//           <span className="text-4xl font-bold">{time}</span>
//         </div>

//       </div>

//     </div>
//   );
// }