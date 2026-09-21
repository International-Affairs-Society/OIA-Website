const fs = require('fs');

const f1 = 'src/app/admin/archived/page.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/const token = localStorage\.getItem\("access_token"\);\r?\n/, '');
c1 = c1.replace(/const headers: Record<string, string> = token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\};\r?\n/, '');
c1 = c1.replace(/fetch\(`\$\{API_URL\}/g, 'apiFetch(`');
c1 = c1.replace(/, \{ headers \}/g, '');
if (!c1.includes('import { apiFetch }')) {
  c1 = `import { apiFetch } from "@/lib/apiFetch";\n` + c1;
}
fs.writeFileSync(f1, c1);

const f2 = 'src/app/admin/users/page.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/^[ \t]*const token = localStorage\.getItem\("access_token"\);\r?\n/gm, '');
c2 = c2.replace(/^[ \t]*const headers = token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\};\r?\n/gm, '');
c2 = c2.replace(/fetch\(`\$\{API_URL\}/g, 'apiFetch(`');
c2 = c2.replace(/fetch\(/g, 'apiFetch(');
c2 = c2.replace(/\$\{API_URL\}/g, ''); // Removes API_URL from url string building
c2 = c2.replace(/^[ \t]*const API_URL = process\.env\.NEXT_PUBLIC_API_URL(?: \|\| "http:\/\/localhost:3001")?;\r?\n/gm, '');
// Remove headers object from POST/PATCH
c2 = c2.replace(/headers:\s*\{\s*"Content-Type": "application\/json",\s*(?:\.\.\.\(token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\}\),?)?\s*\},\s*/g, '');
// Remove trailing empty headers block
c2 = c2.replace(/headers:\s*\{\s*\},?\s*/g, '');
if (!c2.includes('import { apiFetch }')) {
  c2 = `import { apiFetch } from "@/lib/apiFetch";\n` + c2;
}
fs.writeFileSync(f2, c2);

const f3 = 'src/app/admin/visits/edit/[id]/page.tsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(/^[ \t]*const token = localStorage\.getItem\("access_token"\);\r?\n/gm, '');
c3 = c3.replace(/^[ \t]*const API_URL = process\.env\.NEXT_PUBLIC_API_URL(?: \|\| "http:\/\/localhost:3001")?;\r?\n/gm, '');
c3 = c3.replace(/fetch\(`\$\{API_URL\}/g, 'apiFetch(`');
c3 = c3.replace(/,\s*\{\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\}\s*\}/g, '');
// In case of headers: token ? ...
c3 = c3.replace(/,\s*headers:\s*token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\}/g, '');
c3 = c3.replace(/,\s*headers:\s*\{\s*"Content-Type": "application\/json",\s*\.\.\.\(token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\}\)\s*\}/g, '');
c3 = c3.replace(/,\s*headers:\s*\{\s*"Content-Type": "application\/json",\s*\.\.\.\(token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\}\),\s*\}/g, '');
if (!c3.includes('import { apiFetch }')) {
  c3 = `import { apiFetch } from "@/lib/apiFetch";\n` + c3;
}
fs.writeFileSync(f3, c3);

console.log("Done");
