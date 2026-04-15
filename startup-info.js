const reset = "\x1b[0m";
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const magenta = "\x1b[35m";
const bold = "\x1b[1m";

console.log(`\n${cyan}======================================================${reset}`);
console.log(`${bold}${green} ArtisticEye Rendszer Indítása Folyamatban...${reset}`);
console.log(`${cyan}======================================================${reset}\n`);

console.log(`${bold}A szolgáltatások hamarosan elérhetők az alábbi linkeken:${reset}\n`);

console.log(`  ${yellow} 1. Weboldal (Frontend):${reset}         http://localhost:5173`);
console.log(`  ${yellow}  2. Adatbázis (phpMyAdmin):${reset}         http://localhost:8080`);
console.log(`  ${yellow} 3. Docusaurus (Dokumentáció):${reset}   http://localhost:3001`);
console.log(`  ${yellow}  4. Backend API:${reset}                  http://localhost:3000\n`);

console.log(`${cyan}======================================================${reset}`);
console.log(`${magenta}A szerverek naplózása (logok) alább láthatóak 👇${reset}\n`);