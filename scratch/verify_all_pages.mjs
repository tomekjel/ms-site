// Automated verification script for all routes and language switching

const baseUrl = 'http://localhost:4321';

const routes = [
  '',
  '/serwis-telewizorow',
  '/serwis-laptopow',
  '/serwis-komputerow',
  '/serwis-konsol',
  '/cennik',
  '/about',
  '/faq',
  '/kontakt',
  '/case-studies'
];

const langs = [
  { lang: 'pl', prefix: '' },
  { lang: 'en', prefix: '/en' },
  { lang: 'uk', prefix: '/uk' }
];

let failed = 0;
let passed = 0;

console.log('--- TESTING ALL 30 ROUTES FOR HTTP 200 ---');

for (const { lang, prefix } of langs) {
  for (const route of routes) {
    const testPath = `${prefix}${route}` || '/';
    const url = `${baseUrl}${testPath}`;
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        console.log(`[PASS] [${lang.toUpperCase()}] ${testPath} -> 200 OK`);
        passed++;
      } else {
        console.error(`[FAIL] [${lang.toUpperCase()}] ${testPath} -> Status ${res.status}`);
        failed++;
      }
    } catch (e) {
      console.error(`[ERR]  [${lang.toUpperCase()}] ${testPath} -> ${e.message}`);
      failed++;
    }
  }
}

console.log('\n--- TESTING LANGUAGE SWITCHER ROUTES PRESERVATION ---');

const sampleSubpages = [
  '/serwis-telewizorow',
  '/serwis-laptopow',
  '/cennik',
  '/kontakt',
  '/case-studies'
];

for (const subpage of sampleSubpages) {
  // Test from PL
  const plRes = await fetch(`${baseUrl}${subpage}`);
  const plHtml = await plRes.text();
  
  const hasEnLink = plHtml.includes(`href="/en${subpage}"`);
  const hasUkLink = plHtml.includes(`href="/uk${subpage}"`);
  const hasPlLink = plHtml.includes(`href="${subpage}"`);
  
  if (hasEnLink && hasUkLink && hasPlLink) {
    console.log(`[PASS] Route preservation on PL ${subpage} -> EN: /en${subpage}, UK: /uk${subpage}`);
    passed++;
  } else {
    console.error(`[FAIL] Route preservation broken on PL ${subpage}: en=${hasEnLink}, uk=${hasUkLink}, pl=${hasPlLink}`);
    failed++;
  }

  // Test from EN
  const enRes = await fetch(`${baseUrl}/en${subpage}`);
  const enHtml = await enRes.text();
  const enHasEn = enHtml.includes(`href="/en${subpage}"`);
  const enHasUk = enHtml.includes(`href="/uk${subpage}"`);
  const enHasPl = enHtml.includes(`href="${subpage}"`);
  
  if (enHasEn && enHasUk && enHasPl) {
    console.log(`[PASS] Route preservation on EN /en${subpage} -> PL: ${subpage}, UK: /uk${subpage}`);
    passed++;
  } else {
    console.error(`[FAIL] Route preservation broken on EN /en${subpage}: en=${enHasEn}, uk=${enHasUk}, pl=${enHasPl}`);
    failed++;
  }

  // Test from UK
  const ukRes = await fetch(`${baseUrl}/uk${subpage}`);
  const ukHtml = await ukRes.text();
  const ukHasEn = ukHtml.includes(`href="/en${subpage}"`);
  const ukHasUk = ukHtml.includes(`href="/uk${subpage}"`);
  const ukHasPl = ukHtml.includes(`href="${subpage}"`);
  
  if (ukHasEn && ukHasUk && ukHasPl) {
    console.log(`[PASS] Route preservation on UK /uk${subpage} -> PL: ${subpage}, EN: /en${subpage}`);
    passed++;
  } else {
    console.error(`[FAIL] Route preservation broken on UK /uk${subpage}: en=${ukHasEn}, uk=${ukHasUk}, pl=${ukHasPl}`);
    failed++;
  }
}

console.log('\n--- TESTING NAVBAR LOCALIZATION ON EN & UK ---');

const enHomeRes = await fetch(`${baseUrl}/en`);
const enHomeHtml = await enHomeRes.text();
if (enHomeHtml.includes('href="/en/serwis-telewizorow"') && enHomeHtml.includes('href="/en/cennik"') && enHomeHtml.includes('href="/en/kontakt"')) {
  console.log('[PASS] EN Navbar links correctly prefixed with /en/');
  passed++;
} else {
  console.error('[FAIL] EN Navbar links missing /en/ prefix');
  failed++;
}

const ukHomeRes = await fetch(`${baseUrl}/uk`);
const ukHomeHtml = await ukHomeRes.text();
if (ukHomeHtml.includes('href="/uk/serwis-telewizorow"') && ukHomeHtml.includes('href="/uk/cennik"') && ukHomeHtml.includes('href="/uk/kontakt"')) {
  console.log('[PASS] UK Navbar links correctly prefixed with /uk/');
  passed++;
} else {
  console.error('[FAIL] UK Navbar links missing /uk/ prefix');
  failed++;
}

console.log(`\n================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================`);

if (failed > 0) process.exit(1);
