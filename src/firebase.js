import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAZua3OWEWnFnRuAvUKUirNODcrq-yn2nA",
    authDomain: "pay-per-use-c1be9.firebaseapp.com",
    projectId: "pay-per-use-c1be9",
    storageBucket: "pay-per-use-c1be9.appspot.com",
    messagingSenderId: "83118971312",
    appId: "1:83118971312:web:851eb6504e8721fc5e1e75",
    measurementId: "G-ZGJQQQK63F"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig)
const db = firebaseApp.firestore()
const auth = firebase.auth()

export {auth}
export default db