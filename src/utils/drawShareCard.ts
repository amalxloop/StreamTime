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

  // ---------- Layout coordinates ----------
  // Everything is placed incrementally to minimize dead space. The header is at PADDING (40).
  // poster and text sit side by side:
  //   left column: poster        @ x=40
  //   right column: everything else @ x=160
  //   we calculate the lowest_y used and place the footer just below (but not below 650).
  const COL_LEFT = PADDING;                           // 40
  const COL_RIGHT = COL_LEFT + 120;                    // 160
  const COL_TITLE_W = WIDTH - COL_RIGHT - PADDING;     // 400

  // poster top: right after STREAMTIME subtitle + a bit of breathing
  const POSTER_TOP = 130;
  const POSTER_HEIGHT = 150;
  const POSTER_BOT = POSTER_TOP + POSTER_HEIGHT;      // 280

  // Poster
  if (posterImg) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(COL_LEFT, POSTER_TOP, 100, POSTER_HEIGHT, 10);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(posterImg, COL_LEFT, POSTER_TOP, 100, POSTER_HEIGHT);
    ctx.restore();
  }

  // Text right of poster
  let textCursor = POSTER_TOP + 20;  // start at 150

  // Media Type badge
  ctx.fillStyle = '#ff6b35';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(mediaType.toUpperCase(), COL_RIGHT, textCursor);
  textCursor += 24;

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  const titleParts = splitTextToFit(ctx, title, COL_TITLE_W, 2);
  titleParts.forEach((line, i) => {
    ctx.fillText(line, COL_RIGHT, textCursor + i * 28);
  });
  const titleRows = Math.max(titleParts.length, 1);
  textCursor += titleRows * 28 + 16;

  // Ensure cursor is past the poster bottom so nothing overlaps
  if (textCursor < POSTER_BOT + 16) {
    textCursor = POSTER_BOT + 16;
  }

  // Rating dots: 1-5 pills left-aligned with the text
  const dotY = textCursor + 14;   // center of first dot row
  const dotSize = 28;
  const dotGap = 6;
  const dotX = COL_RIGHT;
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
  ctx.fillText(`${rating}/5`, dotX + 5 * (dotSize + dotGap) + 12, dotY + 6);

  textCursor = dotY + dotSize / 2;   // bottom of the dot row

  // Review
  if (review) {
    const reviewY = textCursor + 20;
    ctx.fillStyle = '#cccccc';
    ctx.font = 'italic 18px Arial, sans-serif';
    const reviewLines = splitTextToFit(ctx, `"${review}"`, COL_TITLE_W, 4);
    reviewLines.forEach((line, i) => {
      ctx.fillText(line, COL_RIGHT, reviewY + i * 26);
    });
    textCursor = reviewY + (reviewLines.length) * 26;
  }

  // Footer
  const footerTop = Math.max(textCursor + 60, HEIGHT - 120);
  ctx.fillStyle = '#555555';
  ctx.font = '12px sans-serif';
  ctx.fillText('Shared from StreamTime', WIDTH / 2 - 70, footerTop);

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
