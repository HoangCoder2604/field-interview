# Field Interview PWA — Clean Architecture

Bản refactor của ứng dụng điều tra hiện trường PWA.

## Điểm đã cải thiện

- Module hóa JavaScript:
  - `data/`: IndexedDB
  - `services/`: camera/image, GPS, notification, storage, sync, service worker
  - `ui/`: form, history, settings, navigation, toast, network
  - `utils/`: ngày giờ, escape HTML, session ID
- CSS tách thành:
  - `base.css`
  - `components.css`
  - `responsive.css`
- Responsive cho:
  - mobile <= 640px
  - tablet <= 900px
  - desktop >= 1100px
  - màn hình rất nhỏ <= 380px
- Có hỗ trợ `safe-area` cho điện thoại có notch.
- Có `prefers-reduced-motion` cho accessibility.
- History hỗ trợ click + bàn phím Enter/Space.
- Vẫn giữ nguyên:
  - IndexedDB offline
  - Service Worker cache
  - GPS
- Nút `Xem trên Google Maps` trong chi tiết phiên khi có tọa độ GPS
  - camera
  - nén ảnh
  - lịch sử
  - notification
  - Google Apps Script + Google Sheet + Google Drive
  - tự đồng bộ khi online
  - nút đồng bộ thủ công

## Cấu trúc

```text
field-interview-pwa-clean/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README_SETUP.md
│
├── styles/
│   ├── main.css
│   ├── base.css
│   ├── components.css
│   └── responsive.css
│
├── src/
│   ├── app.js
│   ├── data/
│   │   └── database.js
│   ├── services/
│   │   ├── image.js
│   │   ├── location.js
│   │   ├── notifications.js
│   │   ├── service-worker.js
│   │   ├── storage.js
│   │   └── sync.js
│   ├── ui/
│   │   ├── dom.js
│   │   ├── form.js
│   │   ├── history.js
│   │   ├── navigation.js
│   │   ├── network.js
│   │   ├── settings.js
│   │   └── toast.js
│   └── utils/
│       ├── date.js
│       ├── html.js
│       └── id.js
│
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
│
└── google-apps-script/
    └── Code.gs
```

## Chạy local

Không mở trực tiếp bằng `file://` vì Service Worker cần HTTP/HTTPS.

### Cách 1 — VS Code Live Server

Mở thư mục và chọn **Open with Live Server**.

### Cách 2

```bash
npx serve .
```

## Google Sheet

1. Tạo Google Sheet.
2. Extensions > Apps Script.
3. Dán `google-apps-script/Code.gs`.
4. Deploy > New deployment > Web app.
5. Execute as: Me.
6. Chọn quyền truy cập phù hợp cho demo.
7. Copy URL `/exec`.
8. Mở PWA > Cài đặt > dán URL > Lưu cấu hình.

## Test offline

1. Mở app online ít nhất một lần.
2. Cho phép GPS/camera/notification nếu cần.
3. Tắt mạng.
4. Tạo một phiên.
5. Kiểm tra Lịch sử: `Chờ đồng bộ`.
6. Bật mạng lại.
7. App tự sync khi nhận event `online`.
8. Kiểm tra Sheet và Drive.

## Lưu ý

Background Sync API không được hỗ trợ đồng đều trên mọi trình duyệt. Vì vậy app vẫn có fallback:
- sync khi app mở và có mạng,
- sync khi mạng quay lại,
- nút `Đồng bộ ngay`.

## Deploy Vercel

Project đã có `vercel.json` và script build riêng cho Vercel.

### Test build local

```bash
npm run build
npx serve dist
```

### Vercel settings

Khi import GitHub repository vào Vercel:

- Framework Preset: `Other`
- Root Directory: thư mục chứa `index.html`, `package.json`, `vercel.json`
- Build Command: để Vercel đọc từ `vercel.json` (`npm run build`)
- Output Directory: để Vercel đọc từ `vercel.json` (`dist`)

Không đặt Root Directory thành `src`, `styles`, hoặc `dist`.
