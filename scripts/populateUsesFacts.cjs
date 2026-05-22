const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../src/constants/periodicTableData.ts');
const backupPath = srcPath + '.bak';
const txt = fs.readFileSync(srcPath, 'utf8');
fs.writeFileSync(backupPath, txt, 'utf8');

const startToken = 'const PERIODIC_TABLE_DATA';
const start = txt.indexOf(startToken);
if (start === -1) {
  console.error('PERIODIC_TABLE_DATA start not found');
  process.exit(1);
}
const arrOpen = txt.indexOf('[', start);
const arrClose = txt.indexOf('];', arrOpen);
if (arrOpen === -1 || arrClose === -1) {
  console.error('Array bounds not found');
  process.exit(1);
}

const arrayText = txt.slice(arrOpen + 1, arrClose);

function splitTopLevelObjects(s) {
  const objs = [];
  let depth = 0;
  let startIdx = null;
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (ch === '\\' && i + 1 < s.length) { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    } else {
      if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    }
    if (ch === '{') {
      if (depth === 0) startIdx = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && startIdx !== null) {
        objs.push(s.slice(startIdx, i + 1));
        startIdx = null;
      }
    }
  }
  return objs;
}

const objects = splitTopLevelObjects(arrayText);
const modified = objects.map((obj) => {
  const hasUses = /\buses\s*:\s*\[/.test(obj);
  const hasFacts = /\binterestingFacts\s*:\s*\[/.test(obj);
  let out = obj;
  if (!hasUses || !hasFacts) {
    // insert before final closing brace
    const insertParts = [];
    if (!hasUses) insertParts.push('  uses: ["No recorded uses."],');
    if (!hasFacts) insertParts.push('  interestingFacts: ["No notable facts recorded."],');
    const insertText = '\n' + insertParts.join('\n') + '\n';
    out = obj.replace(/}\s*$/m, (m) => insertText + '}');
  }
  return out;
});

const newArrayText = modified.join(',\n\n');
const newTxt = txt.slice(0, arrOpen + 1) + '\n' + newArrayText + '\n' + txt.slice(arrClose);
fs.writeFileSync(srcPath, newTxt, 'utf8');
console.log('populateUsesFacts: updated', objects.length, 'objects; backup at', backupPath);
process.exit(0);
