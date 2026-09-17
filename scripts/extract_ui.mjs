import fs from 'fs';

const md = fs.readFileSync('AEGIS_UI_HANDOFF_COMPLETE.md', 'utf-8');

const regex = /# FILE: `([^`]+)`\n\n```[a-z]*\n([\s\S]*?)```/g;
let match;
while ((match = regex.exec(md)) !== null) {
  const filepath = match[1];
  const content = match[2];
  
  if (!filepath.startsWith('aegis-ui-handoff/')) continue;
  
  const destPath = filepath.replace('aegis-ui-handoff/', './ui-handoff/');
  const dir = destPath.substring(0, destPath.lastIndexOf('/'));
  
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(destPath, content);
  console.log('Extracted', destPath);
}
