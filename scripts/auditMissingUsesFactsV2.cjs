const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/constants/periodicTableData.ts');
const txt = fs.readFileSync(filePath, 'utf8');
const lines = txt.split(/\r?\n/);

const elementIndices = [];
for (let i = 0; i < lines.length; i++) {
  if (/^\s*atomicNumber\s*:/i.test(lines[i])) elementIndices.push(i);
}

const report = [];
const missingUses = [];
const missingFacts = [];

for (let idx = 0; idx < elementIndices.length; idx++) {
  const start = elementIndices[idx];
  const end = idx + 1 < elementIndices.length ? elementIndices[idx + 1] : lines.length;
  const block = lines.slice(start, end).join('\n');
  const anMatch = block.match(/atomicNumber\s*:\s*(\d+)/);
  const symMatch = block.match(/symbol\s*:\s*['\"]([^'\"]+)['\"]/);
  const nameMatch = block.match(/name\s*:\s*['\"]([^'\"]+)['\"]/);
  const an = anMatch ? Number(anMatch[1]) : null;
  const sym = symMatch ? symMatch[1] : '?';
  const name = nameMatch ? nameMatch[1] : '?';

  const usesMatch = block.match(/uses\s*:\s*\[([\s\S]*?)\]/);
  let usesCount = 0;
  if (usesMatch) {
    const inner = usesMatch[1];
    const q = inner.match(/['\"][^'\"]+['\"]/g);
    usesCount = q ? q.length : 0;
  }

  const factsMatch = block.match(/interestingFacts\s*:\s*\[([\s\S]*?)\]/);
  let factsCount = 0;
  if (factsMatch) {
    const inner = factsMatch[1];
    const q = inner.match(/['\"][^'\"]+['\"]/g);
    factsCount = q ? q.length : 0;
  }

  report.push({ atomicNumber: an, symbol: sym, name, usesCount, factsCount });
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
