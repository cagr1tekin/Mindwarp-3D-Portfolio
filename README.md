# Enter My Mind - 3D İnteraktif Portföyo

Bu proje, Three.js ve React kullanarak oluşturulmuş 3D interaktif bir portföyo uygulamasıdır. "Enter My Mind" temasıyla, ziyaretçilere yaratıcı ve teknik evrenimde bir yolculuk sunuyor.

## Özellikler

- 3D uzay ortamı ve yıldızlar
- Optimized rendering (InstancedMesh ile 30.000 yıldız)
- Kamera animasyonları ve geçişler
- GLB formatında 3D modeller
- Sahne yönetimi (Zustand ile)
- Ses efektleri ve müzik desteği
- Modüler ve genişletilebilir mimari

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## Yapı

- `src/components/` - React bileşenleri
- `src/store/` - Zustand durum yönetimi
- `src/utils/` - Yardımcı fonksiyonlar
- `public/` - Statik dosyalar (3D modeller, sesler)

## Kullanılan Teknolojiler

- React 19
- Three.js
- React Three Fiber
- Zustand (durum yönetimi)
- Vite (build aracı)

## Kurulum İçin Gerekli Adımlar

1. `public/sounds/` klasörüne ses dosyalarını ekleyin (detaylı bilgi için `/public/sounds/README.md` dosyasına bakın)
2. `npm run dev` komutuyla geliştirme sunucusunu başlatın
3. Projeyi tarayıcıda görüntüleyin

## Performans Optimizasyonları

- InstancedMesh kullanarak 30.000 yıldızı verimli şekilde render etme
- GLB modelleri için materyal optimizasyonu
- FPS monitörü ile performans takibi

## Lisans

MIT
