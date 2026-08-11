# Baget Burger Milas

Baget Burger Milas için geliştirilmiş, mobil öncelikli ve etkileşimli restoran web sitesi.

Proje; klasik bir restoran sayfası yerine markayı güçlü bir görsel hikâyeyle tanıtır. Kullanıcı açılış ekranından burger tepsisine geçer, altı ürünü dönen tepsi üzerinde inceler, son burgerde el animasyonuyla final bölümüne ulaşır ve tam menüyü açabilir.

- Canlı site: [bagetburgermilas.com.tr](https://bagetburgermilas.com.tr/)
- Kaynak kod: [GitHub deposu](https://github.com/nazimardaarbac7-dot/bagetburgermilas)
- İşletme: Baget Burger, Milas / Muğla
- Telefon: [0549 823 20 20](tel:+905498232020)

## Deneyimin akışı

1. **Hero alanı:** Baget Burger markası ve yüzen burgerler gösterilir.
2. **Tepsiye geçiş:** İlk aşağı kaydırma, kontrollü hero–tepsi animasyonunu başlatır.
3. **Burger seçimi:** Kullanıcı tepsiyi kaydırarak altı burger arasında ilerler.
4. **Otomatik merkezleme:** Her hareketten sonra sistem en yakın burgeri merkeze çeker. Ürün bilgileri yalnızca merkezleme tamamlanınca değişir.
5. **Son burger:** “Aşağı Kaydır” yönlendirmesiyle el sahneye girer ve Badılcanlı Burger'i alır.
6. **Made in Milas:** Müşteri yorumları, işletme bilgileri, yol tarifi ve tam menü butonu gösterilir.
7. **Tam menü:** Kategoriler tek bir erişilebilir menü penceresinde listelenir ve Yemeksepeti bağlantısı sunulur.

## Öne çıkan özellikler

- Mobil öncelikli responsive tasarım
- Three.js tabanlı etkileşimli burger tepsisi
- GSAP ve ScrollTrigger ile kontrollü sahne geçişleri
- Kaydırma momentumundan bağımsız otomatik burger merkezleme
- Mobilde sürükleme, masaüstünde kaydırma ve klavye desteği
- Son burger için el ve kaldırma animasyonu
- Burger dokunma/tıklama geri bildirimi
- Telefon siparişlerinde sürekli `%5` indirim duyurusu
- Tam menü penceresi ve Yemeksepeti sipariş bağlantısı
- Google Maps yol tarifi ve müşteri yorumları
- Erişilebilir modal yapısı, odak kilidi ve `Escape` ile kapatma
- SEO dosyaları, sosyal paylaşım görseli ve güvenlik başlıkları

## Mobil grafik kalitesi

Mobil grafik profili cihaz gücüne göre otomatik ayarlanır:

- Uygun cihazlarda render çözünürlüğü en fazla `1.3 DPR` seviyesine çıkarılır ve kenar yumuşatma açılır.
- 2 GB veya daha az bellek bildiren ya da 4 ve daha az işlemci çekirdeğine sahip cihazlarda hafif profil kullanılır.
- Düşük donanım profilinde `1 DPR` ve kapalı kenar yumuşatma ile kaydırma akıcılığı korunur.
- Masaüstü kalite ayarları mobil profilden bağımsızdır.

Bu yaklaşım burger ve tepsi kenarlarını yeni telefonlarda netleştirirken eski cihazlarda gereksiz ısınma ve takılmayı önler.

## Vitrindeki burgerler

| No | Ürün | Fiyat |
|---:|---|---:|
| 01 | Hamburger | 220 TL |
| 02 | Cheeseburger | 230 TL |
| 03 | Tavuk Burger | 210 TL |
| 04 | Köz Burger | 230 TL |
| 05 | Karışık Burger | 330 TL |
| 06 | Badılcanlı Burger | 230 TL |

Ürün adları, içerikleri ve fiyatları `src/data/burgers.js` dosyasından yönetilir. Tam menü verileri ise `src/data/fullMenu.js` içindedir.

> Menü ve fiyat değişiklikleri yayınlanmadan önce işletmenin güncel listesiyle doğrulanmalıdır.

## Kullanılan teknolojiler

- React 19
- Vite 7
- Three.js
- React Three Fiber
- Drei
- GSAP
- GSAP ScrollTrigger
- Node.js yerleşik test çalıştırıcısı
- Cloudflare Workers ve Workers Builds

## Proje yapısı

```text
BagetBurger/
├── public/
│   ├── assets/
│   │   ├── burgers/          # Şeffaf burger görselleri
│   │   └── interaction/      # El, baget ve etkileşim görselleri
│   ├── favicon.svg
│   ├── og.png
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── src/
│   ├── components/           # Navbar, menü, popup ve ürün bilgileri
│   ├── data/                 # Vitrin burgerleri ve tam menü verileri
│   ├── sections/             # Hero, burger vitrini ve Milas bölümü
│   ├── three/                # Three.js sahnesi, tepsi, burger ve kamera
│   ├── utils/                # Scroll hesapları ve modal erişilebilirliği
│   ├── App.jsx               # Ana akış ve animasyon orkestrasyonu
│   ├── index.css             # Mobil ve masaüstü stilleri
│   └── main.jsx              # React giriş noktası
├── test/
│   └── scrollProgress.test.js
├── index.html
├── package.json
├── vite.config.js
├── worker.js                   # HTTPS yönlendirmesi ve statik asset sunumu
└── wrangler.jsonc             # Cloudflare Worker ve dist asset yapılandırması
```

## Önemli dosyalar

| Dosya | Sorumluluk |
|---|---|
| `src/App.jsx` | Hero, tepsi, otomatik merkezleme, final kapısı ve bölüm navigasyonu |
| `src/three/Experience.jsx` | Canvas, ışıklar, cihaz bazlı grafik profili ve sahne yaşam döngüsü |
| `src/three/Tray.jsx` | Tepsi geometrisi, burger dizilimi ve dönüş hareketi |
| `src/three/Burger.jsx` | Burger görselleri, dokunma efekti, el ve baget animasyonları |
| `src/three/CameraRig.jsx` | Hero–tepsi–final kamera hareketleri |
| `src/utils/scrollProgress.js` | Scroll ve sahne ilerleme hesapları |
| `src/components/MenuOverlay.jsx` | Tam menü penceresi ve Yemeksepeti sipariş butonu |
| `src/components/DiscountPopup.jsx` | Telefon siparişi indirim duyurusu |
| `src/index.css` | Tüm responsive yerleşim ve görsel stil |

## Kurulum

Gereksinimler:

- Güncel Node.js LTS
- npm

Projeyi yerel olarak çalıştırmak için:

```bash
npm install
npm run dev
```

Vite terminalde yerel geliştirme adresini gösterir. Aynı ağdaki gerçek bir telefondan test gerekiyorsa geliştirme sunucusu ağ erişimine açılabilir:

```bash
npm run dev -- --host 0.0.0.0
```

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run test` | Scroll ve final geçişi testlerini çalıştırır |
| `npm run build` | Üretim paketini `dist/` klasörüne oluşturur |
| `npm run preview` | Üretim paketini yerel olarak önizler |
| `npm run check` | Testleri ve üretim derlemesini birlikte çalıştırır |

Bir değişiklik yayınlanmadan önce önerilen kontrol:

```bash
npm run check
```

## Test kapsamı

Mevcut otomatik testler şu davranışları doğrular:

- El geçişinin son burger durağında ölü kaydırma bırakmaması
- Elin burgere temas ettikten sonra kaydırmaya hemen tepki vermesi
- Ham scroll ve sahne ilerleme dönüşümlerinin birbiriyle uyumlu olması
- Burger duraklarının tepsi dönüşündeki doğru indekse karşılık gelmesi
- İlerleme değerlerinin güvenli aralıkta kalması

Görsel veya etkileşimsel değişikliklerde ayrıca gerçek telefon ölçüsünde şu akış kontrol edilmelidir:

1. Hero'dan tepsiye geçiş
2. `01`–`06` arasındaki tüm burgerlerin merkezlenmesi
3. Burger bilgisi ile görselin aynı ürünü göstermesi
4. Son burgerden el animasyonuna geçiş
5. Tam menü ve indirim penceresinin açılıp kapanması

## İçerik güncelleme

### Vitrin ürünleri

`src/data/burgers.js` içindeki ilgili nesnede şu alanlar değiştirilir:

- `name`
- `ingredients`
- `price`
- `accent`

Burger sırası tepsideki görsel sırasıyla eşleştiği için nesnelerin dizilim sırası rastgele değiştirilmemelidir.

### Tam menü

`src/data/fullMenu.js` şu bilgileri içerir:

- Menü kategorileri
- Ürün adları
- Açıklamalar
- Fiyatlar
- Yemeksepeti restoran bağlantısı

### Görseller

- Burger kesimleri: `public/assets/burgers/`
- El ve etkileşim varlıkları: `public/assets/interaction/`
- Sosyal paylaşım görseli: `public/og.png`

Burger görsellerinde şeffaf arka planlı WebP tercih edilmelidir. Dosya adı değiştirildiğinde `src/three/Burger.jsx` içindeki yol da güncellenmelidir.

## Tasarım prensipleri

- Birincil öncelik dikey mobil deneyimdir.
- Tepsi hareketi kontrollü olmalı; uzun momentum veya kararsız ara konum üretmemelidir.
- Bilgi paneli yalnızca seçilen burger fiziksel olarak ortalandığında değişmelidir.
- Navbar burger vitrini aktifken gizli kalmalıdır.
- Burger, tepsi ve bilgi metinleri birbirini kapatmamalıdır.
- Koyu petrol yeşili, turuncu ve krem marka paleti korunmalıdır.
- Animasyon eklenirken düşük donanımlı telefonların akıcılığı gözetilmelidir.
- Hareket azaltma tercihi olan kullanıcılar için `prefers-reduced-motion` davranışı korunmalıdır.

## Yayınlama

Site Cloudflare Workers üzerinde yayınlanır. Cloudflare Workers Builds, GitHub deposunun `main` dalını izler ve her push sonrasında üretim build/deploy sürecini otomatik başlatır.

Yayın öncesi temel sıra:

1. `npm run check`
2. Değişiklikleri gözden geçirme
3. `main` dalına gönderme
4. Cloudflare Workers Builds sonucunun başarılı olduğunu doğrulama
5. [bagetburgermilas.com.tr](https://bagetburgermilas.com.tr/) üzerinde yeni asset sürümünü ve mobil akışı kontrol etme

Cloudflare build ayarları:

- Worker adı: `bagetburgermilas`
- Production branch: `main`
- Build komutu: `npm run build`
- Deploy komutu: `npx wrangler deploy`
- Root directory: `/`
- Build çıktısı: `dist/`

`wrangler.jsonc`, Worker giriş dosyasını ve `dist/` altındaki statik asset bağlamasını tanımlar. `worker.js` HTTP isteklerini HTTPS'e yönlendirir ve istekleri statik asset bağlamasına iletir.

## İşletme bilgileri

**Baget Burger**  
İsmet Paşa, Halilbey Blv. No:8/B  
48200 Milas / Muğla  
Her gün 11.00–23.00  
0549 823 20 20

---

Bu README projenin güncel ana tanıtım ve geliştirme dokümanıdır. `PROJECT_HANDOFF.md` ve `devir.md` geçmiş geliştirme dönemlerinden kalan notlar içerebilir; güncel davranış için çalışan kod ve bu dosya esas alınmalıdır.
