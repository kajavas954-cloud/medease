const https = require('https');
const fs = require('fs');

const mappings = {
  "Crepe Bandage": "Bandage",
  "Sterile Gauze": "Gauze",
  "Fitness Band": "Activity_tracker",
  "Whey Protein 1kg": "Whey_protein",
  "Yoga Mat": "Yoga_mat",
  "Pet Shampoo": "Dog_grooming",
  "Tick & Flea Spray": "Insect_repellent",
  "Pet Multivitamins": "Dietary_supplement",
  "Ayush Kadha": "Ayurveda",
  "Ashwagandha Powder": "Withania_somnifera",
  "Triphala Churna": "Triphala",
  "Homeo Cold Drops": "Homeopathy",
  "Homeo Digest Syrup": "Syrup",
  "Ibuprofen 400mg": "Ibuprofen",
  "Omeprazole 20mg": "Omeprazole"
};

const fetchWikiImage = (title) => {
  return new Promise((resolve) => {
    https.get(`https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=400`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop");
          }
        } catch(e) { 
            resolve("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop"); 
        }
      });
    }).on('error', () => {
        resolve("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop");
    });
  });
};

(async () => {
  let seedContent = fs.readFileSync('c:\\Users\\vijit\\OneDrive\\Desktop\\medease\\medease-frontend\\backend\\seed.js', 'utf8');
  for (const [product, wiki] of Object.entries(mappings)) {
    const url = await fetchWikiImage(wiki);
    console.log(`Found image for ${product}: ${url}`);
    seedContent = seedContent.replace(`getPlaceholder("${product}")`, `"${url}"`);
  }
  fs.writeFileSync('c:\\Users\\vijit\\OneDrive\\Desktop\\medease\\medease-frontend\\backend\\seed.js', seedContent);
  console.log("Seed updated with real Wikipedia product photos!");
})();
