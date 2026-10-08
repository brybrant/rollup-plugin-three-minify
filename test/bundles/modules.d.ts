declare module '*.glsl' {
  const source: string;
  export default source;
}

// These values are injected into the `window` (`globalThis`) object.
// The real values obviously change depending on the revision of Three.js
// currently being tested, but we lie to TypeScript for convenience.
interface Window {
  _Revision: number;
  _ColorSpace: 'colorSpace';
  _sRGB: 'SRGBColorSpace';
  _OctetFormat: import('three').PixelFormat;
}
