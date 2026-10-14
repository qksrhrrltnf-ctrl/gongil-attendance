# 공학 일반 출석부 — 이미지 생성 프롬프트

`index.html` · `js/app.js` · `css/style.css` · `manifest.webmanifest` · `assets/icon.svg` · `design(cnm).md` 를 기준으로 이미지 슬롯을 추출했습니다.
코드에 있는 슬롯은 9개(UI 5개, 아이콘 4개)이고, 코드에 아직 없는 추가 제안이 2개입니다.

## 슬롯 요약

| 번호 | 파일명 (`assets/img/`) | 화면 | 표시 크기 | 우선순위 |
|---|---|---|---|---|
| 1 | header-mascot.png | 모든 화면 상단 바(브랜드 옆) | 48×48px | 1 |
| 2 | icon-192.png / icon-512.png / icon-maskable-512.png / apple-touch-icon.png | 홈 화면 아이콘, 앱 전환기, 스플래시 | 기기마다 다름(약 48~192px) | 2 |
| 3 | all-present.png | 출석부 → 세션 바, 전원 출석일 때만 | 34×34px | 3 |
| 4 | export-hero.png | 내보내기 화면 상단 히어로 카드 | 88×88px | 4 |
| 5 | stats-empty.png | 통계 화면, 기록한 수업이 0개일 때 | 120×120px | 5 |
| 6 | empty-roster.png | 출석부, 선택한 분반에 학생이 없을 때 | 120×120px | 6 |
| A | og-image.png (추가 제안) | 링크 공유 미리보기 | 1200×630px | 추가 |
| B | apple-splash-1179x2556.png (추가 제안) | iOS 홈 화면 실행 시 스플래시 | 전체 화면 | 추가 |

> 참고: 파비콘은 `assets/icon.svg`(주황 체크 스티커)가 이미 있어 슬롯으로 세지 않았습니다. 아이콘 PNG를 만든 뒤 같은 그림으로 SVG를 바꾸면 세트가 맞습니다.
> 모든 UI 슬롯은 파일이 없으면 `data-fallback` 이모지(주황 원)로 대체됩니다(`js/app.js` `wireSlots`).

## 공통 스타일 블록

모든 프롬프트 앞에 아래 블록이 붙어 있습니다. 세트 전체가 같은 손맛으로 보이게 하는 기준입니다.

- 바탕 크림 `#F1EBDE`, 종이 `#FFFCF4`, 잉크 `#151515`, 보조 잉크 `#55504A`
- 강조 주황 `#FF9F43`, 노랑 `#FFD84D`, 코랄 `#FF7A7A`, 빨강 `#E5484D`, 파랑 `#7DB2FF`
- 굵은 잉크 외곽선(2.5px 감각), 오른쪽 아래로 떨어지는 단단한 오프셋 그림자(블러 없음), 둥근 모서리, 하프톤 도트 음영
- "스티커 워크북" 느낌, 플랫 레트로 일러스트, 그라데이션·광택·3D 렌더 없음

```
STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
```

공통 네거티브(각 슬롯 네거티브에 이미 포함되어 있습니다):

```
text, letters, numbers, Korean characters, watermark, signature, logo, brand, realistic face, photo, photorealistic, 3D render, glossy, gradient, soft blurred shadow, neon, cluttered background
```

---

## 코드에 있는 슬롯

### 1. header-mascot.png
- 쓰이는 곳: 모든 화면 상단 바 왼쪽, 앱 제목 "공학 일반 출석부" 옆. 하프톤 무늬가 깔린 종이색(#FFFCF4) 카드 위. 48×48px(`.slot-mascot`)
- 생성 크기·비율: 1024×1024, 1:1 → 최종 저장 크기: 192×192 PNG(48px의 4배, 레티나 대비)
- 배경: 투명
- 상징: 공학 수업의 마스코트. 대체 이모지 ⚙️ — 톱니바퀴 캐릭터
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: a single cute gear mascot character, orange #FF9F43 gear body with 8 chunky rounded teeth, a simple round cream face in the center with two dot eyes and a small smile, a tiny yellow #FFD84D safety helmet on top, extremely simple bold silhouette that stays readable at 48 pixels, very few details, sticker style with a thick outline around the whole shape, isolated on a plain transparent background.
- 네거티브 프롬프트(EN): text, letters, numbers, Korean characters, watermark, logo, brand, realistic face, nose, teeth, eyebrows, photo, 3D render, glossy, gradient, soft blurred shadow, thin lines, fine detail, multiple characters, background scene
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: a small boxy robot head mascot with a gear-shaped antenna, sky blue #7DB2FF head, orange gear on top, two dot eyes, minimal shapes readable at 48 pixels, isolated sticker on transparent background.
  2. (STYLE 블록 동일) SUBJECT: two interlocking gears, one big orange #FF9F43 and one small yellow #FFD84D, the big gear has two dot eyes and a smile, bold simple silhouette readable at 48 pixels, isolated sticker on transparent background.
- 후처리: 배경 제거 후 피사체가 캔버스의 약 85%를 차지하도록 여백을 맞춥니다. 오프셋 그림자가 잘리지 않게 오른쪽·아래쪽 여백을 조금 더 둡니다. 192×192로 줄인 뒤 48px로 미리 보며 실루엣이 뭉개지지 않는지 확인하십시오.

### 2. 앱 아이콘 세트 — icon-192.png · icon-512.png · icon-maskable-512.png · apple-touch-icon.png
- 쓰이는 곳: `manifest.webmanifest` icons(192, 512, maskable 512), `index.html` `<link rel="apple-touch-icon">`. 홈 화면 아이콘, 앱 전환기, 안드로이드 스플래시. 실제 표시 약 48~192px
- 생성 크기·비율: 1024×1024, 1:1 (한 원본에서 4개를 만듭니다) → 최종 저장 크기: 192×192 / 512×512 / 512×512(maskable) / 180×180 PNG
- 배경: 크림 #F1EBDE 단색으로 꽉 채움(아이콘은 투명 배경을 쓰지 않습니다)
- 상징: "공학 수업 출석 체크". 현재 임시 `icon.svg`의 주황 체크 스티커를 계승하고 톱니바퀴를 더합니다
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: app icon, full-bleed solid cream #F1EBDE square background, in the center a rounded-square orange #FF9F43 sticker tile with a thick black outline and a hard black offset shadow to the bottom-right, on the tile a bold thick black check mark whose short stroke ends in a small gear shape, one simple centered symbol, all important content kept inside the central 60 percent of the canvas, flat, readable at small sizes.
- 네거티브 프롬프트(EN): text, letters, numbers, Korean characters, watermark, logo, brand, photo, 3D render, glossy, gradient, soft blurred shadow, transparent background, rounded outer corners on the canvas, vignette, border frame at the canvas edge, multiple symbols, tiny details
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: app icon, full-bleed cream #F1EBDE background, a large orange #FF9F43 gear with a thick black outline and hard offset shadow, inside the gear hole a bold black check mark, centered within the central 60 percent, flat.
  2. (STYLE 블록 동일) SUBJECT: app icon, full-bleed cream #F1EBDE background, a sky blue #7DB2FF clipboard sticker with a black outline and hard offset shadow, a bold orange #FF9F43 check mark on the paper, a small yellow gear clip at the top, centered within the central 60 percent, flat.
- 후처리:
  - 원본 1024를 그대로 기준으로 삼습니다. 바깥 모서리는 둥글리지 않습니다(OS가 마스크를 씌웁니다).
  - icon-512.png: 512×512로 리사이즈. icon-192.png: 192×192로 리사이즈 후 선이 너무 가늘면 원본에서 외곽선을 한 번 두껍게 해서 다시 줄입니다.
  - icon-maskable-512.png: 핵심 그림이 중앙 지름 80%(약 410px) 원 안에 들어가야 합니다. 필요하면 그림을 75~80%로 축소하고 가장자리를 크림 #F1EBDE로 채운 뒤 maskable.app 등으로 확인하십시오.
  - apple-touch-icon.png: 180×180, 투명 픽셀 없이 크림 배경으로 채웁니다.

### 3. all-present.png
- 쓰이는 곳: 출석부 화면 세션 바의 상태 알약(출석 n, 지각 n …) 맨 앞. 결석·지각 등이 하나도 없어 "전원 출석"일 때만 나타납니다. 34×34px(`.slot-badge`), alt "전원 출석"
- 생성 크기·비율: 1024×1024, 1:1 → 최종 저장 크기: 136×136 PNG(34px의 4배)
- 배경: 투명
- 상징: 전원 출석 축하 배지. 대체 이모지 🎉
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: a tiny celebration badge, a round sunny yellow #FFD84D medal shaped like a gear with chunky teeth, a bold black check mark in the middle, three short orange #FF9F43 burst lines around it, extremely simple silhouette that must stay readable at 34 pixels, very thick outlines, no small details, isolated sticker on transparent background.
- 네거티브 프롬프트(EN): text, letters, numbers, Korean characters, watermark, logo, ribbon text, confetti swarm, fine detail, thin lines, many small pieces, photo, 3D render, glossy, gradient, soft blurred shadow, background scene
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: a small orange #FF9F43 party popper cone with a black outline, three chunky yellow and blue shapes bursting out, minimal pieces, readable at 34 pixels, isolated sticker on transparent background.
  2. (STYLE 블록 동일) SUBJECT: a round orange #FF9F43 sticker star with five rounded points and a bold black check mark in the center, readable at 34 pixels, isolated sticker on transparent background.
- 후처리: 배경 제거, 피사체가 캔버스의 약 90%를 채우게 여백을 줄입니다(아주 작게 보이므로 여백은 최소). 136×136으로 저장 후 34px에서 체크 표시가 보이는지 확인하십시오. 하프톤은 이 크기에서 지저분해지므로 지워도 됩니다.

### 4. export-hero.png
- 쓰이는 곳: 내보내기 화면 맨 위 히어로 카드(하프톤 무늬 종이 카드) 왼쪽, 제목 "기록 내보내기" 옆. 88×88px(`.slot-hero`)
- 생성 크기·비율: 1024×1024, 1:1 → 최종 저장 크기: 352×352 PNG(88px의 4배)
- 배경: 투명
- 상징: 출석 기록을 표(CSV) 파일로 꺼내 보내기. 대체 이모지 📤
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: an open sky blue #7DB2FF tray box with a black outline, a warm paper #FFFCF4 spreadsheet sheet rising out of it showing a blank grid of cells with a few cells filled orange and yellow, a bold orange #FF9F43 upward arrow beside the sheet, a small gear in the corner of the box, simple shapes readable at 88 pixels, isolated sticker on transparent background.
- 네거티브 프롬프트(EN): text, letters, numbers, Korean characters, spreadsheet logo, Excel logo, brand, watermark, photo, 3D render, glossy, gradient, soft blurred shadow, cluttered, tiny cell contents, background scene
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: a small robot arm in orange #FF9F43 holding up a paper #FFFCF4 grid sheet, a blue arrow pointing out to the right, readable at 88 pixels, isolated sticker on transparent background.
  2. (STYLE 블록 동일) SUBJECT: a blueprint-blue #7DB2FF folder with a grid sheet sliding out and an orange #FF9F43 upward arrow on the folder tab, readable at 88 pixels, isolated sticker on transparent background.
- 후처리: 배경 제거, 피사체 약 85%로 여백을 맞추고 그림자 쪽(오른쪽 아래)에 여유를 둡니다. 352×352로 리사이즈합니다. 표 칸 안에 글자나 숫자가 생겼다면 지우십시오.

### 5. stats-empty.png
- 쓰이는 곳: 통계 화면 표 영역. 아직 기록한 수업이 0개일 때 "아직 기록한 수업이 없습니다" 문구 위. 120×120px(`.slot-empty`), 가운데 정렬
- 생성 크기·비율: 1024×1024, 1:1 → 최종 저장 크기: 480×480 PNG(120px의 4배)
- 배경: 투명
- 상징: 비어 있지만 곧 채워질 통계. 대체 이모지 📊
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: a blank blueprint board in sky blue #7DB2FF with a black outline and faint grid lines, three empty bar chart outlines drawn with dashed black lines waiting to be filled, a small orange #FF9F43 pencil and a yellow #FFD84D ruler leaning against the board, calm and hopeful empty-state mood, simple shapes, isolated sticker on transparent background.
- 네거티브 프롬프트(EN): text, letters, numbers, axis labels, Korean characters, watermark, logo, brand, photo, 3D render, glossy, gradient, soft blurred shadow, sad mood, error symbol, cluttered, background scene
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: a friendly small robot holding a paper #FFFCF4 sheet with three empty dashed bars, a tiny orange gear floating beside it, faceless robot with simple dot eyes, isolated sticker on transparent background.
  2. (STYLE 블록 동일) SUBJECT: an empty bar chart where bars are shaped like stacked gears, only the first short orange #FF9F43 bar is filled and the rest are dashed outlines, isolated sticker on transparent background.
- 후처리: 배경 제거, 피사체 약 80%로 여백을 맞춥니다. 480×480으로 리사이즈합니다. 6번(empty-roster.png)과 나란히 놓아 선 굵기·그림자 거리가 같은지 맞춰 보십시오.

### 6. empty-roster.png
- 쓰이는 곳: 출석부 화면 학생 카드 그리드. 선택한 분반에 학생이 한 명도 없을 때 "이 분반에 학생이 없습니다" 문구 위. 120×120px(`.slot-empty`)
- 생성 크기·비율: 1024×1024, 1:1 → 최종 저장 크기: 480×480 PNG(120px의 4배)
- 배경: 투명
- 상징: 비어 있는 명렬표, 학생을 추가하라는 안내. 대체 이모지 🧑‍🎓
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: an empty workshop workbench seen from the front, three empty round stools in paper #FFFCF4 with black outlines, a yellow #FFD84D hard hat resting on one stool, an orange #FF9F43 wrench on the bench, a small blank name card with a plus sign, inviting and waiting mood, no people, simple shapes, isolated sticker on transparent background.
- 네거티브 프롬프트(EN): text, letters, numbers, Korean characters, names, watermark, school logo, brand, real people, faces, photo, 3D render, glossy, gradient, soft blurred shadow, sad mood, cluttered, background scene
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: a simple faceless student character silhouette in sky blue #7DB2FF wearing a yellow #FFD84D hard hat, drawn with dashed outline as if not yet added, a bold orange #FF9F43 plus badge next to it, isolated sticker on transparent background.
  2. (STYLE 블록 동일) SUBJECT: a paper #FFFCF4 clipboard roster with empty rounded rows, an orange #FF9F43 plus button sticker in the corner, a small gear clip at the top, isolated sticker on transparent background.
- 후처리: 배경 제거, 피사체 약 80%로 여백을 맞추고 480×480으로 리사이즈합니다. 5번과 선 굵기·그림자 거리를 통일하십시오.

---

## 추가 제안 (코드에 아직 없음)

아래 둘은 지금 코드가 참조하지 않습니다. 넣으려면 `index.html` `<head>`에 태그를 추가해야 합니다.

### A. og-image.png
- 쓰이는 곳: 메신저·카카오톡 등에 앱 주소를 보낼 때 나오는 미리보기 카드. 추가할 태그: `<meta property="og:image" content="assets/img/og-image.png">` (절대 URL 권장)
- 생성 크기·비율: 1536×806 근처, 약 1.91:1 → 최종 저장 크기: 1200×630 PNG
- 배경: 크림 #F1EBDE 단색 + 가장자리 하프톤
- 상징: 공학 수업 출석부 앱 전체 분위기. 앱 이름은 이미지에 넣지 않고 OG 제목이 담당합니다
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: wide banner composition on a solid cream #F1EBDE background with halftone dots fading in from the corners, in the center a large orange #FF9F43 rounded-square check mark sticker (same as the app icon), surrounded by smaller stickers: a yellow gear, a blue wrench, a paper grid sheet, a tiny robot arm, a circuit board chip, stickers arranged loosely like a workbook page, generous empty space, no text.
- 네거티브 프롬프트(EN): text, letters, numbers, Korean characters, title, watermark, logo, brand, real people, faces, photo, 3D render, glossy, gradient, soft blurred shadow, crowded layout
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: wide banner, cream background, a row of six rounded student-card stickers in paper, orange, yellow and blue (matching attendance status colors), each card blank with only a small dot, a big gear sticker on the right, no text.
  2. (STYLE 블록 동일) SUBJECT: wide banner, cream background, a blueprint sheet in sky blue #7DB2FF lying diagonally with a big orange check mark sticker stuck on it, a wrench and pencil beside it, no text.
- 후처리: 1200×630으로 크롭·리사이즈합니다. 플랫폼이 가장자리를 자르므로 핵심 그림을 중앙 1000×520 안에 둡니다.

### B. apple-splash-1179x2556.png
- 쓰이는 곳: iPhone 홈 화면에서 앱을 열 때 잠깐 보이는 시작 화면. 추가할 태그: `<link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="assets/img/apple-splash-1179x2556.png">` (기종마다 한 장씩 필요)
- 생성 크기·비율: 1024×2220 근처, 약 9:19.5 → 최종 저장 크기: 1179×2556 PNG(iPhone 15/16 기준)
- 배경: 크림 #F1EBDE 단색
- 상징: 앱 아이콘이 가운데 놓인 차분한 시작 화면
- 프롬프트(EN):
  STYLE: retro sticker-workbook illustration, flat colors only, thick uniform black ink outlines (#151515), hard offset drop shadow in solid #151515 shifted down-right with no blur, rounded friendly shapes, subtle halftone dot shading in #151515, limited palette: cream #F1EBDE, warm paper #FFFCF4, orange #FF9F43, sunny yellow #FFD84D, coral #FF7A7A, red #E5484D, sky blue #7DB2FF, engineering-class motifs (gears, wrenches, circuits, blueprints), 1970s-80s print feel, clean vector look, centered composition, no text.
  SUBJECT: tall portrait splash screen, solid cream #F1EBDE background, a single orange #FF9F43 rounded-square check mark sticker with a small gear at the end of the check, placed exactly in the vertical center, about 25 percent of the width, very faint halftone dots at the bottom edge, lots of empty space, no text.
- 네거티브 프롬프트(EN): text, letters, numbers, Korean characters, watermark, logo, brand, photo, 3D render, glossy, gradient, soft blurred shadow, busy pattern, multiple objects
- 변형 2가지(EN):
  1. (STYLE 블록 동일) SUBJECT: tall portrait splash, cream background, the app icon sticker in the center and three tiny gears orbiting it loosely, lots of empty space, no text.
  2. (STYLE 블록 동일) SUBJECT: tall portrait splash, cream background, the app icon sticker in the center sitting on a thin blueprint-blue horizontal line like a workbench edge, no text.
- 후처리: 2번 아이콘 원본을 그대로 가운데에 붙여 직접 만드는 편이 더 정확합니다. 상단 노치·하단 홈 바 영역(위아래 각 약 150px)에는 그림을 두지 마십시오.

---

## 생성 후 넣는 방법

1. 위 파일명 그대로 `assets/img/` 폴더에 넣으십시오. 폴더가 없으면 새로 만드십시오.
2. 파일이 있으면 대체 이모지 대신 이미지가 자동으로 표시되므로 코드를 고칠 필요가 없습니다(추가 제안 A·B만 `index.html` 태그 추가가 필요합니다).
3. 아이콘을 바꾼 뒤에는 `sw.js` 캐시 버전을 올리고 홈 화면 앱을 다시 설치해야 새 아이콘이 반영됩니다.
