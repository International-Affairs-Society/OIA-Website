const { execSync } = require('child_process');
require('dotenv').config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

try {
  execSync(`npx prisma db push --url="${url}"`, { stdio: 'inherit' });
  execSync(`npx prisma generate`, { stdio: 'inherit' });
} catch (e) {
  console.error(e);
  process.exit(1);
}
