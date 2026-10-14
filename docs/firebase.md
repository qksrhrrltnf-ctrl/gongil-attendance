# Firebase 연결

저장소는 `window.AppStore` 하나로 분리되어 있습니다. 화면 코드는 고치지 않고 아래 순서만 따르면 됩니다.

## 1. 호스팅(휴대폰에서 HTTPS로 열기)

```bash
npm i -g firebase-tools
firebase login
firebase init hosting      # public 디렉터리: .  /  SPA 재작성: No  /  index.html 덮어쓰기: No
firebase deploy --only hosting
```

`firebase.json`은 이미 들어 있습니다. 배포 후 받은 `https://<프로젝트>.web.app` 주소를 휴대폰에서 열고 **홈 화면에 추가**하십시오.

## 2. Firestore 동기화

1. Firebase 콘솔 → 프로젝트 설정 → 웹 앱 추가 → config 값을 복사합니다.
2. `js/firebase-config.example.js`를 `js/firebase-config.js`로 복사하고 값을 넣습니다.
3. 콘솔에서 Authentication → Google 로그인을 켭니다.
4. Firestore를 만들고 `firestore.rules`를 배포합니다: `firebase deploy --only firestore:rules`
5. `index.html` 아래쪽의 Firebase 스크립트 주석을 풉니다.

처음 로그인하면 기기에 있던 기록이 Firestore로 한 번 올라가고, 이후에는 양쪽에 함께 저장됩니다.

## 저장 구조

`teachers/{uid}/apps/attendance` 문서 하나에 전체 상태를 둡니다. 51명 × 한 학기 기록은 수십 KB이므로 문서 한도(1MB)에 충분히 들어갑니다. 여러 교사가 쓰게 되거나 기록이 커지면 `sessions`, `records`를 하위 컬렉션으로 나누십시오.

## 다음에 MCP로 연결할 때

Firebase MCP 서버를 연결하면 Claude가 콘솔 작업(프로젝트 생성, 규칙 배포, 데이터 확인)을 대신할 수 있습니다. 그때도 앱 쪽은 이 문서의 2번만 하면 됩니다.
