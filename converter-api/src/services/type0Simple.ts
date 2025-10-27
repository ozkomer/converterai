export interface Type0Content {
  title: string;
  imageUrl?: string;
  mandatory: boolean;
}

export interface Type0TemplateData {
  brand: string;
  sceneIndex: number;
  pageConfig: any;
  textBox: any;
  imageBox?: any;
  specialContent?: any[];
}

export interface Type0TemplateResult {
  page: any;
  textBox: any;
  imageBox?: any;
  specialContent?: any[];
}

export class Type0SimpleService {
  private templates: Map<string, Type0TemplateData> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // BLUE template
    this.templates.set('blue', {
      brand: 'BLUE',
      sceneIndex: 1,
      pageConfig: {
        "id": "pa-type0-blue",
        "breadcrumb": "hidden",
        "doc_type": "slide",
        "viewName": "{{TITLE}}",
        "courseTitle": "hidden",
        "documentSubtitle": "hidden",
        "documentSubtitleContent": "Alt Başlık",
        "documentTitle": "hidden",
        "documentTitleContent": "",
        "numPage": "hidden",
        "numPageContent": 1,
        "customSize": 0,
        "aspectRatio": true,
        "background": "https://ls.elearningsolutions.net//ContentFiles/IdealStudioFiles/611_e12c9d51-de9f-4d6c-925e-9dff8ad77046.png",
        "backgroundAttr": "full",
        "backgroundZoom": 100,
        "backgroundOpacity": 100,
        "isMandatory": "{{MANDATORY}}",
        "mandatoryType": "waitForSound"
      },
      textBox: JSON.parse(`{
        "box": {
          "id": "bo-type0-text",
          "parent": "pa-type0-blue",
          "container": 0,
          "level": 0,
          "col": 0,
          "row": 0,
          "position": { "x": "47.586200000000005%", "y": "30.790200000000002%", "type": "absolute" },
          "content": {},
          "draggable": true,
          "resizable": true,
          "showTextEditor": false,
          "fragment": {},
          "children": [],
          "sortableContainers": {},
          "containedViews": []
        },
        "toolbar": {
          "id": "bo-type0-text",
          "pluginId": "BasicText",
          "state": {
            "__text": "{{TITLE_TEXT}}"
          },
          "structure": {
            "height": "auto",
            "width": 51.40380952380952,
            "widthUnit": "%",
            "heightUnit": "%",
            "rotation": 0,
            "aspectRatio": false,
            "position": "absolute",
            "x": "47.586200000000005%",
            "y": "30.790200000000002%"
          },
          "style": {
            "padding": 7,
            "backgroundColor": "rgba(255,255,255,0)",
            "borderWidth": 0,
            "borderStyle": "solid",
            "borderColor": "#000000",
            "borderRadius": 0,
            "opacity": 1
          },
          "showTextEditor": false,
          "position": { "x": "47.586200000000005%", "y": "30.790200000000002%", "type": "absolute" }
        },
        "marks": {},
        "childBoxes": {},
        "childToolbars": {}
      }`),
      imageBox: JSON.parse(`{
        "box": {
          "id": "bo-type0-image",
          "parent": "pa-type0-blue",
          "container": 0,
          "level": 0,
          "col": 0,
          "row": 0,
          "position": { "x": "3%", "y": "20.29972752043597%", "type": "absolute" },
          "content": {},
          "draggable": true,
          "resizable": true,
          "showTextEditor": false,
          "fragment": {},
          "children": [],
          "sortableContainers": {},
          "containedViews": []
        },
        "toolbar": {
          "id": "bo-type0-image",
          "pluginId": "HotspotImages",
          "state": {
            "url": "{{IMAGE_URL}}",
            "allowDeformed": true
          },
          "structure": {
            "height": 54.504359673024524,
            "width": 37.18153256704981,
            "widthUnit": "%",
            "heightUnit": "%",
            "rotation": 0,
            "aspectRatio": true,
            "position": "absolute",
            "x": "11.08%",
            "y": "24.82%"
          },
          "style": {
            "padding": 0,
            "backgroundColor": "rgba(255,255,255,0)",
            "borderWidth": 0,
            "borderStyle": "solid",
            "borderColor": "#000000",
            "borderRadius": 0,
            "opacity": 1
          },
          "showTextEditor": false,
          "position": { "x": "3%", "y": "20.29972752043597%", "type": "absolute" }
        },
        "marks": {},
        "childBoxes": {},
        "childToolbars": {}
      }`)
    });

    // SOMPO template
    this.templates.set('sompo', {
      brand: 'SOMPO',
      sceneIndex: 2,
      pageConfig: JSON.parse(`{
        "id": "pa-type0-sompo",
        "breadcrumb": "hidden",
        "doc_type": "slide",
        "viewName": "{{TITLE}}",
        "courseTitle": "hidden",
        "documentSubtitle": "hidden",
        "documentSubtitleContent": "Alt Başlık",
        "documentTitle": "hidden",
        "documentTitleContent": "",
        "numPage": "hidden",
        "numPageContent": 1,
        "customSize": 0,
        "aspectRatio": true,
        "background": "#ffffff",
        "backgroundAttr": "",
        "autoNext": true,
        "isMandatory": {{MANDATORY}},
        "mandatoryType": "waitForVideo"
      }`),
      textBox: JSON.parse(`{
        "box": {
          "id": "bo-type0-text-sompo",
          "parent": "pa-type0-sompo",
          "container": 0,
          "level": 0,
          "col": 0,
          "row": 0,
          "position": { "x": "4.328018223234624%", "y": "16.734143049932523%", "type": "absolute" },
          "content": {},
          "draggable": true,
          "resizable": true,
          "showTextEditor": false,
          "fragment": {},
          "children": [],
          "sortableContainers": {},
          "containedViews": [],
          "textAnimation": {
            "animation": {
              "name": "Scale In",
              "animation": {
                "initial": { "scale": 0, "opacity": 0 },
                "animate": { "scale": 1, "opacity": 1 },
                "transition": { "duration": 1 }
              },
              "duration": 1,
              "delay": 0
            }
          }
        },
        "toolbar": {
          "id": "bo-type0-text-sompo",
          "pluginId": "BasicText",
          "state": {
            "__text": "{{TITLE_TEXT}}"
          },
          "structure": {
            "height": "auto",
            "width": 42.55564356435644,
            "widthUnit": "%",
            "heightUnit": "%",
            "rotation": 0,
            "aspectRatio": false,
            "position": "absolute",
            "x": "6.0396%",
            "y": "28.521099999999997%"
          },
          "style": {
            "padding": 7,
            "backgroundColor": "rgba(255,255,255,0)",
            "borderWidth": 0,
            "borderStyle": "solid",
            "borderColor": "#000000",
            "borderRadius": 0,
            "opacity": 1
          },
          "showTextEditor": false,
          "position": { "x": "4.328018223234624%", "y": "16.734143049932523%", "type": "absolute" }
        },
        "marks": {},
        "childBoxes": {},
        "childToolbars": {}
      }`),
      imageBox: JSON.parse(`{
        "box": {
          "id": "bo-type0-image-sompo",
          "parent": "pa-type0-sompo",
          "container": 0,
          "level": 0,
          "col": 0,
          "row": 0,
          "position": { "x": "48.8119%", "y": "10.21127309859155%", "type": "absolute" },
          "content": {},
          "draggable": true,
          "resizable": true,
          "showTextEditor": false,
          "fragment": {},
          "children": [],
          "sortableContainers": {},
          "containedViews": []
        },
        "toolbar": {
          "id": "bo-type0-image-sompo",
          "pluginId": "HotspotImages",
          "state": {
            "url": "{{IMAGE_URL}}",
            "allowDeformed": true
          },
          "structure": {
            "height": 86.12464788732395,
            "width": 48.027524752475244,
            "widthUnit": "%",
            "heightUnit": "%",
            "rotation": 0,
            "aspectRatio": true,
            "position": "absolute",
            "x": "48.8119%",
            "y": "10.21127309859155%"
          },
          "style": {
            "padding": 0,
            "backgroundColor": "rgba(255,255,255,0)",
            "borderWidth": 0,
            "borderStyle": "solid",
            "borderColor": "#000000",
            "borderRadius": 0,
            "opacity": 1
          },
          "showTextEditor": false,
          "position": { "x": "48.8119%", "y": "10.21127309859155%", "type": "absolute" }
        },
        "marks": {},
        "childBoxes": {},
        "childToolbars": {}
      }`)
    });
  }

  generate(brand: string, content: Type0Content): Type0TemplateResult {
    const template = this.templates.get(brand.toLowerCase());
    
    if (!template) {
      throw new Error(`Template not found for brand: ${brand}`);
    }

    return {
      page: this.replaceInObject(template.pageConfig, content),
      textBox: this.replaceInObject(template.textBox, content),
      imageBox: template.imageBox ? this.replaceInObject(template.imageBox, content) : undefined
    };
  }

  private replaceInObject(obj: any, content: Type0Content): any {
    const str = JSON.stringify(obj);
    const htmlTitle = this.createHtmlTitle(content.title);
    const replaced = str
      .replace(/\{\{TITLE\}\}/g, content.title)
      .replace(/\{\{MANDATORY\}\}/g, String(content.mandatory))
      .replace(/\{\{IMAGE_URL\}\}/g, content.imageUrl || '')
      .replace(/\{\{TITLE_TEXT\}\}/g, htmlTitle);
    
    return JSON.parse(replaced);
  }

  private createHtmlTitle(title: string): string {
    // BLUE theme için özel format
    const escapedTitle = title
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    return `%3Cp%3E%3Cspan%20style=%22font-size:3.5714285714285716em;%22%3E%3Cspan%20style=%22font-family:Alata,sans-serif;%22%3E%3Cspan%20style=%22color:#ffffff;%22%3E${encodeURIComponent(escapedTitle)}%3C/span%3E%3C/span%3E%3C/span%3E%3C/p%3E%0A`;
  }
}

