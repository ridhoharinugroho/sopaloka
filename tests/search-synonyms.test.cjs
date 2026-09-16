const Fuse = require("fuse.js");

// 1. Kamus master
const DEFAULT_MASTER_SYNONYMS = [
  { term: "laptop", synonyms: ["notebook", "komputer", "pc", "netbook"] },
  { term: "hp", synonyms: ["handphone", "ponsel", "smartphone", "telepon", "android", "iphone"] },
  { term: "motor", synonyms: ["sepeda motor", "motorik", "moped"] },
  { term: "mobil", synonyms: ["kendaraan", "otomotif", "car"] }
];

function buildBidirectionalSynonyms(rows) {
  const newCache = {};

  rows.forEach((row) => {
    if (!row.term || !Array.isArray(row.synonyms)) return;
    const term = row.term.toLowerCase().trim();
    if (!term) return;
    if (!newCache[term]) newCache[term] = new Set();

    row.synonyms.forEach((syn) => {
      if (typeof syn !== "string") return;
      const s = syn.toLowerCase().trim();
      if (!s || s === term) return;

      // 1. term -> syn
      newCache[term].add(s);

      // 2. syn -> term
      if (!newCache[s]) newCache[s] = new Set();
      newCache[s].add(term);

      // 3. Cross-link sesama sinonim
      row.synonyms.forEach((otherSyn) => {
        if (typeof otherSyn !== "string") return;
        const os = otherSyn.toLowerCase().trim();
        if (os && os !== s) newCache[s].add(os);
      });
    });
  });

  const finalCache = {};
  for (const key in newCache) {
    finalCache[key] = Array.from(newCache[key]);
  }
  return finalCache;
}

const cache = buildBidirectionalSynonyms(DEFAULT_MASTER_SYNONYMS);

// Mock listings
const mockListings = [
  {
    id: "item-1",
    title: "Honda Beat FI ESP 2018 Surat Lengkap Pajak Jalan Klaten",
    description: "Honda Beat ESP 2018 warna merah putih plat AD Klaten",
    category: "kendaraan"
  },
  {
    id: "item-2",
    title: "Laptop Asus Vivobook Core i5 SSD 512GB RAM 8GB Mulus Siap Pakai",
    description: "Laptop Asus Vivobook slim warna silver elegan",
    category: "elektronik"
  },
  {
    id: "item-3",
    title: "iPhone 11 128GB Black iBox Mulus Fullset BH 84%",
    description: "iPhone 11 128 GB smartphone resmi Indonesia",
    category: "elektronik"
  }
];

function searchListings(query, listings, synCache) {
  let results = [...listings];
  const q = query.trim().toLowerCase();
  if (!q) return results;

  const words = q.split(/\s+/).filter(Boolean);
  const expandedWordGroups = words.map((word) => {
    const syns = synCache[word] || [];
    return Array.from(new Set([word, ...syns]));
  });

  for (const wordGroup of expandedWordGroups) {
    const groupMatches = new Map();

    for (const option of wordGroup) {
      const fuse = new Fuse(results, {
        keys: ["title", "description", "category"],
        threshold: 0.3,
        ignoreLocation: true,
        distance: 1000,
      });

      const optionResults = fuse.search(option);
      for (const res of optionResults) {
        groupMatches.set(res.item.id, res.item);
      }
    }

    results = Array.from(groupMatches.values());
  }

  return results;
}

// SUITE TESTS:
console.log("=== MENJALANKAN TEST KETAT SISTEM PENCARIAN ===");

// Test 1: Cari 'pc' harus memunculkan 'Laptop Asus Vivobook'
const res1 = searchListings("pc", mockListings, cache);
if (res1.length !== 1 || res1[0].id !== "item-2") {
  console.error("TEST 1 GAGAL:", res1);
  process.exit(1);
}
console.log("✅ TEST 1 LULUS: Pencarian 'pc' sukses menemukan 'Laptop' (Sifat Bolak-Balik Terbukti)");

// Test 2: Cari 'komputer' harus memunculkan 'Laptop Asus Vivobook'
const res2 = searchListings("komputer", mockListings, cache);
if (res2.length !== 1 || res2[0].id !== "item-2") {
  console.error("TEST 2 GAGAL:", res2);
  process.exit(1);
}
console.log("✅ TEST 2 LULUS: Pencarian 'komputer' sukses menemukan 'Laptop' (Sifat Cross-link Terbukti)");

// Test 3: Cari 'notebook' harus memunculkan 'Laptop Asus Vivobook'
const res3 = searchListings("notebook", mockListings, cache);
if (res3.length !== 1 || res3[0].id !== "item-2") {
  console.error("TEST 3 GAGAL:", res3);
  process.exit(1);
}
console.log("✅ TEST 3 LULUS: Pencarian 'notebook' sukses menemukan 'Laptop'");

// Test 4: Cari 'hp' harus memunculkan 'iPhone 11'
const res4 = searchListings("hp", mockListings, cache);
if (res4.length !== 1 || res4[0].id !== "item-3") {
  console.error("TEST 4 GAGAL:", res4);
  process.exit(1);
}
console.log("✅ TEST 4 LULUS: Pencarian 'hp' sukses menemukan 'iPhone'");

// Test 5: Cari multi-kata 'beat 2018' harus memunculkan 'Honda Beat FI ESP 2018'
const res5 = searchListings("beat 2018", mockListings, cache);
if (res5.length !== 1 || res5[0].id !== "item-1") {
  console.error("TEST 5 GAGAL:", res5);
  process.exit(1);
}
console.log("✅ TEST 5 LULUS: Pencarian multi-kata 'beat 2018' sukses menemukan 'Honda Beat FI ESP 2018'");

// Test 6: Cari typo 'laptp' (tanpa o)
const res6 = searchListings("laptp", mockListings, cache);
if (res6.length !== 1 || res6[0].id !== "item-2") {
  console.error("TEST 6 GAGAL:", res6);
  process.exit(1);
}
console.log("✅ TEST 6 LULUS: Toleransi typo 'laptp' sukses menemukan 'Laptop'");

console.log("\n🏆 SEMUA TEST STANDAR TINGGI LULUS 100%! 🏆");
