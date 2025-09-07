import type { IControl, Map, ControlPosition } from 'maplibre-gl';

const defaultStyles = `
.layers-control {
  position: relative;
  display: flex;
  align-items: flex-start;
}

.layers-control .panel {
  position: absolute;
  z-index: 1000;
  display: none;
  flex-direction: column;
  background: white;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  min-width: 250px;
  max-height: 700px;
  overflow-y: auto;
  overflow-x: auto;
}

.panel-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.maplibregl-ctrl-top-left > .layers-control .panel,
.maplibregl-ctrl-top-right > .layers-control .panel {
  top: 100%;
}

.maplibregl-ctrl-bottom-left > .layers-control .panel,
.maplibregl-ctrl-bottom-right > .layers-control .panel {
  bottom: 100%;
}

.maplibregl-ctrl-top-left > .layers-control .panel,
.maplibregl-ctrl-bottom-left > .layers-control .panel {
  left: 0;
}

.maplibregl-ctrl-top-right > .layers-control .panel,
.maplibregl-ctrl-bottom-right > .layers-control .panel {
  right: 0;
}

.layers-control.open .panel {
  display: flex;
}

.layers-toggle-btn {
  width: 40px;
  height: 40px;
  background-color: #fff;
  /*border: none;*/
  cursor: pointer;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M296.5 69.2C311.4 62.3 328.6 62.3 343.5 69.2L562.1 170.2C570.6 174.1 576 182.6 576 192C576 201.4 570.6 209.9 562.1 213.8L343.5 314.8C328.6 321.7 311.4 321.7 296.5 314.8L77.9 213.8C69.4 209.8 64 201.3 64 192C64 182.7 69.4 174.1 77.9 170.2L296.5 69.2zM112.1 282.4L276.4 358.3C304.1 371.1 336 371.1 363.7 358.3L528 282.4L562.1 298.2C570.6 302.1 576 310.6 576 320C576 329.4 570.6 337.9 562.1 341.8L343.5 442.8C328.6 449.7 311.4 449.7 296.5 442.8L77.9 341.8C69.4 337.8 64 329.3 64 320C64 310.7 69.4 302.1 77.9 298.2L112 282.4zM77.9 426.2L112 410.4L276.3 486.3C304 499.1 335.9 499.1 363.6 486.3L527.9 410.4L562 426.2C570.5 430.1 575.9 438.6 575.9 448C575.9 457.4 570.5 465.9 562 469.8L343.4 570.8C328.5 577.7 311.3 577.7 296.4 570.8L77.9 469.8C69.4 465.8 64 457.3 64 448C64 438.7 69.4 430.1 77.9 426.2z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
}

.layer-group {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.layers-control .panel::-webkit-scrollbar {
  width: 6px;
}

.layers-control .panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.layer-name-label {
  font-size: 16px;
  margin-left: 4px;
}

.opacity-row input[type="range"] {
  width: 95%;
}

`

type LayersControlOptions = {
  title?: string;
  legendServiceUrl?: string;
  opacityControl: boolean;
};

const defaultOptions: LayersControlOptions = {
  title: 'Layers Control',
  legendServiceUrl: undefined,
  opacityControl: false,
};

class LayersControl implements IControl {
  private map?: Map;
  private container!: HTMLDivElement;
  private panel!: HTMLDivElement;
  private toggleBtn!: HTMLButtonElement;

  private title?: string;
  private legendServiceUrl?: string;
  private opacityControlOption: boolean;

  constructor(options: Partial<LayersControlOptions>) {
    this.title = options.title ?? defaultOptions.title;
    this.legendServiceUrl = options.legendServiceUrl;
    this.opacityControlOption = options.opacityControl ?? defaultOptions.opacityControl;
  }

  private injectStyles() {
    if (document.getElementById('layers-control-styles')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'layers-control-styles';
    styleEl.textContent = defaultStyles;
    document.head.appendChild(styleEl);
  }

  private createToggleButton() {
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'maplibregl-ctrl-icon layers-toggle-btn';
    this.toggleBtn.type = 'button';
    this.toggleBtn.title = this.title!;
    this.toggleBtn.setAttribute('aria-label', 'Mostrar capas');
    this.toggleBtn.addEventListener('click', () => {
      this.container.classList.toggle('open');
    });
    this.container.appendChild(this.toggleBtn);
  }

  private getBaseLayerIds(): string[] {
    return this.map!
      .getStyle()
      // @ts-ignore: implicit any en layer
      .layers?.filter(l => l.metadata?.isbaselayer)
      // @ts-ignore: implicit any en layer
      .map(l => l.id) ?? [];
  }

  private buildPanel() {
    this.panel.innerHTML = `<h2 class='panel-title'>${this.title}</h2>`;
    const layers = this.map!.getStyle().layers ?? [];
    // @ts-ignore: implicit any
    layers.slice().reverse().forEach((layer) => {
      const { id, type, metadata } = layer;
      const labelTitle = layer.metadata?.alias ?? id;
      const group = document.createElement('div');
      group.className = 'layer-group';

      if (type === 'raster' && metadata?.isbaselayer) {
        this.radioButtonControlAdd(id, labelTitle, group);
      } else {
        this.checkBoxControlAdd(id, labelTitle, group);
      }

      if (this.opacityControlOption) {
        this.rangeControlAdd(id, type, group);
      }

      if (this.legendServiceUrl) {
        this.fetchAndRenderLegend(id, group);
      }

      this.panel.appendChild(group);
    });
  }

  private radioButtonControlAdd(
    layerId: string,
    labelTitle: string,
    parent: HTMLElement
  ) {
    const baseIds = this.getBaseLayerIds();
    const initId = baseIds[0];
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'base-layer';
    input.id = layerId;

    if (layerId === initId) {
      input.checked = true;
      this.map!.setLayoutProperty(layerId, 'visibility', 'visible');
    } else {
      this.map!.setLayoutProperty(layerId, 'visibility', 'none');
    }

    input.addEventListener('change', () => {
      baseIds.forEach(id => {
        const checked = (id === layerId);
        this.map!.setLayoutProperty(id, 'visibility', checked ? 'visible' : 'none');
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el) el.checked = checked;
      });
    });

    // Label
    const label = document.createElement('label');
    label.htmlFor = layerId;
    label.className = 'layer-name-label';
    label.textContent = labelTitle;

    parent.append(input, label);
  }

  private checkBoxControlAdd(layerId: string, labelTitle: string, parent: HTMLElement) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = layerId;

    const vis = this.map!.getLayoutProperty(layerId, 'visibility') === 'visible';
    input.checked = vis;
    this.map!.setLayoutProperty(layerId, 'visibility', vis ? 'visible' : 'none');

    input.addEventListener('change', (e) => {
      const chk = (e.target as HTMLInputElement).checked;
      this.map!.setLayoutProperty(layerId, 'visibility', chk ? 'visible' : 'none');
    });

    const label = document.createElement('label');
    label.htmlFor = layerId;
    label.className = 'layer-name-label'
    label.textContent = labelTitle

    parent.append(input, label);
  }

  private rangeControlAdd(layerId: string, type: string, parent: HTMLElement) {
    const wrapper = document.createElement('div');
    wrapper.className = 'opacity-row';

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';

    let propKey: string;

    if (type !== 'symbol') {
      propKey = `${type}-opacity`;
    } else {
      propKey = 'text-opacity';
    }

    const curr = Number(this.map!.getPaintProperty(layerId, propKey));
    range.value = isNaN(curr) ? '100' : String(Math.round(curr * 100));

    range.addEventListener('input', (e) => {
      const v = Number((e.target as HTMLInputElement).value) / 100;
      this.map!.setPaintProperty(layerId, propKey, v);
    });

    wrapper.append(range);
    parent.append(wrapper);
  }

  private async fetchAndRenderLegend(layerId: string, parent: HTMLElement) {
    const url = new URL(this.legendServiceUrl!);
    url.searchParams.set('layer_id', layerId);
    url.searchParams.set('has_label', 'false');
    url.searchParams.set('include_raster', 'true');

    const legend = document.createElement('div');
    legend.className = 'legend-svg';
    legend.textContent = 'Cargando…';
    parent.appendChild(legend);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(String(res.status));
      const svg = await res.text();
      legend.innerHTML = svg;
    } catch (err) {
      legend.textContent = `Error leyenda: ${err}`;
      legend.style.color = 'red';
    }
  }

  onAdd(map: Map): HTMLElement {
    this.map = map;

    this.injectStyles();

    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl layers-control';

    this.createToggleButton();

    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    this.container.appendChild(this.panel);

    map.on('load', () => this.buildPanel());

    return this.container;
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container);
    this.map = undefined;
  }

  getDefaultPosition(): ControlPosition {
    return 'top-left';
  }
}

(function(global) {
  global.LayersControl = LayersControl;
})(window);

export default LayersControl;
