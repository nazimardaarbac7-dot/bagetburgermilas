# Baget Burger Milas — Güncel Devir Notu

Bu dosya yeni Codex/ChatGPT context'i için ana devir kaynağıdır.

> `PROJECT_HANDOFF.md` eskidir, güncel durumu yansıtmaz ve karakter kodlaması bozuktur. Yeni çalışmada bu dosya (`devir.md`) esas alınmalıdır.

## 1. Projenin güncel durumu

- Proje: Baget Burger Milas için premium, mobil öncelikli restoran sitesi
- Teknoloji: React 19, Vite 7, Three.js, React Three Fiber, Drei, GSAP / ScrollTrigger
- Aktif dal: `main`
- GitHub: `https://github.com/nazimardaarbac7-dot/bagetburgermilas`
- Canlı adres: `https://baget-burger-milas.vercel.app`
- Son onaylanan commit: `3d79189 Fine tune tray entrance speed`
- Devir dosyası oluşturulmadan önce çalışma ağacı temizdi.

Temel komutlar:

```bash
npm install
npm run dev
npm run build
```

Yerel mobil testlerde genellikle `127.0.0.1:4201` kullanıldı.

## 2. Kullanıcının kesin tasarım yaklaşımı

Öncelik mobil görünümdür.

Site şu hissi vermelidir:

- sakin,
- premium,
- kararlı,
- kontrollü,
- profesyonel,
- görüntü kalitesinden taviz vermeyen.

Kullanıcı hızlı, ani veya kaydırma hızına göre değişen geçişleri amatör buluyor. Yeni animasyonlarda mümkün olduğunca şu model korunmalı:

1. Kullanıcı girdisi yalnızca bir komut/tetikleyicidir.
2. Animasyon sabit süreli ve sabit eğrilidir.
3. Kaydırma hızı, mesafesi veya momentum animasyon hızını değiştirmez.
4. Animasyon çalışırken ek girdiler kararsız ara durum üretmez.
5. Görsel katmanlar doğru sırayla gelir; boş ekran veya aniden yetişen obje olmamalıdır.

## 3. Şu an kesinlikle korunması gereken hero → tepsi geçişi

Kullanıcı son hâlini açıkça beğendi ve “tam istediğim gibi” dedi. Yeni context bu kısmı sebepsiz yere yeniden ayarlamamalıdır.

### Dijital girdi

- Hero ekranındaki ilk aşağı yönlü `wheel` veya parmak hareketi sabit animasyonu başlatır.
- İlk girdide doğal sayfa kaydırması engellenir.
- Geçiş sırasında gelen devam momentumu da engellenir.
- Animasyon başlamadan önce `scrollY` mikro miktarda bile ilerlemez.
- ScrollTrigger yalnızca yedek tetikleyici olarak kalır.

İlgili kod `src/App.jsx` içindeki:

- `handleHeroWheel`
- `handleHeroTouchStart`
- `handleHeroTouchMove`
- `preventHeroMomentum`
- `beginHeroTransition`

Canlı testte 8 piksellik küçük girişte ve ardından çok büyük kaydırma momentumunda `scrollY` geçiş süresince `0` kaldı.

### Onaylanan süreler

`src/App.jsx` içindeki güncel değerler:

```js
const HERO_TRANSITION_DURATION = 2.35
const HERO_COPY_EXIT_DURATION = 1.16
const TRAY_ENTRY_START = 1.08
const TRAY_ENTRY_DURATION = 1.46
const TRAY_INFO_REVEAL_PROGRESS = 0.72
```

Anlamları:

- Hero yazısı ve dağılan hero burgerleri kendi 2,35 saniyelik çizgisinde ilerler.
- Tepsi, animasyonun 1,08. saniyesinde görünür biçimde girişe başlar.
- Tepsinin ekrana gelip yerleşmesi 1,46 saniye sürer.
- Toplam hero → tepsi sekansı yaklaşık 2,54 saniyede tamamlanır.
- Burger bilgileri tepsi büyük ölçüde yerleştikten sonra görünür.
- Tepsi etkileşimi tüm sekans tamamlanmadan açılmaz.

### Tepsinin görünür giriş ayarları

`src/three/Tray.jsx` içinde tepsi artık çok küçük ve çok uzaktan başlamaz:

- giriş scale: mobil `0.72`, masaüstü `0.68`
- giriş Y: mobil `-4.3`, masaüstü `-5.2`
- yerleşmiş Y: mobil `-0.48`, masaüstü `-0.95`
- giriş eğrisi App tarafında `sine.inOut`
- Tray ve CameraRig ikinci kez `smootherstep` uygulamaz; progress doğrudan kullanılır.

Bu kararın nedeni: çift easing tepsinin ilk bölümde görünmemesine, boş petrol yeşili ekran oluşmasına ve tepsinin son anda hızla yetişmesine neden olmuştu.

## 4. Mevcut dijital tepsi navigasyonu

Tepside burgerler analog scroll/drag sistemiyle değil sabit adımlarla değişir.

- Her burger adımı: `0.64s`
- Easing: `power2.inOut`
- Hızlı art arda girdiler sıraya alınır.
- Burger adı geçişin ortasında değiştirilir; isim boş kalmaz.
- Mobil swipe alanı tüm görünür ekrandır.
- Swipe mesafesi yalnızca yönü belirler; swipe hızı animasyon hızını belirlemez.
- İlk burger hero geçişi sonunda hazır ve etkileşebilir olur.

İlgili alanlar:

- `runDigitalTrayStep` — `src/App.jsx`
- `requestDigitalTrayIndex` — `src/App.jsx`
- `TrayTouchZone.jsx`
- `getTrayProgressForBurger` — `src/utils/scrollProgress.js`

Bu dijital mimari analog sisteme geri çevrilmemelidir.

## 5. Güncel burgerler ve görseller

Tepside prosedürel 3D burger yerine gerçek burger fotoğraflarının şeffaf kesimleri kullanılıyor.

Dosyalar:

```text
public/assets/burgers/hamburger-classic-cutout.png
public/assets/burgers/cheeseburger-cutout.png
public/assets/burgers/koz-burger-cutout.png
public/assets/burgers/karisik-burger-cutout.png
public/assets/burgers/baldicanli-burger-cutout.png
```

Son bölümde ayrıca:

```text
public/assets/burgers/baldicanli-burger-bitten.png
public/assets/interaction/hand-grab.png
```

Fotoğraflar `BurgerPhoto` ile Three.js düzlemine basılır. Kullanıcı bunu gerçekçi olmayan prosedürel burger modeline tercih etti.

Hero kısmındaki dört burger ise hâlâ prosedürel 3D burgerlerdir ve mevcut görünümleri/konumları korunmalıdır.

Burger sırası:

1. Hamburger — 220 TL
2. Cheeseburger — 230 TL
3. Köz Burger — 230 TL
4. Karışık Burger — 290 TL
5. Baldıcanlı Burger — 230 TL

Veriler `src/data/burgers.js` içindedir.

## 6. Site içeriğinde korunacak kararlar

- Renk paleti: koyu petrol yeşili + turuncu/sarı
- Son sarı bölümde navbar logosu petrol yeşiline döner.
- Logo altında `MİLAS` yazısı vardır.
- `MADE IN MILAS` İngilizce kalacaktır.
- Mobil başlık `BURGERİNİ SEÇ` şeklindedir.
- Masaüstünde `BURGERİNİ SEÇ` ve `01 — 05` üst göstergesi gösterilmez.
- Navbar mobilde tepsi aktifken gizlenir.
- Karışık Burger yazı yerleşimi diğerlerinden biraz daha aşağıdadır.
- Yorumlar gerçek Google yorumlarıyla değiştirilmiştir.
- Koray Etyemez yorumu kısaltılmış hâliyle kalmalıdır:
  - “Milasta hamburger yiyeceksen başka adres aramaya gerek yok.”
- “Tüm Menüyü Gör” gerçek tam menü overlay'ini açar.
- Menü tek akışta aşağı kayar; kategori seçmek zorunlu değildir.
- Getir sipariş bağlantısı ve yön ikonları emoji değil SVG/çizgi ikon olarak kalmalıdır.

## 7. Son bölümün mevcut davranışı

Son burgerden sonra:

1. El sahneye gelir.
2. Baldıcanlı burgeri alır.
3. El ve burger yukarı çıkarken sarı Made in Milas bölümü gelir.
4. Made in Milas alanında büyük, yarısı yenmiş baldıcanlı burger yazının arkasında ve sağında görünür.
5. Yazı burgerin ön katmanındadır.

Şu an final geçiş süresi `0.96s` ve hızlıdır. Bu, aşağıdaki sıradaki görevlerden biridir.

## 8. Sıradaki işler — onaylanan sıra

### 1. Tepsiden heroya geri dönüşü düzelt

Bu bir sonraki doğrudan görevdir.

Mevcut sorun:

- Kullanıcı tepsiden heroya geri kaydırdığında tepsi kadrajdan çıkmaya başlamadan önce ekranda gereğinden fazla bekliyor.

Hedef:

- Yukarı yönlü ilk girdi dijital komut olmalı.
- Burger bilgileri önce kontrollü biçimde kapanmalı.
- Tepsi beklemeden, sakin bir sabit animasyonla aşağı çıkmalı.
- Hero yazısı ve burgerleri tepsi yeterince çıktıktan sonra gelmeli.
- Kaydırma hızı animasyon hızını etkilememeli.
- Şu an beğenilen ileri hero → tepsi animasyonu bozulmamalı.

### 2. Made in Milas bölümünden geri dönüş ekle

Mevcut sorun:

- Sarı Made in Milas bölümüne tamamen gelince yukarı kaydırarak son burgere güvenilir biçimde dönülemiyor.

Hedef:

- Milas bölümündeki ilk yukarı kaydırma ayrı dijital komut olmalı.
- Milas bölümü aşağı çekilmeli.
- El ve burger ters animasyonla geri gelmeli.
- Burger tepsiye dönmeli.
- Kullanıcı son burgerde tekrar kontrol sahibi olmalı.

### 3. Son burger/el animasyonunu yavaşlat

Mevcut `0.96s` final geçişi çok hızlıdır.

Hedef sıra:

1. El sakin biçimde yaklaşır.
2. Burgeri kavradığını anlatan kısa bir tutuş anı olur.
3. El burgeri kaldırır.
4. El çıkarken Made in Milas bölümü aynı anda yükselir.

Önerilen başlangıç aralığı yaklaşık `1.35–1.50s`; gerçek cihazda kullanıcıyla görsel olarak ayarlanmalıdır. Bu işlem Milas geri dönüş mimarisi kurulduktan sonra yapılmalıdır.

## 9. Daha sonraki performans yaklaşımı

Kullanıcı görüntü kalitesinin düşürülmesini istemiyor.

İleride performans optimizasyonu yapılırsa tercih sırası:

1. Ekranda olmayan sahne hesaplarını durdur.
2. Boşta gereksiz render'ı azalt / demand rendering değerlendir.
3. Texture ve shader'ları kullanıcı etkileşiminden önce hazırla.
4. Sabit burger fotoğraflarını görsel olarak kullanmaya devam et.
5. DPR, ışık, gölge veya texture kalitesini görünür biçimde düşürme.

Tüm geçişi video yapmak önerilmedi; geri oynatma, responsive oranlar, şeffaflık ve mobil uyumluluk daha kırılgan olabilir. En uygun yaklaşım mevcut hibrit Three.js + fotoğraf sistemini optimize etmektir.

## 10. Kritik dosyalar

- `src/App.jsx`
  - ana durum makinesi
  - dijital hero girdisi
  - hero/tray zaman çizelgeleri
  - dijital burger adımları
  - final geçiş
- `src/three/Experience.jsx`
  - R3F sahne bağlantıları
- `src/three/FloatingBurgers.jsx`
  - hero burgerleri ve çıkış hareketleri
- `src/three/CameraRig.jsx`
  - hero/tepsi kamera geçişi
- `src/three/Tray.jsx`
  - tepsi giriş/konum/dönüşü
- `src/three/Burger.jsx`
  - hero 3D burgerleri, tepsi fotoğrafları ve el
- `src/components/TrayTouchZone.jsx`
  - dijital swipe yönü
- `src/sections/BurgerShowcase.jsx`
  - burger bilgi katmanı
- `src/utils/scrollProgress.js`
  - burger/tepsi progress eşlemeleri
- `src/index.css`
  - mobil ve masaüstü yerleşimler

## 11. Test standardı

Her animasyon değişikliğinden sonra en az:

```bash
npm run build
```

Ardından gerçek tarayıcıda:

- mobil: `390 × 844`
- masaüstü: `1280 × 720`
- küçük kaydırma
- çok sert kaydırma
- animasyon sırasında ek momentum
- geri dönüş
- ikinci kez ileri geçiş
- konsol error/warning kontrolü

Hero dijital girişinde özellikle doğrulanacak:

- ilk girdiden hemen sonra `scrollY === 0`
- devam momentumunda `scrollY === 0`
- animasyon sonunda mobilde ilk burger konumu yaklaşık `scrollY === 1120.8`
- ilk burger adı `HAMBURGER`
- touch zone aktif

Deploy sonrası aynı kontroller `https://baget-burger-milas.vercel.app` üzerinde yapılmalıdır.

## 12. Git ve deploy çalışma şekli

- Kullanıcının değişikliklerini silme.
- `git reset --hard` veya benzeri yıkıcı komut kullanma.
- Önce `git status` ve `git diff` kontrol et.
- Değişikliği build ve tarayıcı testinden sonra commit et.
- `main` dalına push et.
- Vercel production deploy yap.
- Stabil alias değişmemeli:
  - `https://baget-burger-milas.vercel.app`

Yakın commit geçmişi:

```text
3d79189 Fine tune tray entrance speed
d4ed261 Trigger hero transition on first scroll input
b776489 Make tray entrance visibly slower
9694454 Give tray entrance a dedicated timeline
0b972dd Reveal tray before burger details
23f11bf Extend hero transition timing
2431693 Slow down digital hero transition
c7bc7d2 Convert scene navigation to digital transitions
```

## 13. Yeni context'in ilk yapacağı şey

1. Bu dosyayı tamamen oku.
2. `git status` ve `git log -5 --oneline` çalıştır.
3. Canlı sayfayı mobil ölçüde açıp mevcut onaylı hero → tepsi hareketini izle.
4. Onaylı süreleri veya dijital hero girişini değiştirme.
5. Kullanıcı isterse sıradaki görev olan **tepsiden heroya dijital geri dönüşü** uygula.

## 14. 9 Ağustos 2026 — navigasyon mimarisi güncellemesi

Bu bölüm, yukarıdaki dijital tepsi ve dijital final geçişi notlarının yerine geçer.

- Hero ↔ tepsi geçişi dijital ve sabit süreli kalır.
- Tepsi burger navigasyonu artık analogdur: doğal dikey scroll ve mobil yatay sürükleme tepsiyi sürekli döndürür.
- Girdi durduğunda tepsi en yakın burger durağına kısa ve yumuşak bir snap ile yerleşir.
- Burger bilgi katmanı yalnızca tepsi bir burger durağına yerleştiğinde görünür.
- Tepsi dönüş aralığı showcase progress'inde mobilde `0.075 → 0.62`, masaüstünde `0.17 → 0.62` aralığıdır.
- Showcase yüksekliği mobil ve masaüstünde `720vh` olarak ayarlanmıştır.
- Son burger → Made in Milas geçişi dijital değildir. Showcase progress'inin son `0.62 → 1` bölümü gerçek scroll progress'iyle çalışır ve yaklaşık `300vh` mesafe sağlar.
- Final akışı üç fazlıdır: el yaklaşır (`0 → 0.323`), kısa kavrama aralığı oluşur (`0.323 → 0.374`), burger kaldırılır (`0.374 → 0.7004`). İlk genel `%15` kısaltmaya ek olarak, el burgere ulaştıktan sonraki kaldırma fazı ayrıca `%20` daha az scroll gerektirir.
- Made in Milas bölümü doğal sayfa scroll'u ile el/burger çıkışının ikinci yarısında yükselir.
- Yukarı kaydırma aynı progress'i tersine çevirdiği için Milas → son burger dönüşünde ayrı dijital komut veya ters tween yoktur.
- Geri dönüş sonunda burger tepsiye yerleşir, `05 — 05` bilgisi ve tepsi etkileşimi yeniden açılır.
- Hero → tepsi girişinde tepsi render'a ekranın tamamen altında başlar (`Y`: mobil `-8.5`, masaüstü `-9.5`) ve fiziksel olarak aşağıdan gelir.

## 15. 9 Ağustos 2026 — gerçek mobil performans yolu

- BrowserStack ve gerçek mobil cihaz davranışı, masaüstü Chrome penceresini daraltarak yapılan kontrolden daha önemlidir.
- `720px` ve altında ayrı bir hafif render yolu kullanılır; masaüstü görünümü değişmez.
- Mobil hero kompozisyonu ve burgerlerin hareket rotaları korunur; köşe burgerleri ağır prosedürel çok parçalı modeller yerine mevcut şeffaf gerçek burger kesimleriyle render edilir.
- Mobil Canvas DPR değeri `1` olur; antialias, WebGL gölgeleri, environment haritası, hero burger başına ek nokta ışıkları ve tepsi burgerlerinin beş ayrı vurgu ışığı kapatılır.
- Mobilde tam ekran gren katmanının pahalı `screen` blend işlemi ve burger bilgi geçişlerindeki blur filtresi kaldırılır.
- Mobil 375×844 yerel testte hero, hero → tepsi, analog burger rotasyonu, son burger → Milas ve Milas → son burger geri dönüşü doğrulandı; konsolda warning/error yoktu.
- Environment haritası mobilde kapalı kaldığı için tepsinin yüksek metalness değerleri siyaha yakın görünmemelidir; mobil tepsi malzemeleri daha açık metalik gri/kahverengi ve daha düşük metalness değerleri kullanır.
- Mobil yatay tepsi sürükleme katsayısı `2.35` yerine `3.15` oldu. Bir burgerlik hareket yaklaşık `%25` daha kısa parmak mesafesiyle tamamlanır; doğal dikey scroll ve final el geçişi mesafeleri değişmez.
