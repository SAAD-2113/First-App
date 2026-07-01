import sharp from 'sharp';

const source = 'src/assets/images/flash_logo_1782807814143.jpg';

async function generate() {
  await sharp(source).resize(192, 192).png().toFile('public/icon-192.png');
  await sharp(source).resize(512, 512).png().toFile('public/icon-512.png');
  
  await sharp({
    create: {
      width: 1080,
      height: 1920,
      channels: 4,
      background: { r: 140, g: 3, b: 3, alpha: 1 }
    }
  }).png().toFile('public/screenshot-1.png');
  
  await sharp({
    create: {
      width: 1080,
      height: 1920,
      channels: 4,
      background: { r: 74, g: 0, b: 2, alpha: 1 }
    }
  }).png().toFile('public/screenshot-2.png');
  
  console.log('Generated PNGs');
}

generate();
