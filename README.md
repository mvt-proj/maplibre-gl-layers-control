# LayersControl

LayersControl is a control inspired by [maplibre-gl-opacity](https://github.com/mug-jp/maplibre-gl-opacity). It integrates support for legends and several improvements in layer and transparency management.

## Features

- Layer Visibility: Easily show or hide individual layers.
- Transparency Management: Control the opacity of each layer to create custom visualizations.
- Legend Support: Integrates legends directly into the control for better context.
- Enhanced Management: Offers an improved user experience for managing map layers compared to the original plugin.

## Examples:

### Simple

```html

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LayersControl Example</title>
    <link href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css" rel="stylesheet"/>
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      #map {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
      }

    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script>
    <script src="../dist/maplibre-gl-layers-control.min.js"></script>
    <link href="style.css" rel="stylesheet"/>

    <script>
      const map = new maplibregl.Map({
        container: "map",
        style: "https://demotiles.maplibre.org/style.json",
        center: [0, 0],
        zoom: 1,
      });

      let layersControl = new LayersControl({
        title: 'Layers',
      });
      map.addControl(layersControl, "bottom-left");
    </script>
  </body>
</html>

```

<img width="1020" height="915" alt="imagen" src="https://github.com/user-attachments/assets/ea5a3421-f3ff-464b-9c41-9d426728ea9d" />

### With Opacity Control

```js

      let layersControl = new LayersControl({
        title: 'Layers',
        opacityControl: true,
      });
      map.addControl(layersControl, "bottom-left");
```

<img width="1028" height="921" alt="imagen" src="https://github.com/user-attachments/assets/d41ed7e3-c940-4a14-9cdd-6094e1cd48ed" />


### With Legends Information

Using a legends service such as the one provided by [MVT Server](https://github.com/mvt-proj/mvt-rs).

```js

      let layersControl = new LayersControl({
        title: 'Layers',
        style: "https://example.com/services/legends/public:latam"
        opacityControl: true,
      });
      map.addControl(layersControl, "bottom-left");
```

<img width="1019" height="923" alt="imagen" src="https://github.com/user-attachments/assets/7a4ffcc5-7b73-45b6-925e-3a173ce7a8b4" />




## Ecosystem
LayersControl is part of the mvt-proj ecosystem, along with [MVT Server](https://github.com/mvt-proj/mvt-rs) and [MapLibre Legend](https://github.com/mvt-proj/maplibre-legend).
