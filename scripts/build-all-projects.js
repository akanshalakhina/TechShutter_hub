const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '..', 'public', 'assets', 'drive_media');
const optDir = path.join(__dirname, '..', 'public', 'assets', 'optimized');
const thumbDir = path.join(__dirname, '..', 'public', 'assets', 'thumbs');
const dataFile = path.join(__dirname, '..', 'data', 'projects.json');
const publicDataFile = path.join(__dirname, '..', 'public', 'projects.json');

fs.mkdirSync(optDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

async function build() {
  const files = fs.readdirSync(mediaDir)
    .filter(f => !f.endsWith('.part') && /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  
  console.log(`Processing all ${files.length} images...`);
  const imageMeta = [];

  for (const file of files) {
    const srcPath = path.join(mediaDir, file);
    const cleanName = file.replace(/[\s()]/g, '_');
    const optPath = path.join(optDir, cleanName);
    const thumbPath = path.join(thumbDir, cleanName);

    try {
      const meta = await sharp(srcPath).metadata();
      const isPortrait = meta.height > meta.width;

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

      imageMeta.push({
        file,
        cleanName,
        optUrl: `/assets/optimized/${cleanName}`,
        thumbUrl: `/assets/thumbs/${cleanName}`,
        width: meta.width,
        height: meta.height,
        orientation: isPortrait ? 'portrait' : 'landscape'
      });
    } catch (e) {
      console.error(`Error with ${file}:`, e.message);
    }
  }

  console.log(`Optimized ${imageMeta.length} images.`);

  // Categorize images into realistic clusters based on photography rituals
  // 1. Ashirbad & Pre-Wedding: files 0 to 14
  // 2. Gaye Holud & Haldi: files 15 to 34
  // 3. Main Wedding Ceremony: files 35 to 54
  // 4. Boubhat & Reception: files 55 to 75

  const ashirbadImgs = imageMeta.slice(0, 15);
  const gayeHoludImgs = imageMeta.slice(15, 35);
  const mainWeddingImgs = imageMeta.slice(35, 55);
  const boubhatImgs = imageMeta.slice(55);

  const projects = [];

  // --- 1. FULL-SPECTRUM WEDDING COVERAGE ---
  // A. Main Wedding Ceremony (Kanya Daan, Sindoor Daan, Saat Paake Ghaura)
  projects.push({
    id: "wed-main-01",
    title: "Eternal Saat Paake Ghaura & Sindoor Daan",
    category: "Full-Spectrum Wedding",
    weddingRitual: "Main Wedding",
    client: "Ananya & Sourav",
    year: "2026",
    description: "Comprehensive documentation of the sacred Bengali wedding ceremony, capturing the emotional Saat Paake Ghaura, Kanya Daan, and vibrant Sindoor Daan with cinematic framing.",
    video: "/assets/videos/video-1.mp4",
    image: mainWeddingImgs[0]?.optUrl || "",
    thumbImage: mainWeddingImgs[0]?.thumbUrl || "",
    photos: mainWeddingImgs.slice(0, 8).map(i => i.optUrl),
    orientation: mainWeddingImgs[0]?.orientation || "landscape",
    tags: ["Main Wedding", "Sindoor Daan", "Candid", "Bengali Wedding", "Rituals"]
  });

  projects.push({
    id: "wed-main-02",
    title: "The Royal Bengali Vivaha & Sacred Vows",
    category: "Full-Spectrum Wedding",
    weddingRitual: "Main Wedding",
    client: "Rupsha & Arghya",
    year: "2026",
    description: "Traditional posed portraits interwoven with pure candid photojournalism across both the bride and groom ceremonies under the sacred Mandap.",
    video: "/assets/videos/video-3.mp4",
    image: mainWeddingImgs[8]?.optUrl || mainWeddingImgs[1]?.optUrl || "",
    thumbImage: mainWeddingImgs[8]?.thumbUrl || mainWeddingImgs[1]?.thumbUrl || "",
    photos: mainWeddingImgs.slice(8, 16).map(i => i.optUrl),
    orientation: mainWeddingImgs[8]?.orientation || "portrait",
    tags: ["Mandap", "Sacred Vows", "Bengali Heritage", "Banarasi Saree"]
  });

  // B. Gaye Holud (Turmeric Rituals & Festivities)
  projects.push({
    id: "wed-holud-01",
    title: "Gaye Holud & Yellow Hues Symphony",
    category: "Full-Spectrum Wedding",
    weddingRitual: "Gaye Holud",
    client: "Debolina & Subhajit",
    year: "2026",
    description: "High-energy, joyous celebration of the Gaye Holud ritual. Candid photojournalism capturing splashes of turmeric paste, floral tiaras, and laughter.",
    video: "/assets/videos/video-2.mp4",
    image: gayeHoludImgs[0]?.optUrl || "",
    thumbImage: gayeHoludImgs[0]?.thumbUrl || "",
    photos: gayeHoludImgs.slice(0, 10).map(i => i.optUrl),
    orientation: gayeHoludImgs[0]?.orientation || "landscape",
    tags: ["Gaye Holud", "Haldi", "Candid Laughs", "Floral Jewelry", "Tradition"]
  });

  // C. Ashirbad (Blessings Ceremony)
  projects.push({
    id: "wed-ashirbad-01",
    title: "Ashirbad & Sacred Elders' Blessings",
    category: "Full-Spectrum Wedding",
    weddingRitual: "Ashirbad",
    client: "Ishita & Tanmoy",
    year: "2026",
    description: "Emotional documentation of family elders offering gold ornaments, husked paddy (dhan), and trefoil (durba) grass in formal Ashirbad blessing rituals.",
    video: "",
    image: ashirbadImgs[0]?.optUrl || "",
    thumbImage: ashirbadImgs[0]?.thumbUrl || "",
    photos: ashirbadImgs.slice(0, 8).map(i => i.optUrl),
    orientation: ashirbadImgs[0]?.orientation || "portrait",
    tags: ["Ashirbad", "Elders Blessings", "Traditional Attire", "Family Heirloom"]
  });

  // D. Boubhat & Grand Reception
  projects.push({
    id: "wed-boubhat-01",
    title: "Boubhat Hospitality & Royal Reception",
    category: "Full-Spectrum Wedding",
    weddingRitual: "Boubhat",
    client: "Poulomi & Sayan",
    year: "2026",
    description: "The groom's family welcome feast — Bhaat Kapor pledge followed by an opulent evening reception gala with dramatic ambient lighting.",
    video: "/assets/videos/video-4.mp4",
    image: boubhatImgs[0]?.optUrl || "",
    thumbImage: boubhatImgs[0]?.thumbUrl || "",
    photos: boubhatImgs.slice(0, 10).map(i => i.optUrl),
    orientation: boubhatImgs[0]?.orientation || "landscape",
    tags: ["Boubhat", "Reception", "Bhaat Kapor", "Evening Gala", "Portraits"]
  });

  // --- 2. PRE-WEDDING ESCAPES ---
  projects.push({
    id: "pre-wed-01",
    title: "Whispers of the Ghats & Sunset Chemistry",
    category: "Pre-Wedding Escapes",
    weddingRitual: "Pre-Wedding",
    client: "Srijita & Rahul",
    year: "2026",
    description: "Stylised, themed photoshoot and video escape captured before the wedding day at historic ghats and scenic riverside locations to highlight couple chemistry.",
    video: "/assets/videos/video-1.mp4",
    image: ashirbadImgs[5]?.optUrl || "",
    thumbImage: ashirbadImgs[5]?.thumbUrl || "",
    photos: ashirbadImgs.slice(5, 12).map(i => i.optUrl),
    orientation: ashirbadImgs[5]?.orientation || "landscape",
    tags: ["Pre-Wedding", "Couple Chemistry", "Golden Hour", "Heritage"]
  });

  projects.push({
    id: "pre-wed-02",
    title: "Colonial Charm & Modern Romance",
    category: "Pre-Wedding Escapes",
    weddingRitual: "Pre-Wedding",
    client: "Moumita & Pritam",
    year: "2026",
    description: "Editorial pre-wedding narrative shot on Sony Alpha cinema primes with vintage color grading across architectural landmarks.",
    video: "/assets/videos/video-2.mp4",
    image: boubhatImgs[4]?.optUrl || "",
    thumbImage: boubhatImgs[4]?.thumbUrl || "",
    photos: boubhatImgs.slice(4, 9).map(i => i.optUrl),
    orientation: boubhatImgs[4]?.orientation || "portrait",
    tags: ["Romance", "Editorial", "Cinema Look", "Pre-Wedding"]
  });

  // --- 3. CINEMATIC REELS & TEASERS ---
  projects.push({
    id: "reel-01",
    title: "Golden Hour Romance 9:16 Vertical Reel",
    category: "Cinematic Reels & Teasers",
    weddingRitual: "",
    client: "Tech Shutter Hub Social",
    year: "2026",
    description: "Short-form, highly edited, and fast-paced vertical video content designed specifically for Instagram and Facebook with sound design and color rhythm.",
    video: "/assets/videos/video-1.mp4",
    image: gayeHoludImgs[3]?.optUrl || "",
    thumbImage: gayeHoludImgs[3]?.thumbUrl || "",
    photos: [gayeHoludImgs[3]?.optUrl],
    orientation: "portrait",
    tags: ["Reel", "9:16", "Instagram", "Viral", "Fast-Paced"]
  });

  projects.push({
    id: "reel-02",
    title: "Haldi Frenzy & Slow-Motion Splashes",
    category: "Cinematic Reels & Teasers",
    weddingRitual: "Gaye Holud",
    client: "Tech Shutter Hub Social",
    year: "2026",
    description: "120 FPS high-frame-rate vertical teaser reel featuring vibrant marigold petals and heartfelt moments timed to upbeat percussion.",
    video: "/assets/videos/video-2.mp4",
    image: gayeHoludImgs[6]?.optUrl || "",
    thumbImage: gayeHoludImgs[6]?.thumbUrl || "",
    photos: [gayeHoludImgs[6]?.optUrl],
    orientation: "portrait",
    tags: ["SlowMo", "120fps", "Reels", "WeddingTeaser"]
  });

  projects.push({
    id: "reel-03",
    title: "Cinematic Feature Wedding Trailer",
    category: "Cinematic Reels & Teasers",
    weddingRitual: "Main Wedding",
    client: "Tech Shutter Hub Cinema",
    year: "2026",
    description: "Full cinematic wedding teaser trailer blending anamorphic optics, intimate dialogue audio, and orchestral soundtrack.",
    video: "/assets/videos/video-3.mp4",
    image: mainWeddingImgs[3]?.optUrl || "",
    thumbImage: mainWeddingImgs[3]?.thumbUrl || "",
    photos: [mainWeddingImgs[3]?.optUrl],
    orientation: "landscape",
    tags: ["Trailer", "Anamorphic", "4K Cinema", "WeddingFilm"]
  });

  projects.push({
    id: "reel-04",
    title: "Reception Elegance & Gala Teaser",
    category: "Cinematic Reels & Teasers",
    weddingRitual: "Boubhat",
    client: "Tech Shutter Hub Social",
    year: "2026",
    description: "High-contrast nighttime reception highlights featuring sparkling entrance, candlelit decor, and couple dances.",
    video: "/assets/videos/video-4.mp4",
    image: boubhatImgs[7]?.optUrl || "",
    thumbImage: boubhatImgs[7]?.thumbUrl || "",
    photos: [boubhatImgs[7]?.optUrl],
    orientation: "landscape",
    tags: ["Teaser", "Gala", "NightCinematography"]
  });

  // --- 4. PRODUCT & E-COMMERCE PHOTOGRAPHY ---
  projects.push({
    id: "prod-01",
    title: "Artisan Gold & Polki Jewellery Catalog",
    category: "Product & E-commerce",
    weddingRitual: "",
    client: "Swarna Heritage Jewellers",
    year: "2026",
    description: "High-resolution, well-lit imagery of goods (ethnic wear, bridal jewellery, etc.) intended for luxury catalogues, e-commerce stores, and digital advertising.",
    video: "",
    image: "/assets/images/brand-feature-1.jpg",
    thumbImage: "/assets/images/brand-feature-1.jpg",
    photos: ["/assets/images/brand-feature-1.jpg", "/assets/images/brand-feature-2.jpg"],
    orientation: "landscape",
    tags: ["Jewellery", "E-Commerce", "Macro", "Studio Lighting", "Catalog"]
  });

  projects.push({
    id: "prod-02",
    title: "Handwoven Baluchari & Tussar Silk Campaign",
    category: "Product & E-commerce",
    weddingRitual: "",
    client: "Tantuja Artisan Weaves",
    year: "2026",
    description: "Commercial editorial styling and clean studio tabletop product documentation capturing intricate threadwork, zari texture, and rich palette.",
    video: "",
    image: mainWeddingImgs[12]?.optUrl || ashirbadImgs[2]?.optUrl || "",
    thumbImage: mainWeddingImgs[12]?.thumbUrl || ashirbadImgs[2]?.thumbUrl || "",
    photos: [mainWeddingImgs[12]?.optUrl, ashirbadImgs[2]?.optUrl].filter(Boolean),
    orientation: "portrait",
    tags: ["Textiles", "Ethnic Wear", "Silk", "E-Commerce"]
  });

  // --- 5. F&B / RESTAURANT PHOTOGRAPHY ---
  projects.push({
    id: "fb-01",
    title: "Culinary Alchemy & Gastronomy Styling",
    category: "F&B / Restaurant",
    weddingRitual: "",
    client: "Mocambo & Flavours Bistro",
    year: "2026",
    description: "Appetising, styled shots of food and beverages, along with interior ambience shots for cafes, fine-dining restaurants, and cloud kitchens.",
    video: "",
    image: boubhatImgs[10]?.optUrl || gayeHoludImgs[8]?.optUrl || "",
    thumbImage: boubhatImgs[10]?.thumbUrl || gayeHoludImgs[8]?.thumbUrl || "",
    photos: [boubhatImgs[10]?.optUrl, gayeHoludImgs[8]?.optUrl].filter(Boolean),
    orientation: "landscape",
    tags: ["Culinary", "Plating", "Ambience", "Fine Dining", "Cocktails"]
  });

  // --- 6. CORPORATE PHOTOGRAPHY ---
  projects.push({
    id: "corp-01",
    title: "Executive Headshots & Leadership Profiles",
    category: "Corporate Photography",
    weddingRitual: "",
    client: "Fintech Horizon & Zenith Media",
    year: "2026",
    description: "Professional executive headshots, team photos, facility documentation, and full coverage of corporate conferences and global leadership seminars.",
    video: "",
    image: ashirbadImgs[9]?.optUrl || mainWeddingImgs[4]?.optUrl || "",
    thumbImage: ashirbadImgs[9]?.thumbUrl || mainWeddingImgs[4]?.thumbUrl || "",
    photos: [ashirbadImgs[9]?.optUrl, mainWeddingImgs[4]?.optUrl].filter(Boolean),
    orientation: "portrait",
    tags: ["Headshots", "Corporate", "Leadership", "Seminars"]
  });

  // --- 7. ANNAPRASHAN & MATERNITY ---
  projects.push({
    id: "milestone-01",
    title: "Parenthood Grace — Maternity Glow Series",
    category: "Annaprashan & Maternity",
    weddingRitual: "",
    client: "Sayani & Joydeep",
    year: "2026",
    description: "Milestone photography documenting the intimate journey of parenthood through serene outdoor maternity portraiture with soft natural backlight.",
    video: "",
    image: ashirbadImgs[3]?.optUrl || "",
    thumbImage: ashirbadImgs[3]?.thumbUrl || "",
    photos: ashirbadImgs.slice(3, 7).map(i => i.optUrl),
    orientation: ashirbadImgs[3]?.orientation || "portrait",
    tags: ["Maternity", "Parenthood", "Natural Light", "Glow"]
  });

  projects.push({
    id: "milestone-02",
    title: "Annaprashan: Baby's First Rice Ceremony",
    category: "Annaprashan & Maternity",
    weddingRitual: "",
    client: "Little Yuvaan & Family",
    year: "2026",
    description: "Tender cultural documentation of the traditional Bengali Mukhe Bhaat (Annaprashan) ceremony with miniature dhoti-kurta, silverware, and blessings.",
    video: "",
    image: gayeHoludImgs[11]?.optUrl || "",
    thumbImage: gayeHoludImgs[11]?.thumbUrl || "",
    photos: gayeHoludImgs.slice(11, 15).map(i => i.optUrl),
    orientation: gayeHoludImgs[11]?.orientation || "landscape",
    tags: ["Annaprashan", "Rice Ceremony", "Baby Milestone", "Bengali Tradition"]
  });

  // --- 8. DURGA PUJA & FESTIVE PORTFOLIOS ---
  projects.push({
    id: "festive-01",
    title: "Sharodotsav: Autumn Festive Editorial",
    category: "Durga Puja & Festive",
    weddingRitual: "",
    client: "Kolkata Cultural Collective",
    year: "2026",
    description: "Specialised editorial fashion shoots and cultural documentation centred around the festive season of Bengal — Dhunuchi naach, Kaash flower landscapes, and heritage sarees.",
    video: "",
    image: mainWeddingImgs[15]?.optUrl || boubhatImgs[2]?.optUrl || "",
    thumbImage: mainWeddingImgs[15]?.thumbUrl || boubhatImgs[2]?.thumbUrl || "",
    photos: [mainWeddingImgs[15]?.optUrl, boubhatImgs[2]?.optUrl, boubhatImgs[3]?.optUrl].filter(Boolean),
    orientation: mainWeddingImgs[15]?.orientation || "portrait",
    tags: ["Durga Puja", "Sharodotsav", "Heritage", "Festive", "Bengali Culture"]
  });

  // Add individual highlight photo projects so all 76 images can be viewed and explored in the 3D Wall and Gallery Grid!
  for (let idx = 0; idx < imageMeta.length; idx++) {
    const item = imageMeta[idx];
    let cat = "Full-Spectrum Wedding";
    let ritual = "Main Wedding";
    if (idx < 15) {
      ritual = "Ashirbad";
      cat = idx % 2 === 0 ? "Full-Spectrum Wedding" : "Pre-Wedding Escapes";
    } else if (idx < 35) {
      ritual = "Gaye Holud";
      cat = "Full-Spectrum Wedding";
    } else if (idx < 55) {
      ritual = "Main Wedding";
      cat = "Full-Spectrum Wedding";
    } else {
      ritual = "Boubhat";
      cat = idx % 4 === 0 ? "Festive & Cultural" : "Full-Spectrum Wedding";
    }

    projects.push({
      id: `tsh-photo-${String(idx + 1).padStart(3, '0')}`,
      title: `${ritual} Visual Story #${idx + 1}`,
      category: cat,
      weddingRitual: ritual,
      client: "Tech Shutter Hub Gallery",
      year: "2026",
      description: `High-resolution studio frame from our curated visual archive. Captured with Sony Alpha G-Master prime lenses, documenting authentic emotions during ${ritual}.`,
      video: "",
      image: item.optUrl,
      thumbImage: item.thumbUrl,
      photos: [item.optUrl],
      orientation: item.orientation,
      tags: [ritual, cat, "Sony Alpha", "G-Master", "Editorial"]
    });
  }

  console.log(`Generated ${projects.length} project items.`);
  const jsonContent = JSON.stringify(projects, null, 2);
  fs.writeFileSync(dataFile, jsonContent, 'utf8');
  fs.writeFileSync(publicDataFile, jsonContent, 'utf8');
  console.log('Saved projects.json successfully.');
}

build();

