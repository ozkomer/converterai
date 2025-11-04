import { Logger } from '../utils/logger';

interface BoxInfo {
  boxId: string;
  parent: string;
  pluginId: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'other';
  position?: { x: string; y: string; type: string };
}

interface SceneStats {
  pageId: string;
  textCount: number;
  imageCount: number;
  audioCount: number;
  videoCount: number;
  otherCount: number;
  totalBoxes: number;
  boxes: BoxInfo[];
  estimatedSceneType?: string;
}

export class ScenePredictor {
  /**
   * Template'den box'ları analiz edip sahne istatistiklerini çıkarır
   */
  analyzeBoxes(template: any): Map<string, SceneStats> {
    const scenes = new Map<string, SceneStats>();
    
    if (!template.present?.boxesById) {
      Logger.warn('No boxesById found in template');
      return scenes;
    }

    const pluginToolbarsById = template.present.pluginToolbarsById || {};
    const viewToolbarsById = template.present.viewToolbarsById || {};
    const boxesById = template.present.boxesById;

    // Her box'ı işle
    for (const boxId of Object.keys(boxesById)) {
      const box = boxesById[boxId];
      const parent = box.parent || box.box?.parent;
      
      if (!parent || !parent.startsWith('pa-')) {
        continue; // Geçerli bir page ID değil
      }

      // PluginId'yi bul
      let pluginId = '';
      let boxInfo: BoxInfo = {
        boxId,
        parent,
        pluginId: '',
        type: 'other'
      };

      // Önce pluginToolbarsById'de ara
      const toolbar = pluginToolbarsById[boxId] || viewToolbarsById[boxId] || box.toolbar;
      if (toolbar) {
        pluginId = toolbar.pluginId || '';
      } else if (box.pluginId) {
        pluginId = box.pluginId;
      }

      // Box tipini belirle
      if (pluginId === 'BasicText' || pluginId === 'RichText') {
        boxInfo.type = 'text';
      } else if (pluginId === 'ImageBox' || pluginId === 'HotspotImages' || pluginId === 'Image') {
        boxInfo.type = 'image';
      } else if (pluginId === 'AudioBox' || pluginId === 'SoundBox' || pluginId === 'Audio') {
        boxInfo.type = 'audio';
      } else if (pluginId === 'VideoBox' || pluginId === 'Video') {
        boxInfo.type = 'video';
      }

      boxInfo.pluginId = pluginId;
      boxInfo.position = box.position || box.box?.position;

      // Sahne istatistiklerini güncelle
      if (!scenes.has(parent)) {
        scenes.set(parent, {
          pageId: parent,
          textCount: 0,
          imageCount: 0,
          audioCount: 0,
          videoCount: 0,
          otherCount: 0,
          totalBoxes: 0,
          boxes: []
        });
      }

      const scene = scenes.get(parent)!;
      scene.boxes.push(boxInfo);
      scene.totalBoxes++;

      switch (boxInfo.type) {
        case 'text':
          scene.textCount++;
          break;
        case 'image':
          scene.imageCount++;
          break;
        case 'audio':
          scene.audioCount++;
          break;
        case 'video':
          scene.videoCount++;
          break;
        default:
          scene.otherCount++;
      }
    }

    // Her sahne için tahmin yap
    for (const scene of scenes.values()) {
      scene.estimatedSceneType = this.predictSceneType(scene);
    }

    return scenes;
  }

  /**
   * Sahne istatistiklerine göre sahne tipini tahmin eder
   */
  private predictSceneType(stats: SceneStats): string {
    const { textCount, imageCount, audioCount, videoCount, totalBoxes } = stats;

    // Basit kurallar tabanlı tahmin (geliştirilebilir)
    
    // Video içeren sahneler (öncelikli)
    if (videoCount > 0) {
      if (textCount > 0 && imageCount > 0) return 'Type12'; // Text + Image + Video
      if (textCount > 0) return 'Type13'; // Text + Video
      return 'Type14'; // Sadece Video
    }

    // Audio içeren sahneler
    if (audioCount > 0) {
      if (textCount > 0 && imageCount > 0) return 'Type10'; // Text + Image + Audio
      if (textCount > 0) return 'Type11'; // Text + Audio
    }

    // Sadece text varsa
    if (textCount > 0 && imageCount === 0 && audioCount === 0 && videoCount === 0) {
      if (textCount === 1) return 'Type1'; // Tek başlık
      if (textCount === 2) return 'Type2'; // Başlık + paragraf
      if (textCount === 3) return 'Type3'; // Başlık + 2 paragraf
      if (textCount === 4) return 'Type4'; // Başlık + 3 paragraf
      if (textCount >= 5) return 'Type23'; // Çoklu metin (5+)
    }

    // Text + Image kombinasyonları (en yaygın)
    if (textCount > 0 && imageCount > 0) {
      // 1 görsel durumları
      if (imageCount === 1) {
        if (textCount === 1) return 'Type5'; // Başlık + görsel
        if (textCount === 2) return 'Type6'; // Başlık + paragraf + görsel
        if (textCount === 3) return 'Type7'; // Başlık + 2 paragraf + görsel
        if (textCount === 4) return 'Type8'; // Başlık + 3 paragraf + görsel
        if (textCount >= 5) return 'Type24'; // Çoklu metin + görsel
      }
      
      // 2 görsel durumları
      if (imageCount === 2) {
        if (textCount <= 3) return 'Type25'; // Az metin + 2 görsel
        if (textCount <= 5) return 'Type26'; // Orta metin + 2 görsel
        return 'Type27'; // Çok metin + 2 görsel
      }
      
      // 3 görsel durumları
      if (imageCount === 3) {
        if (textCount <= 4) return 'Type28'; // Az metin + 3 görsel
        return 'Type29'; // Çok metin + 3 görsel
      }
      
      // 4+ görsel durumları
      if (imageCount >= 4) {
        if (textCount <= 3) return 'Type30'; // Az metin + çok görsel
        if (textCount <= 5) return 'Type31'; // Orta metin + çok görsel
        return 'Type32'; // Çok metin + çok görsel
      }
    }

    // Sadece görsel varsa
    if (imageCount > 0 && textCount === 0) {
      if (imageCount === 1) return 'Type33'; // Tek görsel
      if (imageCount === 2) return 'Type34'; // 2 görsel
      return 'Type35'; // Çoklu görsel
    }

    // Diğer kombinasyonlar
    if (totalBoxes === 0) return 'Type0'; // Boş sahne
    if (totalBoxes === 1) return 'Type1'; // Tek eleman
    if (totalBoxes <= 3) return 'Type15'; // Az elemanlı
    if (totalBoxes <= 5) return 'Type16'; // Orta elemanlı
    return 'Type17'; // Çok elemanlı
  }

  /**
   * Template'den tüm sahne analizini yapar ve JSON olarak döner
   */
  getSceneAnalysis(template: any): {
    scenes: Array<SceneStats>;
    summary: {
      totalScenes: number;
      totalBoxes: number;
      sceneTypes: Record<string, number>;
    };
  } {
    const sceneMap = this.analyzeBoxes(template);
    const scenes = Array.from(sceneMap.values());
    
    const sceneTypes: Record<string, number> = {};
    let totalBoxes = 0;

    scenes.forEach(scene => {
      totalBoxes += scene.totalBoxes;
      const type = scene.estimatedSceneType || 'Unknown';
      sceneTypes[type] = (sceneTypes[type] || 0) + 1;
    });

    return {
      scenes,
      summary: {
        totalScenes: scenes.length,
        totalBoxes,
        sceneTypes
      }
    };
  }
}

