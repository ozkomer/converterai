export class RawTemplateAdapter {
  buildMinimalScene(raw: any): any {
    if (!raw) return { pages: {}, boxesById: {} };

    // If raw already has pages/boxesById (final format), return as-is
    if (raw.pages && raw.boxesById) {
      return { pages: raw.pages, boxesById: raw.boxesById };
    }

    const title = this.extractTitle(raw) || 'Variant Scene';
    const pageId = 'pa-variant-scene';
    const page = {
      id: pageId,
      viewName: title,
      breadcrumb: 'hidden',
      courseTitle: 'hidden',
      documentSubtitle: 'hidden',
      documentSubtitleContent: 'Subtitle',
      documentTitle: 'hidden',
      documentTitleContent: '',
      numPage: 'hidden',
      numPageContent: 1,
      background: '#ffffff',
      backgroundAttr: '',
      aspectRatio: true,
      isMandatory: true,
      mandatoryType: 'waitForSound',
      backgroundZoom: 100,
      backgroundOpacity: 100
    };

    // Attempt to synthesize a headline box from title
    const headlineBoxId = 'bo-variant-headline';
    const headlineBox = {
      box: {
        id: headlineBoxId,
        parent: pageId,
        container: 0,
        level: 0,
        col: 0,
        row: 0,
        position: { x: '10%', y: '20%', type: 'absolute' },
        content: {},
        draggable: true,
        resizable: true,
        showTextEditor: false,
        fragment: {},
        children: [],
        sortableContainers: {},
        containedViews: []
      },
      toolbar: {
        id: headlineBoxId,
        pluginId: 'BasicText',
        state: { __text: encodeURIComponent(`<p><strong>${title}</strong></p>`) },
        structure: { height: 'auto', width: 60, widthUnit: '%', heightUnit: '%', rotation: 0, aspectRatio: false, position: 'absolute', x: '10%', y: '20%' },
        style: { padding: 7, backgroundColor: 'rgba(255,255,255,0)', borderWidth: 0, borderStyle: 'solid', borderColor: '#000000', borderRadius: 0, opacity: 1 },
        showTextEditor: false,
        position: { x: '10%', y: '20%', type: 'absolute' }
      },
      marks: {},
      childBoxes: {},
      childToolbars: {}
    };

    return {
      pages: { [pageId]: page },
      boxesById: { [headlineBoxId]: headlineBox }
    };
  }

  private extractTitle(raw: any): string | null {
    if (!raw) return null;
    if (typeof raw["training-title"] === 'string') return raw["training-title"]; 
    if (raw.title && typeof raw.title === 'string') return raw.title;
    // try nested present/globalConfig
    if (raw.present?.globalConfig?.title) return raw.present.globalConfig.title;
    return null;
  }
}
