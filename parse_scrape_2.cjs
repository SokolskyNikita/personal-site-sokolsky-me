const fs = require('fs');

const dataPath = '/Users/nsokolsky/.cursor/projects/Users-nsokolsky-projects-personal-site-sokolsky-me/agent-tools/57fe64a2-b84f-498a-9609-dc939f563be2.txt';
const content = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(content);

data.forEach((item, index) => {
  if (item.status !== "fulfilled") {
    console.log(`\nITEM ${index + 1}: FAILED`);
    return;
  }
  
  const url = item.value.url;
  const markdown = item.value.content || '';
  
  console.log(`\n==================================================`);
  console.log(`ITEM ${index + 1}: ${url}`);
  console.log(`==================================================`);
  
  // Look for title
  const titleMatch = markdown.match(/#\s+(.*)/);
  if (titleMatch) {
    console.log(`Title: ${titleMatch[1]}`);
  } else {
    const firstLine = markdown.split('\n').find(l => l.trim().length > 0);
    console.log(`First line: ${firstLine}`);
  }
  
  // Check if sold out
  const isSoldOut = markdown.toLowerCase().includes("lo sentimos, pero este alojamiento no admite reservas en nuestra página") ||
                    markdown.toLowerCase().includes("no admite reservas") ||
                    markdown.toLowerCase().includes("sold out") ||
                    markdown.toLowerCase().includes("no hay habitaciones disponibles") ||
                    markdown.toLowerCase().includes("no disponible") ||
                    markdown.toLowerCase().includes("no se puede reservar") ||
                    markdown.toLowerCase().includes("sorry, but this hotel is sold out") ||
                    markdown.toLowerCase().includes("we’re sold out") ||
                    markdown.toLowerCase().includes("sold out on our site");
                    
  console.log(`Sold out check: ${isSoldOut ? "POSSIBLY SOLD OUT / NOT BOOKABLE" : "Might be available"}`);
  
  // Let's find any price patterns like US$ or $ or ARS
  const lines = markdown.split('\n');
  const priceLines = [];
  lines.forEach((line, lineIdx) => {
    if (line.includes('US$') || line.includes('USD') || line.includes('ARS') || (line.includes('$') && /\d/.test(line))) {
      priceLines.push({ idx: lineIdx, text: line.trim() });
    }
  });
  
  console.log(`Found ${priceLines.length} lines with price patterns.`);
  console.log(`Sample lines:`);
  priceLines.slice(0, 20).forEach(pl => {
    console.log(`  Line ${pl.idx}: ${pl.text.substring(0, 150)}`);
  });
});
