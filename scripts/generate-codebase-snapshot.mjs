import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('.');
const outputFile = path.join(rootDir, 'docs', 'CODEBASE_SNAPSHOT.txt');

const exclusions = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.env',
  '.env.local',
  'docs/CODEBASE_SNAPSHOT.txt'
];

function shouldExclude(itemPath) {
  return exclusions.some(ex => itemPath.includes(ex));
}

function walkSync(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (shouldExclude(filePath)) continue;
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = walkSync(rootDir).sort();
let snapshotContent = '';

for (const file of allFiles) {
  const relPath = path.relative(rootDir, file);
  snapshotContent += `============================================================\n`;
  snapshotContent += `FILE: ${relPath}\n`;
  snapshotContent += `============================================================\n\n`;
  snapshotContent += fs.readFileSync(file, 'utf8') + '\n\n';
}

fs.writeFileSync(outputFile, snapshotContent);
console.log(`Snapshot generated at ${outputFile}`);
