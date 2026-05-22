const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/constants/periodicTableData.ts');
const txt = fs.readFileSync(filePath, 'utf8');

const start = txt.indexOf('const PERIODIC_TABLE_DATA');
if (start === -1) {
  console.error('PERIODIC_TABLE_DATA not found');
  process.exit(2);
}
const arrOpen = txt.indexOf('[', start);
const arrClose = txt.indexOf('];', arrOpen);
const arrayText = txt.slice(arrOpen + 1, arrClose);

const items = arrayText.split(/},\s*\n\s*{/m).map((chunk, idx, arr) => {
  let s = chunk;
  if (idx !== 0) s = '{' + s;
  if (idx !== arr.length - 1) s = s + '}';
  return s;
});

function extractArrayCount(block, key) {
  const re = new RegExp(key + '\\s*:\\s*\\[([\s\S]*?)\\]');
  const m = block.match(re);
  if (!m) return 0;
  const inner = m[1].trim();
  if (!inner) return 0;
  const regex = /['"]([^'\"]+)['"]/g;
  let count = 0;
  let mm;
  while ((mm = regex.exec(inner)) !== null) count++;
  return count;
}

const report = [];
const missingUses = [];
const missingFacts = [];

for (const block of items) {
  const an = (block.match(/atomicNumber\s*:\s*(\d+)/) || [])[1];
  const sym = (block.match(/symbol\s*:\s*['\"]([^'\"]+)['\"]/) || [])[1] || '?';
  const name = (block.match(/name\s*:\s*['\"]([^'\"]+)['\"]/) || [])[1] || '?';
  const usesCount = extractArrayCount(block, 'uses');
  const factsCount = extractArrayCount(block, 'interestingFacts');
  report.push({ atomicNumber: an ? Number(an) : null, symbol: sym, name, usesCount, factsCount });
  if (usesCount === 0) missingUses.push(`${an || '?'}:${sym}:${name}`);
  if (factsCount === 0) missingFacts.push(`${an || '?'}:${sym}:${name}`);
}

report.sort((a,b)=> (a.atomicNumber||0)-(b.atomicNumber||0));

console.log('atomicNumber,symbol,name,usesCount,factsCount');
for (const r of report) console.log(`${r.atomicNumber},${r.symbol},"${r.name}",${r.usesCount},${r.factsCount}`);

console.log('\nSummary:');
console.log(`Total elements scanned: ${report.length}`);
console.log(`Elements missing uses: ${missingUses.length}`);
if (missingUses.length>0) console.log(missingUses.join(', '));
console.log(`Elements missing facts: ${missingFacts.length}`);
if (missingFacts.length>0) console.log(missingFacts.join(', '));

process.exit(0);
