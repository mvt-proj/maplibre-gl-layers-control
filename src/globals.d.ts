// forzamos a TS a tratar este archivo como módulo
export {};

declare global {
  interface Window {
    LayersControl: typeof LayersControl;
  }
}
