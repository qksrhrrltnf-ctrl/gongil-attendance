// 저장소 계층.
// 앱(app.js)은 window.AppStore 의 load / save / reset 세 가지만 쓴다.
// Firebase 로 옮길 때는 js/firebase-store.js 처럼 같은 모양의 객체를 만들어
// window.AppStore 를 바꿔 끼우면 된다. 화면 코드는 고칠 필요가 없다.
//
// 상태(state) 모양
// {
//   version: 1,
//   sections:  [{ id, name }],
//   students:  [{ id, studentNo, name, sectionId, active }],
//   bells:     [{ period, start, end }],
//   timetable: { '1-3': 's1' }            // '요일(1=월)-교시' → 분반 id
//   sessions:  { 's1|2026-10-14|3': { sectionId, date, period, memo, createdAt } },
//   records:   { 's1|2026-10-14|3': { '39901': { type, reason, note, updatedAt } } },
//   updatedAt: ISO 문자열
// }
// records 에는 '출석'이 아닌 학생만 들어간다. 세션은 있는데 기록이 없으면 출석이다.

(function () {
  const KEY = 'gongil-attendance:v1';

  function seedState() {
    return {
      version: 1,
      sections: structuredClone(window.SEED_SECTIONS),
      students: structuredClone(window.SEED_STUDENTS),
      bells: structuredClone(window.SEED_BELLS),
      timetable: {},
      sessions: {},
      records: {},
      updatedAt: new Date().toISOString(),
    };
  }

  const LocalStore = {
    kind: 'local',
    label: '이 기기에 저장',

    async load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('저장된 데이터를 읽지 못했습니다.', e);
      }
      const s = seedState();
      await this.save(s);
      return s;
    },

    async save(state) {
      state.updatedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(state));
    },

    async reset() {
      localStorage.removeItem(KEY);
      return this.load();
    },
  };

  window.seedState = seedState;
  window.AppStore = LocalStore;
})();
