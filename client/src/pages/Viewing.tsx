import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import Player from "../layouts/Player";

export default function Viewer() {
  const [current, setCurrent] = useState<any>(null);
  const [time, setTime] = useState('')
  
   const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );
  useEffect(() => {
     const q = query(
      collection(db, "queue"),
      where("companyId", "==", user.companyId),
      orderBy("order", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setCurrent(null);
        return;
      }

      setCurrent(snap.docs[0].data());
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const formatted = now.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="flex h-screen ">

        {/* LEFT SIDE - QUEUE */}
        <div className="flex flex-col font-bold items-center justify-center w-1/2">
          <h1 className="text-5xl mb-4">NOW SERVING</h1>

          <h2 className="text-7xl text-green-600 font-bold">
            {current ? current.number : "--"}
          </h2>

          <p className="text-5xl mt-4">
            {current ? current.name : "Waiting..."}
          </p>
        </div>


        <div className="flex flex-col w-1/2 h-full">

          {/* 🎬 Video (Top) */}
          <div className="h-full bg-black">
            <Player />
          </div>

          {/* ⏰ Time (Bottom) */}
          <div className="absolute bottom-0 left-0 right-0 text-white bg-yellow-300 text-center">
            <div className="flex justify-center items-center gap-4">
              <div className="h-20 w-20 ">
                <img className="w-full h-full" src="/rgsoi.png" alt="" />
              </div>
              <div className="text-4xl font-bold w-full text-left">{time}</div>
            </div>
          </div>

        </div>

      </div>

    </>
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