const fs = require('fs');
const path = require('path');

// Path to the `dist` directory
const targetDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@spree',
  'storefront-api-v2-sdk',
  'dist'
);

// Function to replace `global` with `globalThis` in a file
const replaceGlobalInFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/\bglobal\b/g, 'globalThis');

    // Only write back if there's a change to avoid unnecessary writes
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Recursively process all files in the directory
const processDirectory = (dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        processDirectory(fullPath); // Recurse into subdirectories
      } else if (path.extname(fullPath) === '.js') { // Only process .js files
        replaceGlobalInFile(fullPath);
      }
    });
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
};

// Process the `dist` directory
processDirectory(targetDir);

console.log(`Finished replacing 'global' with 'globalThis' in ${targetDir}`);
