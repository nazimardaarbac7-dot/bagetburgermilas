# Baget Burger — Proje Devir Notu

Bu dosya, projeyi devralacak yeni Codex/ChatGPT oturumunun mevcut durumu hızlıca anlaması için hazırlanmıştır.

## 1. Projenin amacı

Baget Burger / Milas için premium, eğlenceli ve mobil öncelikli bir restoran web sitesi geliştiriliyor.

Site klasik bir restoran şablonu gibi görünmemeli. Marka hissi:

- sıcak, iştah açıcı ve yerel,
- editoryal ve premium,
- 3D öğelerle eğlenceli,
- scroll sırasında sinematik fakat anlaşılır,
- mobilde akıcı ve kolay kullanılabilir olmalı.

Uzun vadeli fikirler:

- burgerlerle küçük etkileşimler,
- son burgeri alan ve ısıran bir el animasyonu,
- ileride ayrı bir aşamada mini oyun,
- gerçek menü burgerlerine benzeyen, yüksek kaliteli 3D burger modelleri.

## 2. Kullanılan teknoloji

- React 19
- Vite 7
- Three.js
- React Three Fiber
- Drei
- GSAP / ScrollTrigger

Temel komutlar:

```bash
npm install
npm run dev
npm run build
```

Yerel ağda telefon testi için Vite sunucusu `--host 0.0.0.0` ile çalıştırılabilir.

## 3. Mevcut site yapısı

Akış korunmalıdır:

1. Baget Burger / Milas hero bölümü
2. Hero yazısı ve köşelerdeki burgerlerin birlikte dağılması
3. Tepsinin yumuşak biçimde kadraja yerleşmesi
4. Scroll veya mobil sürükleme ile dönen burger tepsisi
5. Yorum kartları
6. Made in Milas içeriği ve “Tüm Menüyü Gör” CTA’sı

Önemli dosyalar:

- `src/App.jsx`: GSAP ve scroll akışı
- `src/utils/scrollProgress.js`: tepsi geçiş ve dönüş eşikleri
- `src/three/Experience.jsx`: 3D sahne
- `src/three/Tray.jsx`: tepsi, burger yerleşimi ve dönüş
- `src/three/Burger.jsx`: mevcut geçici prosedürel burger modelleri
- `src/data/burgers.js`: burger adları, içerikler ve fiyatlar
- `src/index.css`: masaüstü ve mobil yerleşim
- `src/sections/MilasSection.jsx`: yorumlar ve final içerik

## 4. Şu ana kadar beğenilen ve korunması gerekenler

- Genel karanlık, sıcak ve premium görsel yön
- Hero burgerlerinin yazının dört köşesine/yakınına dağılması
- Hero yazısı ile burgerlerin aynı scroll sürecinde kaybolması
- Burgerlerin aniden değil, yumuşak şekilde kadrajdan ayrılması
- Mobil hero düzeni
- Mobil tepsi geçişinin masaüstünden daha kısa olması
- İlk burgerin tepside yeterince uzun görünmesi
- Yorum kartlarının katmanlı, eğik ve sırayla animasyonla gelmesi
- Yukarı/aşağı scroll sırasında yorum animasyonunun yeniden oynatılması
- Mobil final sırası: önce yorumlar, sonra Made in Milas
- “Tüm Menüyü Gör” butonu
- Sol üst logo metni: “BAGET BURGER”
- Mobilde tepsinin hafif yukarıdaki güncel konumu
- Her tepsi burgerinin aktif konuma geldiğinde kullanıcıya doğru bakmasını sağlayan `facingAngle` yaklaşımı

## 5. Burger verileri

### 01 — Hamburger

- Ad: Hamburger
- İçerik: El yapımı burger köftesi, turşu, özel sos, mayonez
- Fiyat: 220 TL

### 02 — Cheeseburger

- Ad: Cheeseburger
- İçerik: El yapımı burger köftesi, cheddar peyniri, turşu, özel sos, mayonez
- Fiyat: 230 TL

### 03 — Köz Burger

- Ad: Köz Burger
- İçerik: El yapımı burger köftesi, közlenmiş biber, turşu, özel sos, mayonez
- Fiyat: 230 TL

04 ve 05 hâlâ geçici menü öğeleridir; gerçek ürün bilgileri kullanıcıdan alınmalıdır.

## 6. Burger modelleriyle ilgili kritik karar

Mevcut `Burger.jsx` içinde ekmek, köfte, cheddar ve köz biber kodla/prosedürel geometriyle üretilmeye çalışıldı. Kullanıcı son Cheeseburger ve Köz Burger sonucunu beğenmedi.

Yeni oturum şu yaklaşımı sürdürmemelidir:

- cheddar veya köz biberi çok sayıda `Shape`, `TubeGeometry`, torus ya da küre ile kod içinde taklit etmeye çalışmak,
- yalnızca renk değiştirerek gerçekçilik beklemek,
- tam burger modellemesini JSX içine gömmek.

Mevcut prosedürel modeller sadece geçici yer tutucudur. Bundan sonraki doğru yön, burgerleri bir 3D modelleme aracında hazırlayıp `.glb` olarak siteye aktarmaktır.

## 7. Önerilen 3D burger üretim hattı

### Ana öneri: Blender

Blender ücretsiz ve açık kaynaklıdır. Burger gibi organik yiyecekler için mesh modelleme, sculpt, UV açma, texture paint ve materyal hazırlama araçları aynı uygulamadadır.

Önerilen çalışma:

1. Her burgeri ayrı bir Blender dosyasında oluştur.
2. Ekmek, köfte, turşu, sos, peynir ve biberi ayrı objeler tut.
3. Objeleri anlaşılır isimlendir:
   - `bun_top`
   - `bun_bottom`
   - `patty`
   - `cheddar`
   - `pickle_01`
   - `roasted_pepper_01`
   - `sauce`
4. Ekmek ve köfteyi sculpt ile şekillendir; gereksiz yoğunluğu retopology/decimate ile azalt.
5. UV aç ve PBR materyaller kullan:
   - Base Color
   - Roughness
   - Normal
   - gerekirse Ambient Occlusion
6. Mobil performans için dokuları çoğunlukla 1024×1024 veya en fazla 2048×2048 tut.
7. Sahne ışıklarını/kamerayı modele gömmek yerine yalnızca burger objelerini dışa aktar.
8. Modeli tek bir `.glb` dosyası olarak dışa aktar.
9. React Three Fiber tarafında `useGLTF` ile yükle.
10. Sahnedeki mevcut scroll, ölçek, dönüş ve dokunma etkileşimlerini GLB kök grubuna uygula.

Resmi kaynaklar:

- Blender modelleme ve sculpt: https://docs.blender.org/manual/en/latest/sculpt_paint/index.html
- Blender Texture Paint: https://docs.blender.org/manual/en/latest/sculpt_paint/texture_paint/introduction.html
- glTF/GLB biçimi: https://threejs.org/docs/pages/GLTFLoader.html

### Daha kolay web alternatifi: Spline

Spline, tarayıcı üzerinden görsel olarak 3D sahne ve basit modeller hazırlamak için daha kolaydır. GLTF/GLB dışa aktarabilir. Ancak organik ve gerçekçi yiyecek modellemesinde Blender kadar güçlü değildir. Spline belgelerine göre texture içeren GLTF/GLB dışa aktarımı ücretli plan özelliğidir ve bazı materyal türleri dışa aktarılmaz.

- Spline GLTF/GLB dışa aktarma: https://docs.spline.design/exporting-your-scene/files/exporting-as-gtlf-glb

### Sadece sahne düzenleme/test için: Three.js Editor

Three.js Editor; objeyi yerleştirmek, döndürmek, ölçeklemek, materyal denemek ve GLB/GLTF dışa aktarmak için kullanılabilir. Burgeri sıfırdan organik biçimde modellemek için iyi bir araç değildir.

- Three.js Editor: https://threejs.org/editor/

## 8. Önerilen dosya yapısı

GLB hattına geçildiğinde:

```text
public/
  models/
    burgers/
      hamburger.glb
      cheeseburger.glb
      koz-burger.glb
src/
  three/
    BurgerModel.jsx
    Tray.jsx
```

`BurgerModel.jsx` veri odaklı olmalı; burger kimliğine göre doğru GLB dosyasını seçmeli. Scroll ve tepsi mimarisi yeniden yazılmamalıdır.

## 9. Performans hedefleri

Mobil önceliklidir. Tek bir eski iPhone modeline özel hack yapılmamalıdır; genel mobil optimizasyon tercih edilmelidir.

GLB modelleri için öneriler:

- görünmeyen yüzleri ve gereksiz vertexleri temizle,
- her burgeri mümkünse 30–80 bin üçgen aralığında tut,
- aynı materyali kullanan parçaları gerektiğinde birleştir,
- texture sayısını ve çözünürlüğünü sınırlı tut,
- Draco veya Meshopt sıkıştırmasını değerlendirin,
- modelleri ihtiyaçtan önce preload edin,
- gerçek cihazda FPS, yükleme süresi ve bellek kullanımı kontrol edin.

Görsel kaliteyi düşüren agresif renderer ayarları daha önce denenmiş ve kullanıcı tarafından beğenilmemiştir. Optimizasyon yapılırken mevcut ışık ve genel grafik kalitesi korunmalıdır.

## 10. El animasyonu için mimari not

Son burger için sahnede `pickupTarget` / `hand-pickup-target` isimlendirmesi hazırlanmıştır. El modeli daha sonra GLB olarak eklenecek.

Plan:

1. Son burger aktif olur.
2. Final scroll aralığında rig’li el sahneye girer.
3. El burgerin hedef noktasına yaklaşır.
4. Burger geçici olarak el kemiğine veya taşıyıcı gruba bağlanır.
5. El burgeri kaldırır.
6. Isırık için morph target veya önceden hazırlanmış ısırılmış model varyantı kullanılır.

Bu aşama gerçek burger modellerinden ve mobil düzenlemelerden sonra yapılmalıdır.

## 11. Git durumu

- Yerel depo oluşturuldu.
- Dal: `main`
- İlk commit: `fdc82d0 Initial Baget Burger prototype`
- GitHub üzerinde uzak repo oluşturma işlemi tamamlanmadı; giriş aşamasında kalındı.
- Aşağıdaki dosyalarda ilk commit sonrasında henüz commitlenmemiş değişiklikler vardır:
  - `src/data/burgers.js`
  - `src/index.css`
  - `src/three/Burger.jsx`
  - `src/three/Tray.jsx`

Yeni oturum mevcut değişiklikleri silmemeli veya hard reset yapmamalıdır. Önce `git diff` ile incelemelidir.

## 12. Yeni oturum için önerilen ilk görev

1. Bu dosyayı tamamen oku.
2. `git status` ve `git diff` ile mevcut durumu incele.
3. Mevcut prosedürel cheddar/köz biber çalışmalarını nihai çözüm kabul etme.
4. Kullanıcıyla Blender mı Spline mı kullanılacağını netleştir.
5. Bir örnek `.glb` için `BurgerModel.jsx` yükleme mimarisini hazırla.
6. Önce yalnızca Hamburger modelini entegre et ve mobil/masaüstü ölçülerini doğrula.
7. Onaydan sonra Cheeseburger ve Köz Burger’e geç.

## 13. Tasarım prensibi

Amaç “kodla yapılmış burger” göstermek değil, gerçek Baget Burger menüsünü kaliteli ve iştah açıcı bir 3D deneyime dönüştürmektir. Site mimarisi ve scroll hikâyesi güçlüdür; bundan sonraki ana kalite artışı doğru 3D asset üretiminden gelmelidir.
