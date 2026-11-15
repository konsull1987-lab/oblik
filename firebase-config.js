// Ключі Firebase-проєкту (публічні, захист — у правилах Firestore)
export const firebaseConfig = {
  apiKey: "AIzaSyA8O4RBFkIF0gn2EYfScq_wrez8bge49J8",
  authDomain: "oblik-instrumentu.firebaseapp.com",
  projectId: "oblik-instrumentu",
  storageBucket: "oblik-instrumentu.firebasestorage.app",
  messagingSenderId: "833599431959",
  appId: "1:833599431959:web:ccc8e6621b678952188352"
};
// Доступ задається правилами Firestore у консолі Firebase
export const ALLOWED = [];
// Ключ сайту reCAPTCHA v3 для App Check (публічний; потрібен для розпізнавання фото)
export const RECAPTCHA_KEY = "6Lf3kSAuAAAAALkdn1RBve1QGP_UzjlrytNO2TGt";

// Ці пошти працюють у демо-режимі: можуть редагувати, але нічого не записується в базу
export const DEMO_EMAILS = ["esmik7686@gmail.com"];
