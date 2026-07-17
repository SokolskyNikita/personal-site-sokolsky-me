const fs = require('fs');

const dataPath = '/Users/nsokolsky/.cursor/projects/Users-nsokolsky-projects-personal-site-sokolsky-me/agent-tools/1f2628b9-bbb9-4a93-8526-f37cb3ce7e91.txt';
const content = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(content);

console.log(JSON.stringify(data.ads, null, 2));
