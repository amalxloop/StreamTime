const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface ShareCardData {
  title: string;
  rating: number;
  review: string | null;
  posterPath: string | null;
  mediaType: string;
  source: string;
}

export async function generateShareCardImage(data: ShareCardData): Promise<Blob> {
  const { title, rating, review, posterPath, mediaType, source } = data;

  const WIDTH = 600;
  const HEIGHT = 750;
  const PADDING = 40;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#0f0f1a');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw border rounded rect
  ctx.strokeStyle = '#2a2a3e';
  ctx.lineWidth = 2;
  ctx.roundRect(6, 6, WIDTH - 12, HEIGHT - 12, 16);
  ctx.stroke();

  // Logo: ST monogram + STREAMTIME subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px Arial, Helvetica, sans-serif';
  ctx.fillText('ST', PADDING, PADDING + 20);

  ctx.fillStyle = '#888888';
  ctx.font = '700 14px Arial, Helvetica, sans-serif';
  ctx.fillText('STREAMTIME', PADDING, PADDING + 48);

  // Load poster image if available
  let posterImg: HTMLImageElement | null = null;
  const imageUrl = source === 'tmdb' && posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : posterPath;
  if (imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const loaded = new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej();
      });
      img.src = imageUrl;
      await loaded;
      posterImg = img;
    } catch {}
  }

  const centerY = HEIGHT / 2 - 50;

  // Poster
  if (posterImg) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(PADDING, centerY - 75, 100, 150, 10);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(posterImg, PADDING, centerY - 75, 100, 150);
    ctx.restore();
  }

  const textX = PADDING + 120;

  // Media Type badge
  ctx.fillStyle = '#ff6b35';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(mediaType.toUpperCase(), textX, centerY - 60);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  const titleParts = splitTextToFit(ctx, title, WIDTH - textX - PADDING, 2);
  titleParts.forEach((line, i) => {
    ctx.fillText(line, textX, centerY - 38 + i * 28);
  });

  // Rating dots: 1-5 pills matching the app UI
  const dotY = centerY + 30;
  const dotSize = 28;
  const dotGap = 6;
  const totalWidth = 5 * dotSize + 4 * dotGap;
  const remainingWidth = WIDTH - textX - PADDING;
  const dotX = textX + Math.max(0, (remainingWidth - totalWidth) / 2);
  for (let i = 0; i < 5; i++) {
    const num = i + 1;
    const filled = num <= rating;
    const x = dotX + i * (dotSize + dotGap);

    ctx.fillStyle = filled ? '#ff6b35' : '#2a2a3e';
    ctx.beginPath();
    ctx.roundRect(x, dotY - dotSize / 2, dotSize, dotSize, 6);
    ctx.fill();

    if (num === rating) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, dotY - dotSize / 2, dotSize, dotSize, 6);
      ctx.stroke();
    }

    ctx.fillStyle = filled ? '#ffffff' : '#666666';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(String(num), x + 9, dotY + 5);
  }

  // Rating text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText(`${rating}/5`, textX + 5 * (dotSize + dotGap) + 12, dotY + 6);

  // Review
  if (review) {
    ctx.fillStyle = '#cccccc';
    ctx.font = 'italic 18px Arial, sans-serif';
    const reviewLines = splitTextToFit(ctx, `"${review}"`, WIDTH - PADDING * 3 - 80, 4);
    const reviewY = dotY + 45;
    reviewLines.forEach((line, i) => {
      ctx.fillText(line, textX, reviewY + i * 26);
    });
  }

  // Footer
  ctx.fillStyle = '#555555';
  ctx.font = '12px sans-serif';
  ctx.fillText('Shared from StreamTime', WIDTH / 2 - 70, HEIGHT - PADDING);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate blob'));
    }, 'image/png');
  });
}

function splitTextToFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      if (lines.length >= maxLines) break;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}
