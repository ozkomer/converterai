# 🚀 Hızlı Başlangıç Kılavuzu

## 5 Dakikada Başlayın!

### 1️⃣ Kurulum (1 dakika)

```bash
cd /path/to/JsonArge/converter
npm install
```

### 2️⃣ Test (1 dakika)

```bash
npm run convert -- --help
```

### 3️⃣ İlk Dönüştürme (2 dakika)

```bash
npm run convert -- convert \
  --ai-output "../ÖRNEK-AI-ÇIKTILAR (1)/CAPSULE-SAMSUNG-ai_result_sample_Capsule_samsung_26-08-2025.json" \
  --template "/Users/omer/Downloads/ŞABLONLAR/LSCapsule/voiceidealStudioTemplate_black.json" \
  --output "./output/my-first-output.json"
```

### 4️⃣ Sonucu Kontrol Et (1 dakika)

```bash
ls -la output/
cat output/my-first-output.json | head -20
```

---

## 🎯 Temel Komutlar

### En Basit Kullanım
```bash
npm run convert -- convert \
  --ai-output "input.json" \
  --template "template.json" \
  --output "output.json"
```

### Detaylı Log ile
```bash
npm run convert -- convert \
  --ai-output "input.json" \
  --template "template.json" \
  --output "output.json" \
  --verbose
```

---

## 📁 Dosya Yapısı

```
converter/
├── src/                    # Kaynak kodlar
├── config/                 # Konfigürasyon
├── output/                 # Çıktı dosyaları
├── DOCUMENTATION.md        # Detaylı dokümantasyon
└── QUICK_START.md         # Bu dosya
```

---

## ✅ Başarı Kontrolü

Eğer şu çıktıyı görüyorsanız, her şey çalışıyor:

```
🚀 AI to Template Conversion Started
[1/4] Loading files...
  ✓ AI output loaded
  ✓ Template loaded
[2/4] Building tag mappings...
  ✓ Cover tags extracted: 5 tags
  ✓ Section tags extracted: 16 sections
  ✓ Quiz tags extracted: 3 quizzes
  ✓ Total tags: 44
[3/4] Replacing tags in template...
  ✓ Tags replaced: 113
[4/4] Saving output...
  ✓ Output saved
✨ Conversion completed successfully!
```

---

## 🆘 Sorun mu Var?

### Yaygın Hatalar

**"File not found"**
```bash
# Dosya yollarını kontrol edin
ls -la "dosya-yolu"
```

**"JSON parse error"**
```bash
# Template'in geçerli JSON olduğundan emin olun
cat template.json | head -5
```

**"Unknown PageStyle"**
```bash
# Bu normal bir uyarı, sistem otomatik çözer
# Detaylı bilgi için --verbose kullanın
```

### Debug Modu

```bash
npm run convert -- convert \
  --ai-output "input.json" \
  --template "template.json" \
  --output "output.json" \
  --verbose
```

---

## 🎨 Template Türleri

| Template | Kullanım | Boyut |
|----------|----------|-------|
| **Capsule Black** | Genel eğitimler | ~285KB |
| **Capsule Green** | Sağlık eğitimleri | ~285KB |
| **Capsule Blue** | İş süreçleri | ~285KB |
| **XL** | Kapsamlı eğitimler | ~1MB |

---

## 📚 Daha Fazla Bilgi

- **Detaylı Dokümantasyon**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- **API Referansı**: [DOCUMENTATION.md#api-referansı](./DOCUMENTATION.md#api-referansı)
- **Örnekler**: [DOCUMENTATION.md#örnekler](./DOCUMENTATION.md#örnekler)

---

**🎉 Tebrikler! AI-to-Template Converter'ı başarıyla kullanmaya başladınız!**


