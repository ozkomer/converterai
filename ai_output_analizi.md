# AI Çıktısı JSON Yapısı Analizi

## 📋 Genel Yapı

```json
{
  "CourseInfo": { ... },      // Eğitim genel bilgileri
  "Sections": [ ... ],        // İçerik sahneleri (10-14 sahne)
  "GeneralQuiz": [ ... ],     // Sorular (3 soru)
  "IsSuccess": true,
  "ErrorMessage": ""
}
```

## 1️⃣ CourseInfo (Kapak Sahnesi)

```json
{
  "Title": "Güvenli Yazılım Geliştirme Kılavuzu Eğitimi",
  "Description": "Bu eğitim, yazılım güvenliğinin...",
  "Objective": null,
  "TargetAudience": null,
  "CourseImageUrl": "https://localhost/ContentFiles/.../cover.jpg",
  "AudioDuration": 3,
  "SpeechAudioUrl": "https://localhost/ContentFiles/.../cover.mp3",
  "SpeechFileName": "1-ai-CourseCoverSpeech-xxx.mp3"
}
```

**Şablon Eşleşmesi:**
- `Title` → `#{[training-title]}#`
- `Description` → `#{[training-description]}#`
- `CourseImageUrl` → `#{[type0:imageurl]}#`
- `SpeechAudioUrl` → `#{[type0:speech]}#` (URL olarak)
- `AudioDuration` → `#{[type0:audioduration]}#`

## 2️⃣ Sections (İçerik Sahneleri)

Her section şu yapıya sahip:

```json
{
  "PageStyle": 26,           // Sahne tipi numarası
  "Index": 1,                // Sahne sırası
  "Title": "Başlık",
  "Description": null,
  "Content": { ... },        // İçerik objesi (değişken yapı)
  "NarrationText": "...",    // Narrasyon metni
  "Images": [ ... ],         // Görsel array'i
  "YoutubeUrl": null,
  "AudioDuration": 28,
  "SpeechAudioUrl": "https://...",
  "SpeechFileName": "AI_Section_1_xxx.mp3"
}
```

### PageStyle Eşleşmesi

AI çıktısındaki PageStyle numaraları, Excel'deki Type numaralarından farklı!

| PageStyle | Excel Type | Açıklama |
|-----------|------------|----------|
| 26 | Type1 | Başlık + Paragraf + Görsel |
| 27 | Type2 | Başlık + Alt Başlık + 2 Paragraf + Görsel |
| 15 | Type9 | Başlık + Paragraf + Görsel + 4 Madde |
| 21 | Type? | Başlık + 3 Paragraf + Görsel |
| 4 | Type4 | Başlık + Paragraf + 4 Madde + Görsel |
| 28 | Type9 | Başlık + Paragraf + Görsel + 4 Madde |
| 29 | Type? | Başlık + 4 Madde + 2 Görsel |
| 30 | Type? | Başlık + 2 Madde + Görsel |
| 10 | Type10 | Başlık + Görsel + 2 Paragraf |
| 11 | Type11 | Video Sahnesi |
| 12 | Type12 | SingleSelect Soru |
| 13 | Type13 | MultiSelect Soru |
| 14 | Type14 | TrueFalse Soru |
| 100 | Type100 | "Şimdi Sıra Sizde" |
| 101 | Type101 | "Tebrikler" |

### Content Objesi Yapıları

PageStyle'a göre değişen yapılar:

**PageStyle 26:**
```json
"Content": {
  "paragraph": "..."
}
```

**PageStyle 27:**
```json
"Content": {
  "paragraph": "...",
  "subtext1": "...",
  "subtext2": "..."
}
```

**PageStyle 15 (Liste içeren):**
```json
"Content": {
  "paragraph": "...",
  "list": "Madde 1; Madde 2; Madde 3"  // ; ile ayrılmış
}
```

**PageStyle 21 (3 Paragraf):**
```json
"Content": {
  "paragraph1": "...",
  "paragraph2": "...",
  "paragraph3": "..."
}
```

**PageStyle 29 (Sadece Liste):**
```json
"Content": {
  "list": "..."
}
```

**PageStyle 10:**
```json
"Content": {
  "paragraph1": "...",
  "paragraph2": "..."
}
```

### Images Array

```json
"Images": [
  {
    "ImagePrompt": "software security lifecycle principles...",
    "ImageSize": "W1024xH1792",
    "ImageUrl": "https://localhost/ContentFiles/.../image.jpg",
    "IsSuccess": false,
    "ErrorMessage": null
  }
]
```

- Bazı sahnelerde 1 görsel, bazılarında 2 görsel var
- `ImageSize` formatları: `W1024xH1792`, `W1792xH1024`, `W1024xH1024`

## 3️⃣ GeneralQuiz (Sorular)

```json
{
  "Index": 12,
  "Type": 0,              // 0=SingleSelect, 1=MultiSelect, 2=TrueFalse
  "Question": "...",
  "Options": ["A", "B", "C", "D"],
  "CorrectAnswers": ["C"],
  "Statements": null,     // TrueFalse için dolu
  "IsSuccess": true,
  "ErrorMessage": null
}
```

**Type 0 - SingleSelect:**
- `Question`: Soru metni
- `Options`: Array of seçenekler
- `CorrectAnswers`: Array of doğru cevaplar (1 adet)

**Type 1 - MultiSelect:**
- `Question`: Soru metni
- `Options`: Array of seçenekler
- `CorrectAnswers`: Array of doğru cevaplar (birden fazla)

**Type 2 - TrueFalse:**
- `Question`: Başlık
- `Statements`: Array of statement objesi
  ```json
  {
    "Statement": "İfade metni",
    "Answer": "True" / "False"
  }
  ```

## 🔗 AI Çıktısı → Şablon Mapping

### Kapak Sahnesi (type0)
```
CourseInfo.Title → #{[type0:title]}#
CourseInfo.CourseImageUrl → #{[type0:imageurl]}#
CourseInfo.SpeechAudioUrl → #{[type0:speech]}# (dosya yolu)
CourseInfo.AudioDuration → #{[type0:audioduration]}#
```

### İçerik Sahneleri (type1-10)
```
Section[0].Title → #{[type1_1:title]}#
Section[0].NarrationText → #{[type1_1:speech]}# (metin)
Section[0].Images[0].ImageUrl → #{[type1_1:imageurl]}#
Section[0].AudioDuration → #{[type1_1:audioduration]}#
Section[0].SpeechAudioUrl → Ses dosyası yolu (şablonda embed)
```

### Video Sahnesi (type11)
```
Section[10].Title → #{[type11_11:title]}#
Section[10].YoutubeUrl → Video embed
```

### Soru Sahneleri (type12-14)
```
GeneralQuiz[0].Question → Soru içeriği (şablonda embed)
GeneralQuiz[0].SpeechAudioUrl → Ses dosyası
AudioDuration → #{[type12_12:audioduration]}#
```

### Kapanış Sahneleri
```
Section[PageStyle=100].Title → #{[type100:title]}#
Section[PageStyle=100].AudioDuration → #{[type100:audioduration]}#
Section[PageStyle=100].SpeechAudioUrl → Ses dosyası

Section[PageStyle=101].Title → #{[type101:title]}#
Section[PageStyle=101].AudioDuration → #{[type101:audioduration]}#
Section[PageStyle=101].SpeechAudioUrl → Ses dosyası
```

## ⚠️ Önemli Notlar

1. **PageStyle Dönüşümü**: AI çıktısındaki `PageStyle` numaraları, Excel'deki `Type` numaralarından farklı. Mapping tablosu gerekli!

2. **Content Yapısı**: Her PageStyle için farklı content yapısı var. Şablona yerleştirirken doğru alanları map etmek gerekli.

3. **Ses Dosyaları**: 
   - AI çıktısında `SpeechAudioUrl` URL olarak geliyor
   - Şablonda ses dosyası path'i olarak gömülmeli

4. **Görsel Sayısı**:
   - Type3 ve Type6: 2 görsel (`imageurl1`, `imageurl2`)
   - Diğerleri: 1 görsel (`imageurl`)

5. **NarrationText vs Speech**:
   - AI çıktısında `NarrationText`: Metin olarak narrasyon
   - Şablonda `speech` tag'i: Genelde ses dosyası path'i için kullanılıyor

## 🎯 Sonuç

AI çıktısını şablona map etmek için:
1. PageStyle → Type mapping tablosu oluştur
2. Content objelerini şablon yapısına dönüştür
3. Ses ve görsel URL'lerini şablon path'lerine map et
4. Soru yapılarını şablon formatına dönüştür

