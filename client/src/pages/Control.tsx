import { useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";


// 🔊 SPEECH (NUMBER FIRST)
const playSound = () => {
  return new Promise<void>((resolve) => {
    const audio = new Audio("/announcer1.mp3");
    
    audio.onended = () => {
      resolve(); // after sound saka magsasalita
    };

    audio.play().catch(() => {
      resolve(); // fallback kung di magplay
    });
  });
};


const speak = async (number: string, name: string) => {
  await playSound(); // 🔊 play muna sound

  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(
    `Now serving ${number}. ${name}`
  );

  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = "en-US";

  // 🎯 try to pick female voice
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
}

export default function Control() {
  const [msg, setMsg] = useState("");

  // 👉 NEXT
  const nextQueue = async () => {
    setMsg("");

    const q = query(collection(db, "queue"), orderBy("order", "asc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      setMsg("No queue available");
      return;
    }

    // last queue
    if (snap.docs.length === 1) {
      const only = snap.docs[0].data() as any;
      speak(only.number, only.name);
      setMsg("Last queue no.");
      return;
    }

    // delete current
    const current = snap.docs[0];
    await deleteDoc(doc(db, "queue", current.id));

    // speak next
    const next = snap.docs[1].data() as any;
    speak(next.number, next.name);
  };

  // 👉 NOTIFY (current only)
  const notify = async () => {
    const q = query(collection(db, "queue"), orderBy("order", "asc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      setMsg("No queue available");
      return;
    }

    const current = snap.docs[0].data() as any;
    speak(current.number, current.name);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Control Page</h1>

      <button
        onClick={nextQueue}
        className="bg-green-500 cursor-pointer text-white px-4 py-2 mr-2"
      >
        Next
      </button>

      <button
        onClick={notify}
        className="bg-yellow-500 cursor-pointer text-white px-4 py-2"
      >
        Notify
      </button>

      {msg && <p className="text-red-500 mt-3">{msg}</p>}
    </div>
  );
}

// import { db } from "../firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";

// export default function Control() {
// const playSound = () => {
//   return new Promise<void>((resolve) => {
//     const audio = new Audio("/announcer1.mp3");
    
//     audio.onended = () => {
//       resolve(); // after sound saka magsasalita
//     };

//     audio.play().catch(() => {
//       resolve(); // fallback kung di magplay
//     });
//   });
// };

// const speak = async (text: string) => {
//   await playSound(); // 🔊 play muna sound

//   const utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = "en-US";
//   utterance.rate = 1;
//   utterance.pitch = 1;

//   window.speechSynthesis.speak(utterance);
// };

//  const nextQueue = async () => {
//   const currentRef = doc(db, "queue", "current");
//   const lastRef = doc(db, "meta", "last");

//   const currentSnap = await getDoc(currentRef);
//   const lastSnap = await getDoc(lastRef);

//   if (!currentSnap.exists() || !lastSnap.exists()) return;

//   const current = currentSnap.data().number;
//   const last = lastSnap.data().value;
// console.log(current,last)
//   if (current === last) {
//     alert("No more queue");
//     return;
//   }

//   const currentNum = parseInt(current.slice(1));
//   const nextNum = currentNum 

//   await updateDoc(currentRef, { number: nextNum });

//   // 🔊 ADD THIS (sound + speech)
//   const message = `Loading servings ${nextNum}`;
//   speak(message);

//   // optional alert
//   alert(`Now Serving ${nextNum}`);
// };

//   // 🔊 NEW: Notify ONLY (no update)
//   const notify = async () => {
//     const currentRef = doc(db, "queue", "current");
//     const snap = await getDoc(currentRef);

//     if (!snap.exists()) return;

//     const current = snap.data().number;

//     const message = `Now serving ${current}`;
//     speak(message);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center w-full h-screen gap-6">
//       <h1 className="text-3xl font-bold">Queue Control</h1>

//      <div className="grid grid-cols-2 gap-2">
//        {/* NEXT BUTTON */}
//       <button
//         onClick={nextQueue}
//         className="bg-blue-500 text-white w-40 px-8 py-5 rounded cursor-pointer"
//       >
//         Next
//       </button>

//       {/* NOTIFY BUTTON */}
//       <button
//         onClick={notify}
//         className="bg-green-500 text-white w-40 px-8 py-5 rounded cursor-pointer"
//       >
//         Notify 🔊
//       </button>
//      </div>
//     </div>
//   );
// }