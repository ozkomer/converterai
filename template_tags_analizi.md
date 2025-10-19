# Şablon Tagleri Analizi

## 🏷️ Tag Kategorileri

### 1. **Global Eğitim Bilgileri**
```
#{[training-title]}#          → Eğitim başlığı
#{[training-description]}#    → Eğitim açıklaması
```

### 2. **AI ve Dosya Ayarları**
```
#{[ai-mandatory]}#            → AI zorunluluğu
#{[files-uploaded]}#          → Yüklenen dosyalar
```

### 3. **Soru Ayarları**
```
#{[localized-question]}#           → Yerelleştirilmiş soru
#{[question-feedback-enable]}#     → Soru geri bildirimi aktif mi
#{[question-feedback-shuffle]}#    → Soru karıştırma aktif mi
```

### 4. **Kapak Sahnesi (type0)**
```
#{[type0:title]}#             → Kapak başlığı
#{[type0:speech]}#            → Kapak ses metni
#{[type0:imageurl]}#          → Kapak görseli URL
#{[type0:audioduration]}#     → Kapak ses süresi
```

### 5. **İçerik Sahneleri (type1 - type10)**

Her sahne için aynı pattern:
```
#{[typeX_X:title]}#           → Sahne başlığı
#{[typeX_X:speech]}#          → Sahne narrasyon metni
#{[typeX_X:audioduration]}#   → Ses süresi
#{[typeX_X:imageurl]}#        → Görsel URL (tek görsel)
#{[typeX_X:imageurl1]}#       → Görsel 1 URL (çift görsel)
#{[typeX_X:imageurl2]}#       → Görsel 2 URL (çift görsel)
```

**Capsule Şablonu İçin:**
- `type1_1` → Type1 sahne
- `type2_2` → Type2 sahne
- `type3_3` → Type3 sahne (2 görsel)
- `type4_4` → Type4 sahne
- `type5_5` → Type5 sahne
- `type6_6` → Type6 sahne (2 görsel)
- `type7_7` → Type7 sahne
- `type8_8` → Type8 sahne
- `type9_9` → Type9 sahne
- `type10_10` → Type10 sahne

### 6. **Video Sahnesi (type11)**
```
#{[type11_11:title]}#         → Video sahne başlığı (sadece title, speech/image yok)
```

### 7. **Soru Sahneleri (type12, type13, type14)**
```
#{[type12_12:speech]}#        → SingleSelect soru ses metni
#{[type12_12:audioduration]}# → Ses süresi

#{[type13_13:speech]}#        → MultiSelect soru ses metni
#{[type13_13:audioduration]}# → Ses süresi

#{[type14_14:speech]}#        → TrueFalse soru ses metni
#{[type14_14:audioduration]}# → Ses süresi
```

### 8. **Kapanış Sahneleri (type100, type101)**
```
#{[type100:title]}#           → "Şimdi Sıra Sizde" başlığı
#{[type100:speech]}#          → Ses metni
#{[type100:audioduration]}#   → Ses süresi

#{[type101:title]}#           → "Tebrikler" başlığı
#{[type101:speech]}#          → Ses metni
#{[type101:audioduration]}#   → Ses süresi
```

## 📊 Şablonlara Göre Tag Sayıları

| Şablon | Toplam Sahne | Tag Yapısı |
|--------|--------------|------------|
| **LSCapsule** | 14 sahne | type0 + type1_1 → type10_10 + type11_11 + type12-14 + type100-101 |
| **LSMicro** | ~5 sahne | type0 + type1_1 → type5_5 + sorular + kapanış |
| **LSMini** | ~12 sahne | type0 + type1_1 → type12_12 + sorular + kapanış |
| **LSMidi** | ~30 sahne | type0 + type1_30 → type30_30 + sorular + kapanış |
| **LSMaxi** | ~30 sahne | type0 + type1_30 → type30_30 + sorular + kapanış |
| **LSXL** | ~30+ sahne | type0 + type1_30 → type30_30+ + sorular + kapanış |

## 🎯 Tag Kullanım Mantığı

1. **Numaralandırma**: `typeX_Y` formatında
   - X: Sahne type numarası
   - Y: Sahne sırası (genelde aynı)

2. **Alan Tipleri**:
   - `:title` → Başlık metni
   - `:speech` → Narrasyon/ses metni
   - `:audioduration` → Ses dosyası süresi (saniye)
   - `:imageurl` → Görsel URL'i
   - `:imageurl1`, `:imageurl2` → Çift görsel için

3. **Özel Durumlar**:
   - Type3 ve Type6: 2 görsel içerir
   - Type11: Sadece title var (video sahnesi)
   - Type12-14: Soru sahneleri, title yok

## 💡 AI ile Doldurulması Gereken Veriler

Excel'deki AI çıktılarından şablona map edilecek veriler:

```json
{
  "training-title": "Eğitim başlığı",
  "training-description": "Eğitim açıklaması",
  
  "type1_1:title": "Section 1 başlığı",
  "type1_1:speech": "Section 1 narration text",
  "type1_1:imageurl": "generated_image_url",
  "type1_1:audioduration": "60",
  
  // ... her sahne için tekrar
}
```

