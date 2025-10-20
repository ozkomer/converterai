# XL Conversion TDD (Test Driven Development) Guide

## 🎯 TDD Anlayışı

Bu TDD implementasyonu, XL input dosyalarının doğru şekilde işlenip beklenen output formatında döndürüldüğünü doğrular.

### 📋 Test Stratejisi

1. **Input Validation**: XL input dosyalarının doğru format kontrolü
2. **Template Processing**: XL template'lerinin doğru işlenmesi
3. **Output Verification**: Beklenen output formatının doğruluğu
4. **Edge Cases**: Özel durumların ele alınması
5. **Performance**: Büyük veri setlerinin performansı

## 🧪 Test Kategorileri

### 1. XL Input to Output Conversion Tests
- Her XL input dosyası için beklenen output'un doğruluğunu test eder
- Test dosyaları: `TestCases/inputs/xl-inputs/*.json`
- Beklenen output'lar: `TestCases/outputs/xl-outputs/*.json`

### 2. Edge Cases Tests
- Boş section array'leri
- Eksik CourseInfo
- Null/undefined değerler

### 3. Template Validation Tests
- XL-Blue template doğruluğu
- XL-SOMPO template doğruluğu
- Template type validation

### 4. Performance Tests
- Büyük veri setlerinin işlenmesi (50 section, 10 quiz)
- İşlem süresi kontrolü (< 5 saniye)

### 5. Error Handling Tests
- Malformed JSON input
- Missing template
- Required field validation

## 🚀 Test Çalıştırma

### Tüm Testleri Çalıştır
```bash
npm run test
```

### Sadece XL Conversion Testleri
```bash
npm run test:xl
```

### Test Runner Script ile
```bash
node run-tests.js
```

### Watch Mode (Geliştirme için)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## 📊 Test Sonuçları

### Başarılı Test Örneği
```
✅ Test Case 3: 3_XL_Blue_AIinput.json should convert to expected 3_XL_Blue_FinalOutput.json
  - 16 sections converted
  - 3 quizzes converted
  - Processing time: 245ms
```

### Test Assertions

Her test şu kontrolleri yapar:

1. **HTTP Response**: 200 status code
2. **Response Structure**: 
   ```json
   {
     "success": true,
     "data": {
       "convertedTemplate": {...},
       "stats": {
         "sections": number,
         "quizzes": number,
         "totalTags": number,
         "replacedTags": number
       },
       "templateType": "XL-Blue"
     }
   }
   ```

3. **Template Validation**:
   - `training-title` field presence
   - `training-description` field presence
   - Section title mapping (`type1_1:title`)

4. **Stats Validation**:
   - Section count matches input
   - Quiz count matches input
   - Tags properly replaced

## 🔧 Test Geliştirme

### Yeni Test Ekleme

1. Test dosyasını `TestCases/inputs/xl-inputs/` klasörüne ekle
2. Beklenen output'u `TestCases/outputs/xl-outputs/` klasörüne ekle
3. Test otomatik olarak çalışacak

### Test Dosyası Formatı

**Input Format** (XL Input):
```json
{
  "CourseInfo": {
    "Title": "Course Title",
    "Description": "Course Description"
  },
  "Sections": [
    {
      "Index": 1,
      "Title": "Section Title",
      "Content": {...},
      "NarrationText": "..."
    }
  ],
  "GeneralQuiz": [
    {
      "Index": 1,
      "Question": "...",
      "Options": [...],
      "CorrectAnswers": [...]
    }
  ]
}
```

**Expected Output Format** (XL Output):
```json
{
  "present": {...},
  "training-title": "Course Title",
  "training-description": "Course Description",
  "type1_1:title": "Section Title",
  ...
}
```

## 🐛 Debugging

### Test Başarısız Olursa

1. **Console Output'u Kontrol Et**:
   ```bash
   npm run test:xl -- --verbose
   ```

2. **Specific Test Çalıştır**:
   ```bash
   npm run test:xl -- --testNamePattern="Test Case 3"
   ```

3. **Coverage Report İncele**:
   ```bash
   npm run test:coverage
   ```

### Yaygın Sorunlar

1. **File Not Found**: Test dosyalarının doğru konumda olduğundan emin ol
2. **Template Mismatch**: Template dosyalarının güncel olduğunu kontrol et
3. **Timeout**: Büyük dosyalar için test timeout'unu artır

## 📈 Continuous Integration

Bu testler CI/CD pipeline'ında şu şekilde çalıştırılabilir:

```yaml
# GitHub Actions örneği
- name: Run XL Conversion Tests
  run: |
    cd converter-api
    npm install
    npm run test:xl
```

## 🎯 TDD Prensipleri

1. **Red**: Önce test yaz, başarısız ol
2. **Green**: Kodu yaz, test geçsin
3. **Refactor**: Kodu iyileştir, testler geçmeye devam etsin

Bu TDD implementasyonu ile XL conversion'ın her zaman doğru çalıştığından emin olabilirsiniz!
