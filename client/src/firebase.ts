import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBXvQ3MoWuM1EkWIjCgzdDX2OYfwN-2AaY",
  authDomain: "qns-project.firebaseapp.com",
  projectId: "qns-project",
  storageBucket: "qns-project.firebasestorage.app",
  messagingSenderId: "416423011753",
  appId: "1:416423011753:web:3f7520ce2e557ecdd2d0b8",
  measurementId: "G-169JKHX0W6"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyAueQu8BfKUhQ5ki6aSsu1E1e5OXDIG5EM",
//   authDomain: "qnms-a7373.firebaseapp.com",
//   projectId: "qnms-a7373",
//   storageBucket: "qnms-a7373.firebasestorage.app",
//   messagingSenderId: "940738706314",
//   appId: "1:940738706314:web:7a525d5a643035ed866673",
//   measurementId: "G-QF3YRP38QC"
// };


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);