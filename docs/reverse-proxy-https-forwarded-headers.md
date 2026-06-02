# Reverse Proxy, HTTPS & Forwarded Headers

Tài liệu này giải thích vì sao Scalar báo lỗi **Mixed Content**, vì sao cùng đoạn code đó trước đây deploy ở VPS lại "ổn".

> TL;DR — App ASP.NET Core nằm **sau** một proxy terminate TLS (Cloudflare + Caddy).
> Nó nhận request nội bộ dạng `http`, nên tự khai báo `servers: http://...` trong
> tài liệu OpenAPI. Trang Scalar chạy `https` → trình duyệt chặn request `http`
> (Mixed Content). Cách sửa: cho Caddy gửi `X-Forwarded-Proto: https` và cho app
> **tin** header đó (`UseForwardedHeaders` + `KnownIPNetworks`) để nó biết scheme
> gốc là `https`.

---

## 1. Topology thực tế

Đây là đường đi của một request tới `https://api.timtruong.app` trong homelab hiện tại:

```
                         (1) HTTPS                  (2) Cloudflare Tunnel
   Browser  ───────────────────────►  Cloudflare edge  ─────────────────►  cloudflared
 (Scalar UI)                          (TLS terminate ở đây)                 (systemd trên host)
                                                                                  │
                                                                  (3) HTTP localhost:80
                                                                                  ▼
                                                                          ┌──────────────┐
                                                                          │  Caddy       │  container, publish 80/443
                                                                          │ (reverse     │
                                                                          │  proxy)      │
                                                                          └──────┬───────┘
                                                       (4) HTTP, network "internal" (172.x)
                                                           + header X-Forwarded-Proto: https
                                                                                  ▼
                                                                          ┌──────────────┐
                                                                          │ timtruong-api│  container, KHÔNG publish port
                                                                          │  (Kestrel    │  → chỉ Caddy gọi được
                                                                          │   :8080)     │
                                                                          └──────────────┘
```

Cấu hình tương ứng (đã rút gọn):

**`/etc/cloudflared/config.yml`** (đây là file systemd thực sự dùng):
```yaml
ingress:
  - hostname: api.timtruong.app
    service: http://localhost:80      # → trỏ vào Caddy
  - service: http_status:404
```

**`/home/longhuynhdev/homelab/Caddyfile`**:
```caddyfile
# TLS do Cloudflare Tunnel xử lý, Caddy chỉ nhận HTTP
http://api.timtruong.app {
    reverse_proxy timtruong-api:8080 {
        header_up X-Forwarded-Proto https   # ◄ mấu chốt: báo cho app scheme gốc
    }
}
```

**`/home/longhuynhdev/homelab/docker-compose.yml`**: `caddy` publish `80/443`
ra host; `timtruong-api` **không** publish port nào, chỉ nằm trên network `internal`
nên duy nhất Caddy gọi được.

---

## 2. Các khái niệm

### Reverse proxy
Một server đứng trước app, nhận request từ client rồi chuyển tiếp xuống app, và trả
response ngược lại. App không nói chuyện trực tiếp với internet. Ở đây Caddy là reverse
proxy.

### TLS termination (điểm "mở khoá" HTTPS)
HTTPS = HTTP + TLS (mã hoá). Ở đâu đó trên đường đi, lớp mã hoá phải được "mở" để xử
lý request dạng HTTP thuần. Điểm đó gọi là **TLS termination**.

- Trong setup này TLS được terminate tại **Cloudflare edge**. Từ Cloudflare trở vào
  (qua tunnel → cloudflared → Caddy → app) tất cả đều là **HTTP thuần**.
- Vì vậy app **không bao giờ** thấy "https" ở tầng kết nối — nó luôn thấy `http`.

### Cloudflare Tunnel (`cloudflared`)
Một tiến trình chạy trên host, **mở kết nối ra ngoài** tới Cloudflare (outbound). Nhờ
đó Cloudflare đẩy request về máy bạn mà **không cần mở port nào trên router/firewall**,
cũng không cần public IP. Đây là lý do homelab ở MiniPC (IP private) vẫn phục vụ được
internet.

### Caddy
Reverse proxy + web server. Trong setup này Caddy **không** lo TLS (Cloudflare đã lo),
nó chỉ:
1. Nhận HTTP từ cloudflared,
2. Định tuyến theo hostname tới đúng container,
3. **Thêm header `X-Forwarded-Proto: https`** để báo cho app biết "ngoài kia client
   vào bằng https".

### `X-Forwarded-*` headers
Khi đứng sau proxy, app mất thông tin gốc của client (IP, scheme, host). Theo quy ước,
proxy gắn lại các header này:
- `X-Forwarded-Proto`: scheme gốc (`https`)
- `X-Forwarded-For`: IP gốc của client
- `X-Forwarded-Host`: host gốc

App phải **chủ động đọc** các header này thì mới biết được bối cảnh gốc.

---

## 3. Vì sao lỗi Mixed Content xảy ra

Chuỗi nhân–quả:

1. App nằm sau TLS termination → `HttpContext.Request.Scheme == "http"`.
2. `Microsoft.AspNetCore.OpenApi` **tự sinh** trường `servers` trong tài liệu OpenAPI
   dựa trên scheme + host của request. Vì scheme là `http`, nó sinh ra:
   ```json
   "servers": [ { "url": "http://api.timtruong.app/" } ]
   ```
3. Trang Scalar được nạp qua **HTTPS** (`https://api.timtruong.app/scalar/...`). Khi
   bấm **Send**, Scalar dùng URL trong `servers` → gọi tới `http://...`.
4. Trình duyệt thấy trang `https` lại đi gọi tài nguyên `http` → vi phạm chính sách
   **Mixed Content** → **chặn**.

Đó là lý do paste thẳng `http://api.timtruong.app/...` vào thanh địa chỉ thì chạy (cả
trang là http, không có xung đột), còn bấm Send trong Scalar (trang https) thì bị chặn.

---

## 4. Cách sửa & vì sao phải làm vậy

Cần hai vế:

### Vế 1 — Proxy phải GỬI scheme gốc
Caddy đã làm, qua dòng `header_up X-Forwarded-Proto https` trong `Caddyfile`.

### Vế 2 — App phải TIN và ĐỌC header đó
Mặc định ASP.NET Core **không** tin `X-Forwarded-*` (vì client có thể giả mạo). Phải
bật Forwarded Headers Middleware.

**Cách đang dùng (đơn giản nhất):** một biến môi trường trong `docker-compose.yml`,
service `timtruong-api`:
```yaml
environment:
  ASPNETCORE_FORWARDEDHEADERS_ENABLED: "true"
```
Biến này tự bật middleware với `XForwardedFor | XForwardedProto` và xoá danh sách
proxy tin cậy (tin mọi nguồn). Không cần code trong `Program.cs`. An toàn ở đây vì
container `timtruong-api` **không publish port** → chỉ Caddy trong network nội bộ gọi
được, không có nguồn lạ nào để giả mạo header.

**Phương án thay thế (defense-in-depth, an toàn cả khi lỡ expose port):** bỏ env var,
thay bằng code trong `Program.cs` chỉ tin dải IP private:

```csharp
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor
        | ForwardedHeaders.XForwardedProto
        | ForwardedHeaders.XForwardedHost
};
forwardedHeadersOptions.KnownIPNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
string[] trustedNetworks =
[
    "127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12",   // loopback + RFC1918 (phủ Docker bridge)
    "192.168.0.0/16", "::1/128", "fc00::/7",
];
foreach (var network in trustedNetworks)
{
    forwardedHeadersOptions.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(network));
}
app.UseForwardedHeaders(forwardedHeadersOptions);   // phải đặt SỚM, trước UseCors/endpoints
```

**Vì sao cần khai báo dải tin cậy (KnownIPNetworks)?** Middleware chỉ áp dụng
`X-Forwarded-*` nếu request đến từ proxy **tin cậy**. Mặc định danh sách chỉ có
loopback; Caddy gọi app qua Docker network với IP `172.x` → không phải loopback → mặc
định header bị **bỏ qua** → app vẫn thấy `http`. Đó là lý do phải hoặc khai báo dải
private, hoặc dùng env var (vốn xoá sạch danh sách).

> So sánh hai cách: env var = 0 dòng code, tin mọi nguồn (dựa vào cô lập network);
> code `KnownIPNetworks` = chỉ tin dải private, an toàn cả khi lỡ expose port. Xem
> thêm mục 7.

> Thứ tự middleware quan trọng: forwarded headers phải chạy **trước** mọi thứ phụ thuộc
> vào scheme/host (CORS, sinh OpenAPI, endpoints). Env var tự chèn middleware ở đầu
> pipeline nên không cần lo thứ tự.
