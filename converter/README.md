# AI Eğitim İçeriği Dönüştürücü

Bu proje, AI tarafından üretilen eğitim içeriklerini template tabanlı sistemle işleyerek kullanıma hazır JSON formatına dönüştürür.

## 🚀 Özellikler

- **Generic Template Sistemi**: Farklı eğitim türleri için esnek template yapısı
- **Otomatik Değişken Değiştirme**: Template değişkenlerini gerçek verilerle değiştirir
- **JSON Doğrulama**: Schema tabanlı veri doğrulama
- **Toplu İşlem**: Birden fazla dosyayı aynı anda işleme
- **Hata Yönetimi**: Detaylı hata raporlama ve logging

## 📁 Proje Yapısı

```
converter/
├── src/
│   ├── schemas/           # JSON Schema tanımları
│   ├── templates/         # Template değişken konfigürasyonları
│   ├── processors/        # Template işleme motorları
│   ├── converters/        # Ana dönüşüm sınıfları
│   └── cli/              # Komut satırı arayüzü
├── test-outputs/         # Test çıktıları
└── package.json
```

## 🛠️ Kurulum

```bash
cd converter
npm install
npm run build
```

## 📖 Kullanım

### Tek Dosya Dönüşümü

```bash
npm run convert -i input.json -o output.json -t template.json
```

### Toplu Dönüşüm

```bash
npm run convert --batch -i ./inputs -o ./outputs -t template.json
```

### Test Çalıştırma

```bash
node test-conversion.js
```

## 🔧 Konfigürasyon

### Template Değişkenleri

`src/templates/template-variables.json` dosyasında template değişkenleri tanımlanır:

```json
{
  "global": {
    "training-title": {
      "description": "Eğitim başlığı",
      "source": "CourseInfo.Title",
      "required": true
    }
  },
  "pageStyles": {
    "1": {
      "type0:imageurl": {
        "description": "Ana görsel URL",
        "source": "CourseInfo.CourseImageUrl"
      }
    }
  }
}
```

### JSON Schema

`src/schemas/training-schema.json` dosyasında veri yapısı tanımlanır:

```json
{
  "type": "object",
  "properties": {
    "CourseInfo": {
      "type": "object",
      "properties": {
        "Title": { "type": "string" },
        "Description": { "type": "string" }
      }
    }
  }
}
```

## 🔄 Dönüşüm Süreci

1. **AI Input Yükleme**: JSON dosyası okunur ve schema ile doğrulanır
2. **Template Seçimi**: Eğitim türüne göre uygun template seçilir
3. **Değişken Değiştirme**: Template değişkenleri gerçek verilerle değiştirilir
4. **JSON Doğrulama**: Çıktı JSON geçerliliği kontrol edilir
5. **Dosya Kaydetme**: İşlenmiş içerik dosyaya yazılır

## 📊 Desteklenen Eğitim Türleri

- **Call Center**: İletişim ve sunum becerileri
- **Health**: Sağlık sektörü eğitimleri
- **Algorithms**: Programlama ve algoritma eğitimleri
- **SOMPO**: Özel kurumsal eğitimler

## 🐛 Hata Ayıklama

### Yaygın Hatalar

1. **JSON Geçersiz**: Template değişkenleri düzgün değiştirilmemiş
2. **Schema Hatası**: Giriş verisi beklenen yapıda değil
3. **Template Bulunamadı**: Uygun template dosyası yok

### Log Kontrolü

```bash
# Detaylı log için
DEBUG=* npm run convert -i input.json -o output.json -t template.json
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.