const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const allFiles = findFiles(srcDir);
let migratedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // If the file doesn't have fetch or localStorage, skip it (unless it's the lib file itself)
  if (!content.includes('fetch') && !content.includes('localStorage.getItem')) continue;
  if (file.includes('apiFetch.ts') || file.includes('AuthContext.tsx')) continue;

  let modified = false;

  // 1. Remove standard token extractions
  const tokenRegexes = [
    /^[ \t]*const token = localStorage\.getItem\(['"]access_token['"]\);?\r?\n/gm,
    /^[ \t]*let token = localStorage\.getItem\(['"]access_token['"]\);?\r?\n/gm,
    /^[ \t]*const headers:[^=]+ = token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\};\r?\n/gm,
    /^[ \t]*const headers: Record<string, string> = token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\};\r?\n/gm,
    /^[ \t]*const headers = token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\};\r?\n/gm
  ];
  for (const r of tokenRegexes) {
    if (r.test(content)) {
      content = content.replace(r, '');
      modified = true;
    }
  }

  // 2. Replace fetch calls that have `${API_URL}` or `API_URL +`
  
  // Replace fetch(`${API_URL}/path`...) with apiFetch(`/path`...)
  // and remove the headers: token ? { Authorization: ... } completely
  
  // Example with inline localStorage:
  // fetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } })
  const fetchRegexInline = /fetch\(`\$\{API_URL\}([^`]+)`,\s*\{\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{localStorage\.getItem\([^)]+\)\}`\s*\}\s*\}\)/g;
  if (fetchRegexInline.test(content)) {
    content = content.replace(fetchRegexInline, 'apiFetch(`$1`)');
    modified = true;
  }

  // Replace URL prefix
  if (content.includes('fetch(`${API_URL}')) {
    content = content.replace(/fetch\(`\$\{API_URL\}/g, 'apiFetch(`');
    modified = true;
  }

  // Remove headers: token ? { Authorization: `Bearer ${token}` } : {},
  if (content.match(/^[ \t]*headers:\s*token\s*\?\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*:\s*\{\},?\r?\n/gm)) {
    content = content.replace(/^[ \t]*headers:\s*token\s*\?\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*:\s*\{\},?\r?\n/gm, '');
    modified = true;
  }
  
  // Remove ...(token ? { Authorization: `Bearer ${token}` } : {}),
  if (content.match(/^[ \t]*\.\.\.\(token\s*\?\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*:\s*\{\}\),?\r?\n/gm)) {
    content = content.replace(/^[ \t]*\.\.\.\(token\s*\?\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*:\s*\{\}\),?\r?\n/gm, '');
    modified = true;
  }

  // Remove ...(token ? { Authorization: `Bearer ${token}` } : {}) 
  if (content.match(/^[ \t]*\.\.\.\(token\s*\?\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*:\s*\{\}\)[ \t]*\r?\n/gm)) {
    content = content.replace(/^[ \t]*\.\.\.\(token\s*\?\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*:\s*\{\}\)[ \t]*\r?\n/gm, '');
    modified = true;
  }
  
  // Remove headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
  if (content.match(/^[ \t]*headers:\s*\{\s*Authorization:\s*`Bearer \$\{localStorage\.getItem\([^)]+\)\}`\s*\},?\r?\n/gm)) {
    content = content.replace(/^[ \t]*headers:\s*\{\s*Authorization:\s*`Bearer \$\{localStorage\.getItem\([^)]+\)\}`\s*\},?\r?\n/gm, '');
    modified = true;
  }
  
  // Clean up unused API_URL variables
  const apiUrlRegex = /^[ \t]*const API_URL = process\.env\.NEXT_PUBLIC_API_URL(?: \|\| ['"]http:\/\/localhost:3001['"])?;?\r?\n/gm;
  if (apiUrlRegex.test(content)) {
    content = content.replace(apiUrlRegex, '');
    modified = true;
  }
  
  // Empty options left behind: apiFetch(`/path`, { \n }) -> apiFetch(`/path`)
  if (content.match(/,\s*\{\s*\}\)/g)) {
    content = content.replace(/,\s*\{\s*\}\)/g, ')');
    modified = true;
  }
  
  // Remove empty headers blocks inside fetch/apiFetch
  content = content.replace(/headers:\s*\{\s*\},?\r?\n/gm, '');

  if (modified && content !== originalContent) {
    // Add import statement if we used apiFetch
    if (content.includes('apiFetch(') && !content.includes('import { apiFetch }')) {
      const importStmt = `import { apiFetch } from "@/lib/apiFetch";\n`;
      // Put it after other imports or at top
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.substring(0, nextLineIndex + 1) + importStmt + content.substring(nextLineIndex + 1);
      } else {
        content = importStmt + content;
      }
    }
    
    fs.writeFileSync(file, content);
    console.log(`Migrated: ${file.replace(__dirname, '')}`);
    migratedCount++;
  }
}

console.log(`\nTotal files migrated: ${migratedCount}`);
