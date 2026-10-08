/**
 * @param svg Raw SVG as string
 * @param width SVG width
 * @param height SVG height
 * @returns Texture
 */
export function createImage(svg: string, width: number, height: number) {
  const encodedSVG = encodeURIComponent(svg);

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const image = new Image(width, height);

    const finish = () => (image.onload = image.onerror = null);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (context === null) {
        reject(new Error('Failed to load Canvas2D'));
      } else {
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas);
      }

      finish();
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));

      finish();
    };

    image.src = `data:image/svg+xml;charset=utf-8,${encodedSVG}`;
  });
}
