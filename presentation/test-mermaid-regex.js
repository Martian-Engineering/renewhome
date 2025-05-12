// Test file for mermaid regex

// Current regex (for markdown format)
const currentMermaidRegex = /```mermaid\n([\s\S]*?)```/g;

// New regex to match HTML format from marked.js
const newMermaidRegex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

// Sample HTML from marked.js
const sampleHtml = `
<h1>Test Markdown</h1>
<p>This is a test with a mermaid diagram:</p>
<pre><code class="language-mermaid">flowchart TD
    A[System Prompt] --&gt; B[User Input]
    B --&gt; C[Assistant Output]
    C --&gt; D[User Input]
    D --&gt; E[Assistant Output]
    E --&gt; F[User Input]
    F --&gt; G[Assistant Output]
</code></pre>
<p>And some more content after it.</p>
`;

// Test the current regex
const currentMatches = [...sampleHtml.matchAll(currentMermaidRegex)];
console.log('Current regex matches:', currentMatches.length);
currentMatches.forEach((match, i) => {
  console.log(`Match ${i + 1}:`, match[1].trim().substring(0, 30) + '...');
});

// Test the new regex
const newMatches = [...sampleHtml.matchAll(newMermaidRegex)];
console.log('\nNew regex matches:', newMatches.length);
newMatches.forEach((match, i) => {
  console.log(`Match ${i + 1}:`, match[1].trim().substring(0, 30) + '...');
});

// Function to test a regex pattern on HTML content
function testRegex(name, regex, html) {
  console.log(`\nTesting: ${name}`);
  const matches = [...html.matchAll(regex)];
  console.log(`Found: ${matches.length} matches`);
  
  if (matches.length > 0) {
    console.log('First match content preview:');
    console.log(matches[0][1].trim().substring(0, 50) + '...');
  }
  
  return matches.length;
}

// Test a few alternative regex patterns
const patterns = {
  'Original Markdown Pattern': /```mermaid\n([\s\S]*?)```/g,
  'HTML Pattern': /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
  'Flexible HTML Pattern': /<pre>\s*<code[^>]*class="[^"]*language-mermaid[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g,
  'Simple Class Pattern': /<code[^>]*class="[^"]*language-mermaid[^"]*"[^>]*>([\s\S]*?)<\/code>/g,
};

Object.entries(patterns).forEach(([name, pattern]) => {
  testRegex(name, pattern, sampleHtml);
});

// Verify recommended solution
console.log('\n=== RECOMMENDED SOLUTION ===');
const recommendedRegex = /<pre>\s*<code[^>]*class="[^"]*language-mermaid[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
const recommendedMatches = [...sampleHtml.matchAll(recommendedRegex)];
console.log('Matches found:', recommendedMatches.length);
if (recommendedMatches.length > 0) {
  console.log('Extracted diagram:');
  console.log('---');
  console.log(recommendedMatches[0][1].trim());
  console.log('---');
}