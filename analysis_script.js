const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles('src');
const godFiles = [];
const importCounts = {};
const allImports = new Set();

// 1. Identify God Files and collect all imports
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n').length;
  
  if (lines > 500) {
    godFiles.push({ file, lines });
  }

  // Regex to capture imports: import ... from '@/...' or require('@/...')
  // Simplified regex for static imports
  const importMatches = content.match(/from\s+['"]@\/([^'"]+)['"]/g);
  
  if (importMatches) {
    importMatches.forEach(match => {
      const importPath = match.match(/['"]@\/([^'"]+)['"]/)[1];
      // Normalize path somewhat (remove extensions if present, though usually not in imports)
      const normalizedPath = importPath.replace(/\.(ts|tsx|js|jsx)$/, '');
      
      importCounts[normalizedPath] = (importCounts[normalizedPath] || 0) + 1;
      allImports.add(normalizedPath);
    });
  }
});

// Sort God Files
godFiles.sort((a, b) => b.lines - a.lines);

console.log("---GOD_FILES---");
godFiles.forEach(gf => console.log(`${gf.file}|${gf.lines}`));

// 2. Hub Files (Imported by > 20)
console.log("\n---HUB_FILES---");
Object.entries(importCounts)
  .sort(([,a], [,b]) => b - a)
  .filter(([,count]) => count > 20)
  .slice(0, 30)
  .forEach(([path, count]) => console.log(`${path}|${count}`));

// 3. Potential Orphans (Naive check)
// Convert file paths to import paths to check against allImports
console.log("\n---POTENTIAL_ORPHANS_SAMPLE---");
let orphanCount = 0;
allFiles.forEach(file => {
    if (orphanCount >= 10) return; // Limit output
    
    // Convert absolute path to relative to src, then to alias format
    const relativePath = path.relative('src', file);
    const aliasPath = relativePath.replace(/\.(ts|tsx|js|jsx)$/, '');
    const indexAliasPath = aliasPath.replace(/\/index$/, '');
    
    // Check if imported as file or as directory (index)
    if (!allImports.has(aliasPath) && !allImports.has(indexAliasPath) && !file.includes('routes/') && !file.includes('main.tsx') && !file.includes('App.tsx')) {
        // Exclude some obvious entry points
        console.log(file);
        orphanCount++;
    }
});
