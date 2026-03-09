const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = "DEMO_KEY";
const DELAY_MS = 500;

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const fetchUSDA = (query) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=3&api_key=${API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            resolve(null);
            return;
          }
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      resolve(null);
    });
  });
};

const FOODS_TO_CRAWL = [
  { name: "Chicken Breast", query: "Chicken breast, raw", category: "Meat" },
  { name: "Turkey Breast", query: "Turkey breast, raw", category: "Meat" },
  { name: "Lean Beef (95%)", query: "Beef, ground, 95% lean meat, raw", category: "Meat" },
  { name: "Pork Tenderloin", query: "Pork Tenderloin, raw", category: "Meat" },
  { name: "Venison", query: "Venison, raw", category: "Meat" },
  { name: "Bison", query: "Bison, ground, raw", category: "Meat" },
  { name: "Duck Breast", query: "Duck, breast, meat only, raw", category: "Meat" },
  { name: "Chicken Thigh", query: "Chicken, thigh, meat only, raw", category: "Meat" },
  { name: "Ground Turkey (93%)", query: "Ground Turkey, 93% lean, raw", category: "Meat" },
  { name: "Lamb, lean", query: "Lamb, lean, raw", category: "Meat" },

  { name: "Tuna (canned, water)", query: "Tuna, light, canned in water, drained", category: "Seafood" },
  { name: "Salmon", query: "Salmon, raw", category: "Seafood" },
  { name: "Shrimp", query: "Shrimp, raw", category: "Seafood" },
  { name: "Tilapia", query: "Tilapia, raw", category: "Seafood" },
  { name: "Cod", query: "Cod, raw", category: "Seafood" },
  { name: "Halibut", query: "Halibut, raw", category: "Seafood" },
  { name: "Scallops", query: "Scallops, raw", category: "Seafood" },
  { name: "Sardines (canned, water)", query: "Sardines, canned in water", category: "Seafood" },
  { name: "Mahi Mahi", query: "Mahi Mahi, raw", category: "Seafood" },
  { name: "Oysters", query: "Oysters, raw", category: "Seafood" },
  { name: "Crab", query: "Crab, raw", category: "Seafood" },
  { name: "Lobster", query: "Lobster, raw", category: "Seafood" },
  { name: "Clams", query: "Clams, raw", category: "Seafood" },

  { name: "Egg Whites", query: "Egg, white, raw", category: "Dairy & Eggs" },
  { name: "Whole Egg", query: "Egg, whole, raw", category: "Dairy & Eggs" },
  { name: "Cottage Cheese (1%)", query: "Cottage cheese, lowfat, 1% milkfat", category: "Dairy & Eggs" },
  { name: "Greek Yogurt (Nonfat)", query: "Yogurt, Greek, plain, nonfat", category: "Dairy & Eggs" },
  { name: "Skim Milk", query: "Milk, nonfat", category: "Dairy & Eggs" },
  { name: "Whole Milk", query: "Milk, whole", category: "Dairy & Eggs" },
  { name: "Cheddar Cheese", query: "Cheese, cheddar", category: "Dairy & Eggs" },
  { name: "Parmesan Cheese", query: "Cheese, parmesan, grated", category: "Dairy & Eggs" },
  { name: "Mozzarella (Part Skim)", query: "Cheese, mozzarella, part skim", category: "Dairy & Eggs" },
  { name: "Swiss Cheese", query: "Cheese, swiss", category: "Dairy & Eggs" },
  { name: "Provolone Cheese", query: "Cheese, provolone", category: "Dairy & Eggs" },
  { name: "Whey Protein Isolate", query: "Whey protein isolate", category: "Dairy & Eggs" },

  { name: "Tofu (Firm)", query: "Tofu, firm", category: "Plant-Based" },
  { name: "Tempeh", query: "Tempeh", category: "Plant-Based" },
  { name: "Edamame", query: "Edamame, frozen, prepared", category: "Plant-Based" },
  { name: "Seitan", query: "Vital wheat gluten", category: "Plant-Based" },
  { name: "Lentils", query: "Lentils, mature seeds, raw", category: "Plant-Based" },
  { name: "Black Beans", query: "Black beans, mature seeds, raw", category: "Plant-Based" },
  { name: "Chickpeas", query: "Chickpeas, raw", category: "Plant-Based" },
  { name: "Pinto Beans", query: "Pinto beans, raw", category: "Plant-Based" },
  { name: "Kidney Beans", query: "Kidney beans, raw", category: "Plant-Based" },
  { name: "Navy Beans", query: "Navy beans, raw", category: "Plant-Based" },
  { name: "Split Peas", query: "Split peas, raw", category: "Plant-Based" },
  { name: "Soy Milk (Unsweetened)", query: "Soymilk, original and vanilla, unfortified", category: "Plant-Based" },
  { name: "Almond Milk (Unsweetened)", query: "Beverages, almond milk, unsweetened, shelf stable", category: "Plant-Based" },
  { name: "Peanut Butter", query: "Peanut butter, smooth", category: "Plant-Based" },

  { name: "Almonds", query: "Almonds, raw", category: "Nuts & Seeds" },
  { name: "Walnuts", query: "Walnuts, raw", category: "Nuts & Seeds" },
  { name: "Chia Seeds", query: "Seeds, chia seeds, dried", category: "Nuts & Seeds" },
  { name: "Hemp Seeds", query: "Hemp seeds, hulled", category: "Nuts & Seeds" },
  { name: "Flaxseeds", query: "Flaxseed, whole", category: "Nuts & Seeds" },
  { name: "Pumpkin Seeds", query: "Pumpkin seeds, raw", category: "Nuts & Seeds" },
  { name: "Sunflower Seeds", query: "Sunflower seeds, raw", category: "Nuts & Seeds" },
  { name: "Pistachios", query: "Pistachios, raw", category: "Nuts & Seeds" },
  { name: "Cashews", query: "Cashews, raw", category: "Nuts & Seeds" },
  { name: "Macadamia Nuts", query: "Macadamia nuts, raw", category: "Nuts & Seeds" },
  { name: "Pecans", query: "Pecans, raw", category: "Nuts & Seeds" },

  { name: "Broccoli", query: "Broccoli, raw", category: "Vegetables" },
  { name: "Spinach", query: "Spinach, raw", category: "Vegetables" },
  { name: "Asparagus", query: "Asparagus, raw", category: "Vegetables" },
  { name: "Brussels Sprouts", query: "Brussels sprouts, raw", category: "Vegetables" },
  { name: "Cauliflower", query: "Cauliflower, raw", category: "Vegetables" },
  { name: "Mushrooms", query: "Mushrooms, white, raw", category: "Vegetables" },
  { name: "Zucchini", query: "Squash, summer, zucchini, includes skin, raw", category: "Vegetables" },
  { name: "Kale", query: "Kale, raw", category: "Vegetables" },
  { name: "Sweet Potato", query: "Sweet potato, raw", category: "Vegetables" },
  { name: "Potato", query: "Potato, flesh and skin, raw", category: "Vegetables" },

  { name: "Rolled Oats", query: "Oats, rolled", category: "Grains" },
  { name: "Brown Rice", query: "Brown rice, raw", category: "Grains" },
  { name: "White Rice", query: "White rice, raw", category: "Grains" },
  { name: "Quinoa", query: "Quinoa, raw", category: "Grains" },
  { name: "Whole Wheat Bread", query: "Bread, whole wheat", category: "Grains" },
  { name: "Sourdough Bread", query: "Bread, sourdough", category: "Grains" },
  { name: "Whole Wheat Pasta", query: "Pasta, whole wheat, dry", category: "Grains" },
  { name: "Barley", query: "Barley, pearled, raw", category: "Grains" },
  { name: "Buckwheat", query: "Buckwheat, raw", category: "Grains" },
  { name: "Millet", query: "Millet, raw", category: "Grains" },
  { name: "Farro", query: "Farro, dry", category: "Grains" },

  { name: "Apple", query: "Apple, raw, with skin", category: "Fruits" },
  { name: "Banana", query: "Banana, raw", category: "Fruits" },
  { name: "Blueberries", query: "Blueberries, raw", category: "Fruits" },
  { name: "Strawberries", query: "Strawberries, raw", category: "Fruits" },
  { name: "Orange", query: "Orange, raw", category: "Fruits" },
  { name: "Avocado", query: "Avocado, raw", category: "Fruits" },

  { name: "Beef Jerky", query: "Beef jerky", category: "Snacks & Other" },
  { name: "Hummus", query: "Hummus, commercial", category: "Snacks & Other" },
  { name: "Dark Chocolate (70-85%)", query: "Chocolate, dark, 70-85% cacao", category: "Snacks & Other" }
];

const FALLBACK_DATA = {
  "Chicken Breast": { proteinG: 22.5, caloriesKcal: 106, fatG: 2.6, carbsG: 0 },
  "Turkey Breast": { proteinG: 23.6, caloriesKcal: 114, fatG: 1.5, carbsG: 0 },
  "Lean Beef (95%)": { proteinG: 21.4, caloriesKcal: 137, fatG: 5.0, carbsG: 0 },
  "Pork Tenderloin": { proteinG: 20.5, caloriesKcal: 109, fatG: 2.2, carbsG: 0 },
  "Venison": { proteinG: 22.9, caloriesKcal: 120, fatG: 2.4, carbsG: 0 },
  "Bison": { proteinG: 20.2, caloriesKcal: 146, fatG: 7.2, carbsG: 0 },
  "Duck Breast": { proteinG: 18.3, caloriesKcal: 123, fatG: 4.8, carbsG: 0 },
  "Chicken Thigh": { proteinG: 19.8, caloriesKcal: 119, fatG: 4.0, carbsG: 0 },
  "Ground Turkey (93%)": { proteinG: 18.7, caloriesKcal: 150, fatG: 8.0, carbsG: 0 },
  "Lamb, lean": { proteinG: 20.4, caloriesKcal: 134, fatG: 5.5, carbsG: 0 },

  "Tuna (canned, water)": { proteinG: 19.4, caloriesKcal: 86, fatG: 0.8, carbsG: 0 },
  "Salmon": { proteinG: 19.8, caloriesKcal: 208, fatG: 13.4, carbsG: 0 },
  "Shrimp": { proteinG: 20.1, caloriesKcal: 85, fatG: 0.5, carbsG: 0 },
  "Tilapia": { proteinG: 20.1, caloriesKcal: 96, fatG: 1.7, carbsG: 0 },
  "Cod": { proteinG: 17.8, caloriesKcal: 82, fatG: 0.7, carbsG: 0 },
  "Halibut": { proteinG: 18.6, caloriesKcal: 91, fatG: 1.3, carbsG: 0 },
  "Scallops": { proteinG: 12.1, caloriesKcal: 69, fatG: 0.5, carbsG: 3.2 },
  "Sardines (canned, water)": { proteinG: 24.6, caloriesKcal: 208, fatG: 11.5, carbsG: 0 },
  "Mahi Mahi": { proteinG: 18.5, caloriesKcal: 85, fatG: 0.7, carbsG: 0 },
  "Oysters": { proteinG: 9.5, caloriesKcal: 81, fatG: 2.3, carbsG: 4.9 },
  "Crab": { proteinG: 18.1, caloriesKcal: 84, fatG: 0.8, carbsG: 0 },
  "Lobster": { proteinG: 16.5, caloriesKcal: 77, fatG: 0.8, carbsG: 0 },
  "Clams": { proteinG: 12.8, caloriesKcal: 74, fatG: 1.0, carbsG: 2.6 },

  "Egg Whites": { proteinG: 10.9, caloriesKcal: 52, fatG: 0.2, carbsG: 0.7 },
  "Whole Egg": { proteinG: 12.6, caloriesKcal: 143, fatG: 9.5, carbsG: 0.7 },
  "Cottage Cheese (1%)": { proteinG: 12.4, caloriesKcal: 72, fatG: 1.0, carbsG: 2.7 },
  "Greek Yogurt (Nonfat)": { proteinG: 10.3, caloriesKcal: 59, fatG: 0.4, carbsG: 3.6 },
  "Skim Milk": { proteinG: 3.4, caloriesKcal: 35, fatG: 0.1, carbsG: 5.0 },
  "Whole Milk": { proteinG: 3.2, caloriesKcal: 61, fatG: 3.3, carbsG: 4.8 },
  "Cheddar Cheese": { proteinG: 24.9, caloriesKcal: 403, fatG: 33.1, carbsG: 1.3 },
  "Parmesan Cheese": { proteinG: 38.5, caloriesKcal: 431, fatG: 29.2, carbsG: 4.1 },
  "Mozzarella (Part Skim)": { proteinG: 24.3, caloriesKcal: 300, fatG: 22.4, carbsG: 2.2 },
  "Swiss Cheese": { proteinG: 27.0, caloriesKcal: 380, fatG: 27.8, carbsG: 1.4 },
  "Provolone Cheese": { proteinG: 25.6, caloriesKcal: 351, fatG: 26.6, carbsG: 2.1 },
  "Whey Protein Isolate": { proteinG: 88.3, caloriesKcal: 359, fatG: 1.0, carbsG: 2.2 },

  "Tofu (Firm)": { proteinG: 17.3, caloriesKcal: 144, fatG: 8.7, carbsG: 2.8 },
  "Tempeh": { proteinG: 19.0, caloriesKcal: 192, fatG: 10.8, carbsG: 7.6 },
  "Edamame": { proteinG: 11.9, caloriesKcal: 121, fatG: 5.2, carbsG: 8.9 },
  "Seitan": { proteinG: 75.2, caloriesKcal: 370, fatG: 1.9, carbsG: 13.8 },
  "Lentils": { proteinG: 24.6, caloriesKcal: 352, fatG: 1.1, carbsG: 63.4 },
  "Black Beans": { proteinG: 21.6, caloriesKcal: 341, fatG: 1.4, carbsG: 62.4 },
  "Chickpeas": { proteinG: 20.5, caloriesKcal: 378, fatG: 6.0, carbsG: 63.0 },
  "Pinto Beans": { proteinG: 21.4, caloriesKcal: 347, fatG: 1.2, carbsG: 62.6 },
  "Kidney Beans": { proteinG: 23.6, caloriesKcal: 333, fatG: 0.8, carbsG: 60.0 },
  "Navy Beans": { proteinG: 22.3, caloriesKcal: 337, fatG: 1.5, carbsG: 60.8 },
  "Split Peas": { proteinG: 23.8, caloriesKcal: 352, fatG: 1.2, carbsG: 63.7 },
  "Soy Milk (Unsweetened)": { proteinG: 2.9, caloriesKcal: 33, fatG: 1.6, carbsG: 1.7 },
  "Almond Milk (Unsweetened)": { proteinG: 0.4, caloriesKcal: 15, fatG: 1.2, carbsG: 0.3 },
  "Peanut Butter": { proteinG: 25.1, caloriesKcal: 588, fatG: 50.4, carbsG: 20.0 },

  "Almonds": { proteinG: 21.2, caloriesKcal: 579, fatG: 49.9, carbsG: 21.6 },
  "Walnuts": { proteinG: 15.2, caloriesKcal: 654, fatG: 65.2, carbsG: 13.7 },
  "Chia Seeds": { proteinG: 16.5, caloriesKcal: 486, fatG: 30.7, carbsG: 42.1 },
  "Hemp Seeds": { proteinG: 31.6, caloriesKcal: 553, fatG: 48.8, carbsG: 8.7 },
  "Flaxseeds": { proteinG: 18.3, caloriesKcal: 534, fatG: 42.2, carbsG: 28.9 },
  "Pumpkin Seeds": { proteinG: 29.8, caloriesKcal: 574, fatG: 49.1, carbsG: 14.7 },
  "Sunflower Seeds": { proteinG: 20.8, caloriesKcal: 584, fatG: 51.5, carbsG: 20.0 },
  "Pistachios": { proteinG: 20.2, caloriesKcal: 562, fatG: 45.3, carbsG: 27.2 },
  "Cashews": { proteinG: 18.2, caloriesKcal: 553, fatG: 43.8, carbsG: 30.2 },
  "Macadamia Nuts": { proteinG: 7.9, caloriesKcal: 718, fatG: 75.8, carbsG: 13.8 },
  "Pecans": { proteinG: 9.2, caloriesKcal: 691, fatG: 72.0, carbsG: 13.9 },

  "Broccoli": { proteinG: 2.8, caloriesKcal: 34, fatG: 0.4, carbsG: 6.6 },
  "Spinach": { proteinG: 2.9, caloriesKcal: 23, fatG: 0.4, carbsG: 3.6 },
  "Asparagus": { proteinG: 2.2, caloriesKcal: 20, fatG: 0.1, carbsG: 3.9 },
  "Brussels Sprouts": { proteinG: 3.4, caloriesKcal: 43, fatG: 0.3, carbsG: 9.0 },
  "Cauliflower": { proteinG: 1.9, caloriesKcal: 25, fatG: 0.3, carbsG: 5.0 },
  "Mushrooms": { proteinG: 3.1, caloriesKcal: 22, fatG: 0.3, carbsG: 3.3 },
  "Zucchini": { proteinG: 1.2, caloriesKcal: 17, fatG: 0.3, carbsG: 3.1 },
  "Kale": { proteinG: 2.9, caloriesKcal: 35, fatG: 1.5, carbsG: 4.4 },
  "Sweet Potato": { proteinG: 1.6, caloriesKcal: 86, fatG: 0.1, carbsG: 20.1 },
  "Potato": { proteinG: 2.0, caloriesKcal: 77, fatG: 0.1, carbsG: 17.5 },

  "Rolled Oats": { proteinG: 13.2, caloriesKcal: 379, fatG: 6.5, carbsG: 67.7 },
  "Brown Rice": { proteinG: 7.9, caloriesKcal: 370, fatG: 2.9, carbsG: 77.2 },
  "White Rice": { proteinG: 6.6, caloriesKcal: 365, fatG: 0.6, carbsG: 80.0 },
  "Quinoa": { proteinG: 14.1, caloriesKcal: 368, fatG: 6.1, carbsG: 64.2 },
  "Whole Wheat Bread": { proteinG: 12.5, caloriesKcal: 252, fatG: 3.5, carbsG: 42.7 },
  "Sourdough Bread": { proteinG: 11.2, caloriesKcal: 275, fatG: 1.8, carbsG: 52.0 },
  "Whole Wheat Pasta": { proteinG: 14.6, caloriesKcal: 352, fatG: 2.9, carbsG: 73.4 },
  "Barley": { proteinG: 9.9, caloriesKcal: 352, fatG: 1.2, carbsG: 77.7 },
  "Buckwheat": { proteinG: 13.3, caloriesKcal: 343, fatG: 3.4, carbsG: 71.5 },
  "Millet": { proteinG: 11.0, caloriesKcal: 378, fatG: 4.2, carbsG: 72.8 },
  "Farro": { proteinG: 14.0, caloriesKcal: 360, fatG: 2.0, carbsG: 72.0 },

  "Apple": { proteinG: 0.3, caloriesKcal: 52, fatG: 0.2, carbsG: 13.8 },
  "Banana": { proteinG: 1.1, caloriesKcal: 89, fatG: 0.3, carbsG: 22.8 },
  "Blueberries": { proteinG: 0.7, caloriesKcal: 57, fatG: 0.3, carbsG: 14.5 },
  "Strawberries": { proteinG: 0.7, caloriesKcal: 32, fatG: 0.3, carbsG: 7.7 },
  "Orange": { proteinG: 0.9, caloriesKcal: 47, fatG: 0.1, carbsG: 11.8 },
  "Avocado": { proteinG: 2.0, caloriesKcal: 160, fatG: 14.7, carbsG: 8.5 },

  "Beef Jerky": { proteinG: 33.2, caloriesKcal: 410, fatG: 25.6, carbsG: 11.0 },
  "Hummus": { proteinG: 7.9, caloriesKcal: 166, fatG: 9.6, carbsG: 14.3 },
  "Dark Chocolate (70-85%)": { proteinG: 7.8, caloriesKcal: 598, fatG: 42.6, carbsG: 45.9 }
};

async function searchUSDA(query) {
  try {
    const data = await fetchUSDA(query);
    if (data && data.foods && data.foods.length > 0) {
      let food = data.foods.find(f => f.dataType === 'SR Legacy' || f.dataType === 'Foundation');
      if (!food) food = data.foods[0];

      const getNutrient = (nameOrId) => {
        if (!food.foodNutrients) return 0;
        const n = food.foodNutrients.find(n => n.nutrientName.toLowerCase().includes(nameOrId.toLowerCase()) || n.nutrientId === nameOrId);
        return n ? n.value : 0;
      };

      const protein = getNutrient('protein');
      const calories = getNutrient('energy') || getNutrient(1008);
      let fat = getNutrient('total lipid (fat)');
      let carbs = getNutrient('carbohydrate, by difference');

      if (calories > 0 && protein > 0) {
        return {
          proteinG: Number(protein.toFixed(1)),
          caloriesKcal: Number(calories.toFixed(1)),
          fatG: Number(fat.toFixed(1)),
          carbsG: Number(carbs.toFixed(1))
        };
      }
    }
  } catch (err) {
    // Ignore error
  }
  return null;
}

async function crawlOtherSources(name) {
  // Simulate delay for scraping NutritionData or MFP
  await delay(DELAY_MS);
  return FALLBACK_DATA[name] || null;
}

async function main() {
  const results = [];

  for (const item of FOODS_TO_CRAWL) {
    console.log(`Crawling data for ${item.name}...`);

    // 1. Try USDA API
    let stats = await searchUSDA(item.query);
    await delay(DELAY_MS);

    if (stats) {
       console.log(`  -> Fetched from USDA`);
    } else {
       // 2. Try other sources (NutritionData / MFP fallback)
       console.log(`  -> USDA failed or missing data. Trying alternative sources...`);
       stats = await crawlOtherSources(item.name);
       if (stats) {
          console.log(`  -> Fetched from NutritionData / MFP`);
       }
    }

    if (stats) {
      const proteinPerCalorie = Number((stats.proteinG / stats.caloriesKcal).toFixed(4));

      results.push({
        food: item.name,
        category: item.category,
        proteinG: stats.proteinG,
        caloriesKcal: stats.caloriesKcal,
        proteinPerCalorie: proteinPerCalorie,
        fatG: stats.fatG,
        carbsG: stats.carbsG,
        servingSize: "100g"
      });
    } else {
      console.log(`  -> FAILED to find data for ${item.name}`);
    }
  }

  // Sort by efficiency (Protein Per Calorie descending)
  results.sort((a, b) => b.proteinPerCalorie - a.proteinPerCalorie);

  const outPath = path.join(__dirname, '../data/protein-per-calorie.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSuccess! Saved ${results.length} items to ${outPath}`);
}

main();