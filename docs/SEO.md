# SEO — Tài liệu cho TimTruong

Tài liệu này dành cho người chưa rành SEO: giải thích kiến thức nền, ghi lại những gì đã
triển khai trong codebase, việc cần làm trong tương lai, các hướng mở rộng, và **quy trình
chuẩn khi thêm một page mới** để page đó được SEO tốt.

> Bối cảnh kỹ thuật: `client/` là **SPA** (React 19 + Vite + TanStack Router), deploy lên
> **Cloudflare Workers**. Domain: `https://timtruong.app`. Brand hiển thị: **"TimTruong"**
> (tách khỏi domain để sau này đổi `.net`/`.com` không phải sửa chữ brand).

---

## 1. Kiến thức nền cần hiểu

### 1.1 SEO là gì, vận hành ra sao
SEO (Search Engine Optimization) = tối ưu để máy tìm kiếm (Google, Bing…) **hiểu** và **xếp
hạng** trang của bạn cao hơn cho các truy vấn liên quan. Đây là cuộc chơi **dài hạn** (vài
tuần–vài tháng mới thấy kết quả), tích luỹ dần.

Vòng đời: **Crawl** (bot tải trang) → **Index** (lưu vào chỉ mục) → **Rank** (xếp hạng khi có
người tìm). Nếu trang không crawl/index được thì không thể xuất hiện trên kết quả tìm kiếm.

### 1.2 Vì sao SPA khó SEO (điểm mấu chốt của dự án này)
SPA trả về HTML gần như rỗng (`<div id="root">`), nội dung do JavaScript dựng sau:
- **Googlebot** có chạy JS → vẫn đọc được nội dung + thẻ meta dựng bằng React. Với riêng
  Google, site cơ bản ổn.
- **Crawler KHÔNG chạy JS** (Facebook, Zalo, Twitter/X, một phần Bing) chỉ đọc HTML tĩnh ban
  đầu. Khi share link, chúng chỉ thấy thẻ meta **mặc định** trong `index.html`.
  → Đây là lý do cần **Worker inject meta** (mục 2.5) cho các trang động quan trọng.

### 1.3 Các yếu tố on-page quan trọng
- **`<title>`** — yếu tố mạnh nhất. ~50–60 ký tự, chứa từ khoá chính + brand.
- **`<meta name="description">`** — KHÔNG phải yếu tố xếp hạng, nhưng là đoạn mô tả hiển thị
  trên Google → ảnh hưởng **tỉ lệ click (CTR)**. ~150–160 ký tự, viết tự nhiên, có từ khoá.
- **`<h1>`** — đúng **một** `<h1>`/trang, chứa từ khoá; `<h2>/<h3>` cho cấu trúc phụ.
- **Nội dung hiển thị thật** — từ khoá phải xuất hiện tự nhiên trong nội dung, không nhồi nhét.
- **URL** — ngắn, dễ đọc, chứa từ khoá (vd `/danh-sach-truong/dai-hoc-khoa-hoc-tu-nhien-hcmus`
  tốt hơn `/danh-sach-truong/1`). **Đổi URL sau khi đã index rất tốn kém** (phải 301 redirect).
- **`rel="canonical"`** — chỉ định URL "chính chủ" của một nội dung, tránh trùng lặp.

> ⚠️ **`<meta name="keywords">` đã CHẾT** — Google bỏ dùng từ ~2009, nhồi từ khoá vào đó vô
> ích, thậm chí bị xem là tín hiệu spam. Đừng dùng. Từ khoá thuộc về title/description/h1/nội dung.

### 1.4 Open Graph & Twitter Card (cho mạng xã hội)
Khi share link lên Facebook/Zalo/X, chúng đọc thẻ `og:*` / `twitter:*` để render preview
(tiêu đề, mô tả, ảnh). Không liên quan trực tiếp ranking Google, nhưng quyết định link share
"đẹp hay xấu" → ảnh hưởng lượng click. Ảnh share chuẩn: **1200×630px**.

### 1.5 Structured data (JSON-LD / schema.org)
Đoạn dữ liệu có cấu trúc giúp Google **hiểu** trang nói về thực thể gì (tổ chức, trường học,
bài viết…), có thể mở khoá **rich result** (kết quả hiển thị giàu thông tin). Dùng định dạng
**JSON-LD** đặt trong `<script type="application/ld+json">`.

### 1.6 robots.txt & sitemap.xml
- **`robots.txt`** — chỉ dẫn crawler được/không được cào gì; trỏ tới sitemap.
- **`sitemap.xml`** — danh sách mọi URL muốn được index, giúp Google phát hiện trang nhanh & đủ.
- **`<meta name="robots" content="noindex">`** — yêu cầu **không index** trang này (dùng khi
  site chưa hoàn thiện, hoặc cho trang lỗi/tiện ích).

### 1.7 Công cụ đo lường (KHÔNG phải yếu tố xếp hạng)
- **Google Search Console (GSC)** — xem Google index site bạn thế nào, submit sitemap, báo lỗi.
- **Bing Webmaster Tools** — tương tự cho Bing (và một số AI search tham chiếu chỉ mục Bing).
- **Meta Sharing Debugger** — xem/refresh cache preview khi share lên Facebook. Chạy lại sau
  mỗi lần đổi thẻ OG để Facebook cập nhật.
- **Google Rich Results Test / PageSpeed Insights** — kiểm tra JSON-LD và Core Web Vitals.

Đăng ký các công cụ này **không** làm tăng/giảm thứ hạng; chúng chỉ là "đồng hồ đo" và công cụ
chẩn đoán. Lưu ý: chúng cũng không **ép** Google index.

### 1.8 Core Web Vitals (hiệu năng)
Google dùng trải nghiệm tải trang làm tín hiệu xếp hạng: LCP (tốc độ hiển thị nội dung chính),
CLS (độ ổn định layout), INP (độ phản hồi). Ảnh nên có `width/height` + `loading="lazy"`.

---

## 2. Những gì ĐÃ làm trong codebase

| # | Hạng mục | Vị trí |
|---|----------|--------|
| 2.1 | Meta mặc định + `lang="vi"` + `noindex` tạm thời | `client/index.html` |
| 2.2 | Component `PageMetadata` (title/description/OG/canonical per-page) | `client/src/components/PageMetadata.tsx` |
| 2.3 | Component `JsonLd` (structured data) | `client/src/components/JsonLd.tsx` |
| 2.4 | `robots.txt` + sinh `sitemap.xml` lúc build | `client/public/robots.txt`, `client/scripts/generate-sitemap.ts` |
| 2.5 | Worker inject OG cho trang chi tiết (crawler không-JS) | `client/worker/index.ts`, `client/wrangler.jsonc` |
| 2.6 | URL slug thân thiện SEO (thay ID số) | `data/slugify.py`, `server/.../Utils/SlugGenerator.cs`, endpoint `by-slug` |
| 2.7 | Brand "TimTruong" tách khỏi domain | toàn bộ điểm trên |

### 2.1 `index.html` — nền meta tĩnh
Mọi crawler (kể cả không-JS) đều thấy. Chứa: `lang="vi"`, title + description giàu từ khoá,
OG/Twitter mặc định, canonical, `theme-color`, và **`<meta name="robots" content="noindex,
follow">`** (đang chặn index vì site còn sơ khai).

### 2.2 `PageMetadata`
Tận dụng cơ chế React 19 tự **hoist** `<title>/<meta>/<link>` lên `<head>`. Mỗi page render
component này để ghi đè meta cho riêng nó. Tự suy canonical/og:url **tuyệt đối** từ domain, ảnh
OG mặc định, và có prop `noindex` (đã dùng cho trang 404/Error).

### 2.3 `JsonLd`
Render `<script type="application/ld+json">`. Đã gắn: `Organization` + `WebSite` (trang chủ),
`CollegeOrUniversity` (trang chi tiết trường).

### 2.4 robots.txt + sitemap
- `robots.txt` đang `Disallow: /` (giai đoạn hoàn thiện). **Đổi sang Allow + dòng `Sitemap:`
  khi launch.**
- `scripts/generate-sitemap.ts` chạy trong `bun run build`, gọi API liệt kê trường (dùng slug),
  ghi `public/sitemap.xml`. **Fail-soft**: nếu API không truy cập được thì chỉ ghi route tĩnh.

### 2.5 Worker inject meta (Phase social)
`worker/index.ts` dùng `HTMLRewriter`: với request `/danh-sach-truong/{slug}`, fetch dữ liệu
trường từ API rồi ghi đè `<title>` + `og:*`/`twitter:*` trong shell HTML → Facebook/Zalo hiển
thị đúng tên trường + ảnh. Cần đặt `API_BASE_URL` trong `wrangler.jsonc`.

### 2.6 URL slug
Trang chi tiết dùng slug (`dai-hoc-khoa-hoc-tu-nhien-hcmus`) thay ID. Slug sinh ở ETL
(`data/slugify.py`) và backend (`SlugGenerator.cs`) — **hai bản phải đồng bộ thuật toán**. Tra
cứu qua endpoint `GET /api/v1/universities/by-slug/{slug}`.

---

## 3. Những gì CẦN làm (việc còn lại / tồn đọng)

### 3.1 Bắt buộc để các tính năng trên hoạt động đầy đủ
- [ ] **Tạo ảnh share** `client/public/og-image.png` (1200×630) — hiện đang trỏ tới file chưa có.
- [ ] **Đặt `API_BASE_URL`** thật trong `client/wrangler.jsonc` (đang là placeholder
      `https://api.timtruong.app`).
- [ ] **Chạy migration + ETL** để dữ liệu có `Slug`: `dotnet ef database update`, rồi
      `cd data && uv run etl_universities.py`. (Nếu `Slug` NULL, link trường không resolve.)

### 3.2 Checklist khi LAUNCH (bật index)
- [ ] Gỡ `<meta name="robots" content="noindex, follow">` trong `index.html`.
- [ ] Đổi `public/robots.txt` sang:
      ```
      User-agent: *
      Allow: /
      Sitemap: https://timtruong.app/sitemap.xml
      ```
- [ ] Submit `sitemap.xml` trong **Google Search Console** + **Bing Webmaster Tools**.
- [ ] Chạy **Meta Sharing Debugger** cho vài URL để Facebook cache preview mới.

### 3.3 On-page cần bổ sung
- [ ] **Thêm `<h1>`** ngữ nghĩa cho mỗi page (trang chủ hiện dùng chữ động, chưa có `<h1>`).
      Có thể dùng `sr-only` nếu không muốn ảnh hưởng layout.
- [ ] **Title/description riêng & giàu từ khoá** cho `/tim-kiem`, `/to-hop-mon`,
      `/danh-sach-truong` (rà soát lại từng `PageMetadata`).
- [ ] Ảnh logo trường: thêm `width/height` + `loading="lazy"` (Core Web Vitals).

### 3.4 Đo lường
- [ ] Sau launch, theo dõi GSC: Coverage (trang nào được index), từ khoá, lỗi.
- [ ] Cân nhắc analytics: **Cloudflare Web Analytics** (gọn, không cookie) hoặc GA4.

---

## 4. Các hướng mở rộng (nên cân nhắc về sau)

- **Blog nội dung (`client-blog/` — Astro):** Astro render **tĩnh (SSG)** → SEO rất tốt. Viết
  bài kiểu "Cách chọn ngành theo tổ hợp môn", "Điểm chuẩn ĐH … các năm" để hút organic traffic
  cho các truy vấn thông tin. Đây thường là kênh SEO mạnh nhất cho loại site này.
- **JSON-LD nâng cao:**
  - `BreadcrumbList` cho điều hướng (Trang chủ › Danh sách trường › Tên trường).
  - `ItemList` cho trang danh sách trường.
  - `FAQPage` nếu có mục hỏi-đáp.
- **Mở rộng meta động qua Worker:** hiện chỉ inject cho trang chi tiết trường; có thể mở rộng
  cho các trang động khác nếu chúng trở nên quan trọng khi share.
- **Local SEO:** dữ liệu tập trung TP.HCM → nhấn mạnh địa danh trong title/nội dung; cân nhắc
  schema `Place`/`address` cho campus.
- **Nếu cần SEO mạnh hơn cho nội dung động:** cân nhắc prerender/SSG (vd TanStack Start) — nhưng
  đây là thay đổi kiến trúc lớn, chỉ làm khi thực sự cần.
- **Internal linking:** liên kết chéo giữa các trang (trường ↔ ngành ↔ tổ hợp môn) giúp Google
  hiểu cấu trúc & phân bổ "uy tín" trang.

---

## 5. ⭐ Quy trình chuẩn KHI THÊM PAGE MỚI

Mỗi khi tạo một page mới, làm theo các bước sau để page đó SEO tốt ngay từ đầu.

### Bước 1 — Tạo route
Thêm file vào `client/src/routes/` (TanStack Router tự sinh `routeTree.gen.ts`, **đừng sửa tay**).
URL nên ngắn, có dấu gạch nối, chứa từ khoá; nếu là trang chi tiết theo dữ liệu thì **dùng slug**,
không dùng ID số.

### Bước 2 — Gắn `PageMetadata` (BẮT BUỘC)
Đặt `<PageMetadata>` ở đầu page. Nó tự lo title (tự nối brand "TimTruong"), OG, Twitter,
canonical tuyệt đối, ảnh mặc định.

```tsx
import PageMetadata from "@/components/PageMetadata";

const SubjectCombinationsPage = () => (
  <>
    <PageMetadata
      title="Tổ hợp môn xét tuyển đại học"        // ~50–60 ký tự; brand tự nối → "... - TimTruong"
      description="Tra cứu các tổ hợp môn xét tuyển đại học (A00, A01, D01...) và ngành tương ứng." // ~150–160 ký tự
      // image="https://..."   // tuỳ chọn: ảnh share riêng; bỏ trống dùng og-image.png mặc định
      // noindex                // BẬT cho trang tiện ích/không muốn index (404, trang lỗi, trang nội bộ)
    />
    <h1>Tổ hợp môn xét tuyển đại học</h1>
    {/* ... nội dung ... */}
  </>
);
```

**Quy tắc viết:**
- `title`: chứa **1 từ khoá chính**, đừng nhồi nhét. Không cần ghi "TimTruong" (đã tự nối).
- `description`: 1–2 câu tự nhiên, có từ khoá, mô tả đúng nội dung trang.
- `image`: chỉ truyền khi có ảnh đại diện riêng cho trang; nếu không, để mặc định.
- `noindex`: bật cho trang **không nên** lên Google (lỗi, kết quả rỗng, trang quản trị…).

### Bước 3 — Đúng MỘT `<h1>`
Mỗi page có đúng một `<h1>` chứa từ khoá. Tiêu đề phụ dùng `<h2>/<h3>`.

### Bước 4 — Thêm `JsonLd` nếu page đại diện một "thực thể"
Trang mô tả tổ chức/trường/bài viết/danh sách → thêm structured data:

```tsx
import JsonLd from "@/components/JsonLd";

<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",   // hoặc Article, ItemList, BreadcrumbList...
    name: university.name,
    url: `https://timtruong.app/danh-sach-truong/${slug}`,
  }}
/>
```
Render có điều kiện sau khi dữ liệu đã tải (`{data && <JsonLd ... />}`).

### Bước 5 — Đưa vào sitemap
- Trang **tĩnh** công khai: thêm path vào mảng `STATIC_PATHS` trong
  `client/scripts/generate-sitemap.ts`.
- Trang **động** (theo dữ liệu): bổ sung logic liệt kê URL trong `fetchUniversityPaths` (hoặc
  hàm tương tự) để sinh đủ URL.

### Bước 6 — Cân nhắc Worker inject meta (chỉ khi page động + hay được share)
Nếu page động và quan trọng khi chia sẻ mạng xã hội, thêm nhánh xử lý route trong
`client/worker/index.ts` để inject OG (giống `/danh-sach-truong/{slug}`). Trang thường (Google
tự đọc qua JS) thì **không cần**.

### Bước 7 — Kiểm thử
1. `cd client && bun run build` → kiểm tra build pass, `sitemap.xml` có URL mới.
2. `bun run preview` → View Source xem `<title>`/meta/canonical đúng; có `<h1>`.
3. Dán URL vào **Google Rich Results Test** (kiểm JSON-LD) và **Meta Sharing Debugger** (preview share).

### Checklist nhanh
- [ ] URL sạch, có từ khoá (slug nếu là trang chi tiết)
- [ ] `<PageMetadata>` với title + description giàu từ khoá
- [ ] Đúng 1 `<h1>`
- [ ] `<JsonLd>` nếu là trang thực thể
- [ ] Đã thêm vào sitemap (nếu công khai)
- [ ] `noindex` nếu là trang không nên index
- [ ] Build pass + kiểm tra View Source

---

## 6. Tham chiếu nhanh (file & lệnh)

| Mục đích | File / Lệnh |
|---|---|
| Meta tĩnh mặc định | `client/index.html` |
| Meta per-page | `client/src/components/PageMetadata.tsx` |
| Structured data | `client/src/components/JsonLd.tsx` |
| robots.txt | `client/public/robots.txt` |
| Sinh sitemap | `client/scripts/generate-sitemap.ts` (chạy trong `bun run build`) |
| Worker inject OG | `client/worker/index.ts`, `client/wrangler.jsonc` |
| Slug (data) | `data/slugify.py` |
| Slug (server) | `server/TimTruong.ApiService/Utils/SlugGenerator.cs` |
| Build client | `cd client && bun run build` |
| Chạy thử Worker | `cd client && bun run preview` |
| ETL backfill slug | `cd data && uv run etl_universities.py` |
