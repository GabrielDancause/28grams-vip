const fs = require('fs');
const path = require('path');
const https = require('https');

const foods = [
  { food: "Chicken Breast, Skinless", category: "Poultry" },
  { food: "Turkey Breast, Skinless", category: "Poultry" },
  { food: "Pork Tenderloin", category: "Meat" },
  { food: "Lean Ground Beef (95%)", category: "Meat" },
  { food: "Venison", category: "Meat" },
  { food: "Bison", category: "Meat" },
  { food: "Beef Sirloin Steak", category: "Meat" },
  { food: "Lamb Chops, Lean", category: "Meat" },
  { food: "Veal Cutlet", category: "Meat" },
  { food: "Duck Breast, Skinless", category: "Poultry" },

  { food: "Tuna (Canned in Water)", category: "Seafood" },
  { food: "Salmon, Wild", category: "Seafood" },
  { food: "Shrimp", category: "Seafood" },
  { food: "Tilapia", category: "Seafood" },
  { food: "Cod", category: "Seafood" },
  { food: "Halibut", category: "Seafood" },
  { food: "Scallops", category: "Seafood" },
  { food: "Crab Meat", category: "Seafood" },
  { food: "Lobster", category: "Seafood" },
  { food: "Mussels", category: "Seafood" },
  { food: "Oysters", category: "Seafood" },
  { food: "Sardines (Canned in Water)", category: "Seafood" },
  { food: "Trout", category: "Seafood" },
  { food: "Mackerel", category: "Seafood" },

  { food: "Egg Whites", category: "Dairy & Eggs" },
  { food: "Whole Eggs", category: "Dairy & Eggs" },
  { food: "Greek Yogurt, Non-fat", category: "Dairy & Eggs" },
  { food: "Cottage Cheese, Non-fat", category: "Dairy & Eggs" },
  { food: "Skyr", category: "Dairy & Eggs" },
  { food: "Quark", category: "Dairy & Eggs" },
  { food: "Skim Milk", category: "Dairy & Eggs" },
  { food: "Mozzarella, Part-skim", category: "Dairy & Eggs" },
  { food: "Swiss Cheese", category: "Dairy & Eggs" },
  { food: "Parmesan Cheese", category: "Dairy & Eggs" },

  { food: "Whey Protein Isolate", category: "Supplements" },
  { food: "Casein Protein Powder", category: "Supplements" },
  { food: "Pea Protein Powder", category: "Supplements" },
  { food: "Soy Protein Isolate", category: "Supplements" },
  { food: "Collagen Peptides", category: "Supplements" },

  { food: "Tofu, Extra Firm", category: "Plant-Based" },
  { food: "Tempeh", category: "Plant-Based" },
  { food: "Edamame", category: "Plant-Based" },
  { food: "Seitan", category: "Plant-Based" },
  { food: "Lentils", category: "Plant-Based" },
  { food: "Black Beans", category: "Plant-Based" },
  { food: "Chickpeas", category: "Plant-Based" },
  { food: "Kidney Beans", category: "Plant-Based" },
  { food: "Pinto Beans", category: "Plant-Based" },
  { food: "Navy Beans", category: "Plant-Based" },
  { food: "Green Peas", category: "Plant-Based" },
  { food: "Quinoa", category: "Plant-Based" },
  { food: "Buckwheat", category: "Plant-Based" },
  { food: "Amaranth", category: "Plant-Based" },
  { food: "Oats", category: "Plant-Based" },
  { food: "Wild Rice", category: "Plant-Based" },
  { food: "Teff", category: "Plant-Based" },
  { food: "Spelt", category: "Plant-Based" },

  { food: "Hemp Seeds", category: "Nuts & Seeds" },
  { food: "Pumpkin Seeds", category: "Nuts & Seeds" },
  { food: "Chia Seeds", category: "Nuts & Seeds" },
  { food: "Flaxseeds", category: "Nuts & Seeds" },
  { food: "Sunflower Seeds", category: "Nuts & Seeds" },
  { food: "Almonds", category: "Nuts & Seeds" },
  { food: "Pistachios", category: "Nuts & Seeds" },
  { food: "Walnuts", category: "Nuts & Seeds" },
  { food: "Peanuts", category: "Nuts & Seeds" },
  { food: "Cashews", category: "Nuts & Seeds" },
  { food: "Brazil Nuts", category: "Nuts & Seeds" },
  { food: "Peanut Butter", category: "Nuts & Seeds" },
  { food: "Almond Butter", category: "Nuts & Seeds" },

  { food: "Broccoli", category: "Vegetables" },
  { food: "Spinach", category: "Vegetables" },
  { food: "Brussels Sprouts", category: "Vegetables" },
  { food: "Asparagus", category: "Vegetables" },
  { food: "Mushrooms", category: "Vegetables" },
  { food: "Cauliflower", category: "Vegetables" },
  { food: "Kale", category: "Vegetables" },
  { food: "Sweet Corn", category: "Vegetables" },
  { food: "Artichokes", category: "Vegetables" },
  { food: "Bok Choy", category: "Vegetables" },

  { food: "Nutritional Yeast", category: "Pantry" },
  { food: "Spirulina", category: "Pantry" },
  { food: "Vital Wheat Gluten", category: "Pantry" },
  { food: "Textured Vegetable Protein (TVP)", category: "Pantry" },
  { food: "Soy Milk", category: "Dairy & Eggs" } // Moved to Dairy alternative essentially
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJSON(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': '28grams.vip - Data Collector' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function searchFoodOFF(term) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=5`;
  const data = await fetchJSON(url);
  if (!data || !data.products || data.products.length === 0) return null;

  // Try to find the product with the most complete nutritional info, preferably single ingredient.
  let best = data.products.find(p => p.nutriments && typeof p.nutriments['energy-kcal_100g'] === 'number' && typeof p.nutriments.proteins_100g === 'number');

  if (!best) return null;

  return {
    proteinG: best.nutriments.proteins_100g,
    caloriesKcal: best.nutriments['energy-kcal_100g'],
    fatG: best.nutriments.fat_100g || 0,
    carbsG: best.nutriments.carbohydrates_100g || 0
  };
}

// Fallback manual database of approx macros for 100g just in case the API misses (OpenFoodFacts is mostly branded so raw items can be hit or miss)
const manualMacros = {
  "Chicken Breast, Skinless": { p: 31, c: 165, f: 3.6, cb: 0 },
  "Turkey Breast, Skinless": { p: 30, c: 135, f: 1.5, cb: 0 },
  "Pork Tenderloin": { p: 26, c: 143, f: 3.5, cb: 0 },
  "Lean Ground Beef (95%)": { p: 26, c: 171, f: 6, cb: 0 },
  "Venison": { p: 30, c: 158, f: 3.2, cb: 0 },
  "Bison": { p: 28, c: 143, f: 2.4, cb: 0 },
  "Beef Sirloin Steak": { p: 27, c: 244, f: 14, cb: 0 },
  "Lamb Chops, Lean": { p: 28, c: 206, f: 9, cb: 0 },
  "Veal Cutlet": { p: 32, c: 153, f: 2, cb: 0 },
  "Duck Breast, Skinless": { p: 19, c: 135, f: 5.9, cb: 0 },

  "Tuna (Canned in Water)": { p: 25, c: 116, f: 1, cb: 0 },
  "Salmon, Wild": { p: 20, c: 142, f: 6, cb: 0 },
  "Shrimp": { p: 24, c: 99, f: 0.3, cb: 0.2 },
  "Tilapia": { p: 26, c: 128, f: 2.7, cb: 0 },
  "Cod": { p: 18, c: 82, f: 0.7, cb: 0 },
  "Halibut": { p: 23, c: 111, f: 1.6, cb: 0 },
  "Scallops": { p: 21, c: 111, f: 0.8, cb: 5.4 },
  "Crab Meat": { p: 19, c: 84, f: 0.9, cb: 0 },
  "Lobster": { p: 19, c: 89, f: 0.9, cb: 0 },
  "Mussels": { p: 24, c: 172, f: 4.5, cb: 7.4 },
  "Oysters": { p: 9, c: 81, f: 2.3, cb: 4.9 },
  "Sardines (Canned in Water)": { p: 25, c: 208, f: 11, cb: 0 },
  "Trout": { p: 21, c: 148, f: 6.6, cb: 0 },
  "Mackerel": { p: 19, c: 205, f: 14, cb: 0 },

  "Egg Whites": { p: 11, c: 52, f: 0.2, cb: 0.7 },
  "Whole Eggs": { p: 13, c: 155, f: 11, cb: 1.1 },
  "Greek Yogurt, Non-fat": { p: 10, c: 59, f: 0.4, cb: 3.6 },
  "Cottage Cheese, Non-fat": { p: 10, c: 72, f: 0.3, cb: 6.7 },
  "Skyr": { p: 11, c: 65, f: 0.2, cb: 4 },
  "Quark": { p: 14, c: 68, f: 0.2, cb: 3.5 },
  "Skim Milk": { p: 3.4, c: 35, f: 0.1, cb: 5 },
  "Mozzarella, Part-skim": { p: 24, c: 254, f: 16, cb: 2.8 },
  "Swiss Cheese": { p: 27, c: 380, f: 28, cb: 5.4 },
  "Parmesan Cheese": { p: 38, c: 431, f: 29, cb: 4.1 },

  "Whey Protein Isolate": { p: 80, c: 376, f: 1.5, cb: 5 },
  "Casein Protein Powder": { p: 76, c: 358, f: 1.5, cb: 5 },
  "Pea Protein Powder": { p: 80, c: 380, f: 8, cb: 3 },
  "Soy Protein Isolate": { p: 88, c: 338, f: 1.5, cb: 0 },
  "Collagen Peptides": { p: 90, c: 360, f: 0, cb: 0 },

  "Tofu, Extra Firm": { p: 16, c: 144, f: 8.7, cb: 2.8 },
  "Tempeh": { p: 19, c: 192, f: 10.8, cb: 7.6 },
  "Edamame": { p: 11, c: 121, f: 5.2, cb: 8.9 },
  "Seitan": { p: 75, c: 370, f: 1.9, cb: 14 },
  "Lentils": { p: 9, c: 116, f: 0.4, cb: 20 },
  "Black Beans": { p: 8.9, c: 132, f: 0.5, cb: 23.7 },
  "Chickpeas": { p: 8.9, c: 164, f: 2.6, cb: 27.4 },
  "Kidney Beans": { p: 8.7, c: 127, f: 0.5, cb: 22.8 },
  "Pinto Beans": { p: 9, c: 143, f: 0.6, cb: 26.2 },
  "Navy Beans": { p: 8.2, c: 140, f: 0.6, cb: 26.1 },
  "Green Peas": { p: 5.4, c: 81, f: 0.4, cb: 14.5 },
  "Quinoa": { p: 4.4, c: 120, f: 1.9, cb: 21.3 },
  "Buckwheat": { p: 3.4, c: 92, f: 0.6, cb: 20 },
  "Amaranth": { p: 3.8, c: 102, f: 1.6, cb: 18.7 },
  "Oats": { p: 16.9, c: 389, f: 6.9, cb: 66.3 },
  "Wild Rice": { p: 4, c: 101, f: 0.3, cb: 21.3 },
  "Teff": { p: 3.9, c: 101, f: 0.6, cb: 19.9 },
  "Spelt": { p: 5.5, c: 127, f: 0.9, cb: 26.4 },

  "Hemp Seeds": { p: 31.6, c: 553, f: 48.8, cb: 8.7 },
  "Pumpkin Seeds": { p: 30.2, c: 559, f: 49.1, cb: 10.7 },
  "Chia Seeds": { p: 16.5, c: 486, f: 30.7, cb: 42.1 },
  "Flaxseeds": { p: 18.3, c: 534, f: 42.2, cb: 28.9 },
  "Sunflower Seeds": { p: 20.8, c: 584, f: 51.5, cb: 20 },
  "Almonds": { p: 21.2, c: 579, f: 49.9, cb: 21.6 },
  "Pistachios": { p: 20.2, c: 562, f: 45.3, cb: 27.2 },
  "Walnuts": { p: 15.2, c: 654, f: 65.2, cb: 13.7 },
  "Peanuts": { p: 25.8, c: 567, f: 49.2, cb: 16.1 },
  "Cashews": { p: 18.2, c: 553, f: 43.8, cb: 30.2 },
  "Brazil Nuts": { p: 14.3, c: 659, f: 67.1, cb: 11.7 },
  "Peanut Butter": { p: 25.1, c: 588, f: 50.4, cb: 20 },
  "Almond Butter": { p: 21, c: 614, f: 55.5, cb: 18.8 },

  "Broccoli": { p: 2.8, c: 34, f: 0.4, cb: 6.6 },
  "Spinach": { p: 2.9, c: 23, f: 0.4, cb: 3.6 },
  "Brussels Sprouts": { p: 3.4, c: 43, f: 0.3, cb: 9 },
  "Asparagus": { p: 2.2, c: 20, f: 0.1, cb: 3.9 },
  "Mushrooms": { p: 3.1, c: 22, f: 0.3, cb: 3.3 },
  "Cauliflower": { p: 1.9, c: 25, f: 0.3, cb: 5 },
  "Kale": { p: 3.3, c: 35, f: 0.5, cb: 4.4 },
  "Sweet Corn": { p: 3.3, c: 86, f: 1.4, cb: 18.7 },
  "Artichokes": { p: 3.3, c: 47, f: 0.2, cb: 10.5 },
  "Bok Choy": { p: 1.5, c: 13, f: 0.2, cb: 2.2 },

  "Nutritional Yeast": { p: 50, c: 333, f: 5, cb: 33.3 },
  "Spirulina": { p: 57.5, c: 290, f: 7.7, cb: 23.9 },
  "Vital Wheat Gluten": { p: 75.2, c: 370, f: 1.9, cb: 13.8 },
  "Textured Vegetable Protein (TVP)": { p: 51.5, c: 327, f: 1.2, cb: 33.9 },
  "Soy Milk": { p: 3.3, c: 33, f: 1.5, cb: 1.8 }
};

async function main() {
  console.log(`Starting crawl for ${foods.length} foods...`);
  const results = [];

  for (let i = 0; i < foods.length; i++) {
    const item = foods[i];
    let proteinG = null, caloriesKcal = null, fatG = null, carbsG = null;

    try {
      // Hit OpenFoodFacts first
      console.log(`[${i+1}/${foods.length}] Fetching ${item.food}...`);
      const apiData = await searchFoodOFF(item.food);

      if (apiData && apiData.proteinG && apiData.caloriesKcal) {
        proteinG = apiData.proteinG;
        caloriesKcal = apiData.caloriesKcal;
        fatG = apiData.fatG;
        carbsG = apiData.carbsG;
        console.log(`  -> API Hit: P:${proteinG}g C:${caloriesKcal}kcal`);
      } else {
        throw new Error('No valid API data found');
      }
    } catch (err) {
      // Fallback to manual db
      const fallback = manualMacros[item.food];
      if (fallback) {
        proteinG = fallback.p;
        caloriesKcal = fallback.c;
        fatG = fallback.f;
        carbsG = fallback.cb;
        console.log(`  -> Using fallback: P:${proteinG}g C:${caloriesKcal}kcal`);
      } else {
        console.log(`  -> FAILED to get data.`);
        continue; // skip this item
      }
    }

    if (proteinG !== null && caloriesKcal !== null && caloriesKcal > 0) {
      const proteinPerCalorie = Number((proteinG / caloriesKcal).toFixed(4));
      results.push({
        food: item.food,
        category: item.category,
        proteinG: Number(proteinG.toFixed(1)),
        caloriesKcal: Number(caloriesKcal.toFixed(1)),
        proteinPerCalorie,
        fatG: Number(fatG.toFixed(1)),
        carbsG: Number(carbsG.toFixed(1)),
        servingSize: "100g"
      });
    }

    // 500ms delay
    await sleep(500);
  }

  // Sort by efficiency
  results.sort((a, b) => b.proteinPerCalorie - a.proteinPerCalorie);

  const destDir = path.join(__dirname, '..', 'data');
  const destPath = path.join(destDir, 'protein-per-calorie.json');

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

  fs.writeFileSync(destPath, JSON.stringify(results, null, 2));
  console.log(`\nCollected ${results.length} items. Saved to ${destPath}`);
}

main().catch(console.error);
