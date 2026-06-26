// ═══════════════════════════════════════════════════════════
//  FIREBASE — Configuración del proyecto Compliance Pro
// ═══════════════════════════════════════════════════════════

const firebaseConfig = {
    apiKey:            "AIzaSyCb2pko11_UOP6V5VPQV_xARWrC5wybQ6w",
    authDomain:        "compliancepro--o--sistemass.firebaseapp.com",
    databaseURL:       "https://compliancepro--o--sistemass-default-rtdb.firebaseio.com",
    projectId:         "compliancepro--o--sistemass",
    storageBucket:     "compliancepro--o--sistemass.firebasestorage.app",
    messagingSenderId: "188559834704",
    appId:             "1:188559834704:web:73f1b088e9dcda16ab9b55"
};

firebase.initializeApp(firebaseConfig);

window.db = firebase.database();
