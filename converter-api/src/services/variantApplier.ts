import { VariantFeature } from './variantService';

export class VariantApplier {
  apply(template: any, feature: VariantFeature): any {
    if (!template || !template.pages) return template;

    const updated = JSON.parse(JSON.stringify(template));

    for (const pageId of Object.keys(updated.pages)) {
      const page = updated.pages[pageId];

      // Apply background
      if (feature.background.style === 'solid') {
        page.background = feature.background.value;
        page.backgroundAttr = page.backgroundAttr ?? '';
      } else if (feature.background.style === 'image') {
        page.background = feature.background.value;
        page.backgroundAttr = 'full';
      } else if (feature.background.style === 'video') {
        page.background = page.background ?? '#ffffff';
        page.backgroundAttr = page.backgroundAttr ?? '';
      }

      // Apply mandatory settings
      page.isMandatory = feature.mandatory.isMandatory;
      page.mandatoryType = feature.mandatory.type;
    }

    // Apply logo if present
    if (feature.logo.present && feature.logo.position) {
      this.addLogoBox(updated, feature);
    }

    // Apply layout (headline placement)
    this.applyLayout(updated, feature);

    // Apply typography styles
    this.applyTypography(updated, feature);

    // Apply animations
    this.applyAnimations(updated, feature);

    // Apply media
    this.applyMedia(updated, feature);

    return updated;
  }

  private addLogoBox(template: any, feature: VariantFeature): void {
    if (!template.boxesById) return;

    const logoBoxId = 'bo-variant-logo';
    const pageId = Object.keys(template.pages)[0];
    if (!pageId) return;

    const position = this.getLogoPosition(feature.logo.position);
    const size = this.getLogoSize(feature.logo.size);

    template.boxesById[logoBoxId] = {
      box: {
        id: logoBoxId,
        parent: pageId,
        container: 0,
        level: 0,
        col: 0,
        row: 0,
        position: position,
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
        id: logoBoxId,
        pluginId: 'ImageBox',
        state: {
          url: '#{[brand-logo-url]}#',
          allowDeformed: false
        },
        structure: {
          height: size.height,
          width: size.width,
          widthUnit: '%',
          heightUnit: '%',
          rotation: 0,
          aspectRatio: true,
          position: 'absolute',
          x: position.x,
          y: position.y
        },
        style: {
          padding: 0,
          backgroundColor: 'rgba(255,255,255,0)',
          borderWidth: 0,
          borderStyle: 'solid',
          borderColor: '#000000',
          borderRadius: 0,
          opacity: 1
        },
        showTextEditor: false,
        position: position
      },
      marks: {},
      childBoxes: {},
      childToolbars: {}
    };
  }

  private getLogoPosition(position: string | null): { x: string; y: string; type: string } {
    if (!position) return { x: '10%', y: '10%', type: 'absolute' };
    
    if (position.includes('top-right')) return { x: '85%', y: '5%', type: 'absolute' };
    if (position.includes('top-left')) return { x: '5%', y: '5%', type: 'absolute' };
    if (position.includes('bottom-right')) return { x: '85%', y: '85%', type: 'absolute' };
    if (position.includes('bottom-left')) return { x: '5%', y: '85%', type: 'absolute' };
    
    return { x: '10%', y: '10%', type: 'absolute' };
  }

  private getLogoSize(size: 'xs' | 'sm' | 'md'): { width: number; height: number } {
    switch (size) {
      case 'xs': return { width: 8, height: 8 };
      case 'sm': return { width: 12, height: 12 };
      case 'md': return { width: 16, height: 16 };
      default: return { width: 12, height: 12 };
    }
  }

  private applyLayout(template: any, feature: VariantFeature): void {
    if (!template.boxesById) return;

    const headlineBoxId = 'bo-variant-headline';
    const headlineBox = template.boxesById[headlineBoxId];
    if (!headlineBox) return;

    const placement = feature.layout.headlinePlacement;
    const position = this.getHeadlinePosition(placement);

    headlineBox.box.position = position;
    headlineBox.toolbar.structure.x = position.x;
    headlineBox.toolbar.structure.y = position.y;
    headlineBox.toolbar.position = position;
  }

  private getHeadlinePosition(placement: string): { x: string; y: string; type: string } {
    if (placement.includes('top-center')) return { x: '50%', y: '15%', type: 'absolute' };
    if (placement.includes('top-left')) return { x: '10%', y: '15%', type: 'absolute' };
    if (placement.includes('right/center')) return { x: '60%', y: '40%', type: 'absolute' };
    if (placement.includes('right/middle')) return { x: '60%', y: '45%', type: 'absolute' };
    if (placement.includes('left/top')) return { x: '10%', y: '20%', type: 'absolute' };
    if (placement.includes('center')) return { x: '50%', y: '40%', type: 'absolute' };
    if (placement.includes('under-hero')) return { x: '50%', y: '60%', type: 'absolute' };
    
    return { x: '10%', y: '20%', type: 'absolute' };
  }

  private applyTypography(template: any, feature: VariantFeature): void {
    if (!template.boxesById) return;

    const contrastColors = {
      'low': { color: '#666666', backgroundColor: 'rgba(255,255,255,0.8)' },
      'normal': { color: '#333333', backgroundColor: 'rgba(255,255,255,0)' },
      'medium': { color: '#222222', backgroundColor: 'rgba(255,255,255,0.9)' },
      'high': { color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.5)' },
      'very-high': { color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.7)' }
    };

    const colors = contrastColors[feature.typography.contrast] || contrastColors['normal'];

    for (const boxId of Object.keys(template.boxesById)) {
      const box = template.boxesById[boxId];
      if (box.toolbar && box.toolbar.pluginId === 'BasicText') {
        if (!box.toolbar.style) box.toolbar.style = {};
        box.toolbar.style.color = colors.color;
        if (feature.typography.contrast === 'high' || feature.typography.contrast === 'very-high') {
          box.toolbar.style.backgroundColor = colors.backgroundColor;
          box.toolbar.style.padding = 10;
        }
      }
    }
  }

  private applyAnimations(template: any, feature: VariantFeature): void {
    if (!template.boxesById || feature.animations.presets.length === 0) return;

    for (const boxId of Object.keys(template.boxesById)) {
      const box = template.boxesById[boxId];
      if (box.toolbar && box.toolbar.pluginId === 'BasicText') {
        if (!box.toolbar.state) box.toolbar.state = {};
        if (feature.animations.presets.includes('wavyText')) {
          box.toolbar.state.animation = 'wavy';
        } else if (feature.animations.presets.includes('scaleIn')) {
          box.toolbar.state.animation = 'scaleIn';
        }
      }
    }
  }

  private applyMedia(template: any, feature: VariantFeature): void {
    if (!template.boxesById) return;

    if (feature.media.video && feature.background.style === 'video') {
      const pageId = Object.keys(template.pages)[0];
      if (!pageId) return;

      const videoBoxId = 'bo-variant-video';
      template.boxesById[videoBoxId] = {
        box: {
          id: videoBoxId,
          parent: pageId,
          container: 0,
          level: 0,
          col: 0,
          row: 0,
          position: { x: '0%', y: '0%', type: 'absolute' },
          content: {},
          draggable: false,
          resizable: false,
          showTextEditor: false,
          fragment: {},
          children: [],
          sortableContainers: {},
          containedViews: []
        },
        toolbar: {
          id: videoBoxId,
          pluginId: 'VideoBox',
          state: {
            url: '#{[hero-video-url]}#',
            autoplay: true,
            loop: true,
            muted: true
          },
          structure: {
            height: 100,
            width: 100,
            widthUnit: '%',
            heightUnit: '%',
            rotation: 0,
            aspectRatio: true,
            position: 'absolute',
            x: '0%',
            y: '0%'
          },
          style: {
            padding: 0,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            borderStyle: 'solid',
            borderColor: '#000000',
            borderRadius: 0,
            opacity: 1
          },
          showTextEditor: false,
          position: { x: '0%', y: '0%', type: 'absolute' }
        },
        marks: {},
        childBoxes: {},
        childToolbars: {}
      };
    }
  }
}
