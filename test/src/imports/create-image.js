/**
 * @param {string} svg Raw SVG as string
 * @param {number} width SVG width
 * @param {number} height SVG height
 * @returns {Promise<HTMLCanvasElement>} Texture
 */
export function createImage(svg, width, height) {
  const encodedSVG = encodeURIComponent(svg);

  return new Promise((resolve, reject) => {
    const image = new Image(width, height);

    const finish = () => (image.onload = image.onerror = null);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);

      resolve(canvas);

      finish();
    };

    image.onerror = () => {
      reject('Failed to load image');

      finish();
    };

    image.src = `data:image/svg+xml;charset=utf-8,${encodedSVG}`;
  });
}
