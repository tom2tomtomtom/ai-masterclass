
// Safe content extraction function for lesson seeding
function extractSafeContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Sanitize content for JSON insertion
  return content
    // Replace problematic characters
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')        // Escape quotes
    .replace(/'/g, "\\'")        // Escape single quotes
    .replace(/\n/g, '\\n')      // Escape newlines
    .replace(/\r/g, '\\r')      // Escape carriage returns
    .replace(/\t/g, '\\t')      // Escape tabs
    // Remove control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove problematic Unicode
    .replace(/[\u2028\u2029]/g, '')
    // Limit length to prevent oversized JSON
    .substring(0, 50000);
}

module.exports = { extractSafeContent };
