export class RawTemplateAdapter {
  buildMinimalScene(raw: any): any {
    if (!raw) return { pages: {}, boxesById: {} };

    // If already in final format (pages/boxesById), return as-is
    if (raw.pages && raw.boxesById) {
      return { pages: raw.pages, boxesById: raw.boxesById };
    }

    // If template has 'present' structure, convert it to pages/boxesById format
    if (raw.present && raw.present.boxesById) {
      return this.convertPresentToPages(raw);
    }

    // Fallback: create minimal scene
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
    if (raw.present?.globalConfig?.title) return raw.present.globalConfig.title;
    return null;
  }

  private convertPresentToPages(raw: any): any {
    const pagesById: Record<string, any> = {};
    const boxesById: Record<string, any> = {};

    if (!raw.present?.boxesById) {
      return { pages: {}, boxesById: {} };
    }

    // Find all unique page IDs (parent IDs from boxes)
    const pageIds = new Set<string>();
    for (const boxId of Object.keys(raw.present.boxesById)) {
      const boxData = raw.present.boxesById[boxId];
      // Box data can be either:
      // 1. Direct format: { id, parent, ... } 
      // 2. Nested format: { box: { id, parent, ... }, toolbar: {...} }
      const parentId = boxData?.parent || boxData?.box?.parent;
      if (parentId && parentId.startsWith('pa-')) {
        pageIds.add(parentId);
      }
    }

    // Create pages from parent IDs
    for (const pageId of pageIds) {
      pagesById[pageId] = {
        id: pageId,
        viewName: this.extractTitle(raw) || `#{[type0:title]}#`,
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
    }

    // Get toolbars if they exist separately
    const pluginToolbarsById = raw.present.pluginToolbarsById || {};
    const viewToolbarsById = raw.present.viewToolbarsById || {};

    // Convert boxes from present format to expected format
    for (const boxId of Object.keys(raw.present.boxesById)) {
      const boxData = raw.present.boxesById[boxId];
      
      // If already in expected format { box: {...}, toolbar: {...} }, use as-is
      if (boxData.box && boxData.toolbar) {
        boxesById[boxId] = boxData;
      } else {
        // Convert from direct format to nested format
        const boxProps: any = {};
        const boxKeys = ['id', 'parent', 'container', 'level', 'col', 'row', 'position', 
                         'content', 'draggable', 'resizable', 'showTextEditor', 'fragment', 
                         'children', 'sortableContainers', 'containedViews'];
        
        // Extract box properties
        for (const key of Object.keys(boxData)) {
          if (boxKeys.includes(key)) {
            boxProps[key] = boxData[key];
          }
        }
        
        // Find corresponding toolbar from pluginToolbarsById or viewToolbarsById
        const toolbar = pluginToolbarsById[boxId] || viewToolbarsById[boxId] || null;
        
        boxesById[boxId] = {
          box: boxProps,
          toolbar: toolbar || { id: boxId }, // Fallback empty toolbar
          marks: boxData.marks || {},
          childBoxes: boxData.childBoxes || {},
          childToolbars: boxData.childToolbars || {}
        };
      }
    }

    return { pages: pagesById, boxesById };
  }
}
