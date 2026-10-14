// Firebase(Firestore) 저장소 — 아직 연결하지 않은 뼈대.
//
// 연결 순서
// 1. Firebase 콘솔에서 웹 앱을 만들고 config 값을 js/firebase-config.js 에 넣는다.
//    (js/firebase-config.example.js 를 복사해 이름을 바꾼다)
// 2. index.html 에서 아래 세 줄의 주석을 푼다.
//      <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
//      <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
//      <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
//      <script src="js/firebase-config.js"></script>
//      <script src="js/firebase-store.js"></script>
// 3. Firestore 보안 규칙은 교사 본인 uid 만 읽고 쓰게 한다(docs/firebase.md 참고).
//
// 문서 구조: teachers/{uid}/apps/attendance  ← state 전체를 문서 하나에 둔다.
// 학생 51명 × 한 학기 기록은 수십 KB 수준이라 문서 1MB 한도에 충분히 들어간다.

(function () {
  if (!window.firebase || !window.FIREBASE_CONFIG) return; // 설정이 없으면 LocalStore 그대로 사용

  firebase.initializeApp(window.FIREBASE_CONFIG);
  const auth = firebase.auth();
  const db = firebase.firestore();
  db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); // 오프라인 캐시

  const local = window.AppStore; // 오프라인 백업용으로 함께 저장

  async function user() {
    if (auth.currentUser) return auth.currentUser;
    const provider = new firebase.auth.GoogleAuthProvider();
    const res = await auth.signInWithPopup(provider);
    return res.user;
  }

  function ref(uid) {
    return db.collection('teachers').doc(uid).collection('apps').doc('attendance');
  }

  window.AppStore = {
    kind: 'firebase',
    label: 'Firebase 동기화',

    async load() {
      const u = await user();
      const snap = await ref(u.uid).get();
      if (snap.exists) return snap.data();
      const s = await local.load(); // 기기에 있던 기록을 처음 한 번 올린다
      await ref(u.uid).set(s);
      return s;
    },

    async save(state) {
      await local.save(state);
      const u = await user();
      await ref(u.uid).set(state);
    },

    async reset() {
      const s = window.seedState();
      await this.save(s);
      return s;
    },
  };
})();
