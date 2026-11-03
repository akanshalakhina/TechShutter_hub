const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '..', 'public', 'assets', 'drive_media');
const optDir = path.join(__dirname, '..', 'public', 'assets', 'optimized');
const thumbDir = path.join(__dirname, '..', 'public', 'assets', 'thumbs');

fs.mkdirSync(optDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

async function processAll() {
  const files = fs.readdirSync(mediaDir)
    .filter(f => !f.endsWith('.part') && /\.(jpe?g|png|webp)$/i.test(f));
  
  console.log(`Processing ${files.length} images...`);
  const metaList = [];

  for (const file of files) {
    const srcPath = path.join(mediaDir, file);
    const cleanName = file.replace(/[\s()]/g, '_');
    const optPath = path.join(optDir, cleanName);
    const thumbPath = path.join(thumbDir, cleanName);

    try {
      const image = sharp(srcPath);
      const metadata = await image.metadata();
      const isPortrait = metadata.height > metadata.width;

      if (!fs.existsSync(optPath)) {
        await sharp(srcPath)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toFile(optPath);
      }

      if (!fs.existsSync(thumbPath)) {
        await sharp(srcPath)
          .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toFile(thumbPath);
      }

      metaList.push({
        original: file,
        cleanName,
        optPath: `/assets/optimized/${cleanName}`,
        thumbPath: `/assets/thumbs/${cleanName}`,
        width: metadata.width,
        height: metadata.height,
        orientation: isPortrait ? 'portrait' : 'landscape'
      });
      process.stdout.write('.');
    } catch (err) {
      console.error(`\nError processing ${file}:`, err.message);
    }
  }

  console.log('\nProcessed', metaList.length, 'images successfully.');
  fs.writeFileSync(path.join(__dirname, 'media-meta.json'), JSON.stringify(metaList, null, 2));
}

processAll();

