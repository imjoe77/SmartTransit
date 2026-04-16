const fs = require('fs');
let c = fs.readFileSync('lib/rag.ts', 'utf8');

// Fix the initKnowledge function to use textSummary instead of text
c = c.replace(
  'const text = baseText + performanceText;',
  'const textSummary = baseText + performanceText;'
);
c = c.replace(
  'console.log("[RAG] Indexing:", text);',
  'console.log("[RAG] Indexing:", textSummary);'
);
c = c.replace(
  'const embedding = await getEmbedding(text);',
  'const embedding = await getEmbedding(textSummary);'
);
c = c.replace(
  'await RouteKnowledge.create({ text, embedding });',
  'await RouteKnowledge.create({ routeId: route.routeId || "", type: "route_summary", textSummary, embedding });'
);

fs.writeFileSync('lib/rag.ts', c);
console.log('Done - rag.ts patched successfully');
