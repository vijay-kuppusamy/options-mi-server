const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyCcL25TpeCAjQjYzIOf-Q2mN_gfR2_wSyQ',
  authDomain: 'options-mi.firebaseapp.com',
  projectId: 'options-mi',
  storageBucket: 'options-mi.appspot.com',
  messagingSenderId: '215981484175',
  appId: '1:215981484175:web:ebc0a2ea4f674d9a3a28fa',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = { auth };
