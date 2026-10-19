# Field Interview — PWA + Capacitor Android

Bản refactor của ứng dụng điều tra hiện trường PWA.

Ứng dụng đồng thời chạy dưới dạng website/PWA và ứng dụng Android thông qua
[Capacitor](https://capacitorjs.com/). Mã giao diện và nghiệp vụ được dùng chung
cho cả hai nền tảng.

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
- Theo dõi mạng bằng Capacitor Network trên Android và sự kiện online/offline trên PWA.
- Thông báo hoàn tất đồng bộ bằng Capacitor Local Notifications trên Android và
  Web Notification trên PWA.
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
├── capacitor.config.json
├── android/                 # Native Android project do Capacitor quản lý
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

## Chạy ứng dụng Android bằng Capacitor

Yêu cầu: Node.js, Android Studio và Android SDK đã được cài đặt.

```bash
npm install
npm run android
```

Lệnh trên build nội dung web vào `dist/`, đồng bộ sang project Android và mở
Android Studio. Chọn emulator hoặc điện thoại đã bật USB debugging rồi nhấn
**Run**.

Nếu Android Studio đã mở và bạn chỉ vừa thay đổi mã web, chạy:

```bash
npm run cap:sync
```

Không chỉnh sửa trực tiếp nội dung trong `android/app/src/main/assets/public` vì
thư mục này được tạo lại từ `dist/` mỗi lần chạy `cap sync`.

## Google Sheet

Project đã có sẵn Google Apps Script Web App URL mặc định để bản PWA và Android
có thể đồng bộ ngay trên thiết bị mới. Người dùng vẫn có thể nhập endpoint khác
trong **Cài đặt**; để trống hoặc nhập lại URL mặc định sẽ quay về cấu hình chung.

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

### Kiểm tra GPS khi không có Wi-Fi

1. Mở ứng dụng khi có mạng lần đầu để PWA lưu bộ nhớ đệm, sau đó tắt Wi-Fi **và dữ liệu di động**.
2. Bật chức năng **Vị trí** của điện thoại và cấp quyền vị trí cho ứng dụng/trình duyệt.
3. Kiểm tra nhãn **Offline**, chọn **Lấy vị trí**. Thiết bị có GPS có thể cần 30 giây hoặc lâu hơn để có tín hiệu ngoài trời.
4. Dòng **GPS mới** là tọa độ vừa lấy được. Nếu GPS thất bại, ứng dụng chỉ dùng vị trí gần nhất trong vòng 15 phút, đồng thời hiển thị rõ đó là **vị trí đã lưu** (không phải tọa độ hiện tại).
5. Trên desktop hoặc thiết bị không có bộ thu GPS, API định vị của trình duyệt có thể phụ thuộc Wi-Fi/mạng, nên không bảo đảm có tọa độ mới khi offline.

Với **APK Android**, chạy `npm install` và `npm run cap:sync` để bổ sung plugin `@capacitor/geolocation` vào bản build native. Bản PWA chạy trên trình duyệt vẫn dùng Geolocation API có sẵn.

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
