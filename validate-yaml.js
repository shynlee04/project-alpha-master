#!/usr/bin/env node

import { readFileSync } from 'fs';
import yaml from 'js-yaml';

const files = [
  { path: '_bmad-output/sprint-artifacts/sprint-status.yaml', name: 'sprint-status.yaml' },
  { path: 'bmm-workflow-status.yaml', name: 'bmm-workflow-status.yaml' }
];

console.log('='.repeat(80));
console.log('YAML VALIDATION REPORT');
console.log('='.repeat(80));
console.log();

for (const file of files) {
  console.log(`\n📄 Validating: ${file.name}`);
  console.log('─'.repeat(80));

  try {
    const content = readFileSync(file.path, 'utf8');
    const parsed = yaml.load(content);

    console.log(`✅ Parsed successfully`);
    console.log(`   Size: ${content.length} characters`);
    console.log(`   Lines: ${content.split('\n').length}`);

    // Check for duplicate keys by parsing with strict mode
    try {
      const strictParsed = yaml.load(content, { schema: yaml.FAILSAFE_SCHEMA });
      console.log(`✅ No duplicate keys found`);
    } catch (dupError) {
      console.log(`❌ Duplicate keys detected:`);
      console.log(`   ${dupError.message}`);
    }

  } catch (error) {
    console.log(`❌ YAML Parsing Error:`);
    console.log(`   Message: ${error.message}`);
    if (error.mark) {
      console.log(`   Position: line ${error.mark.line + 1}, column ${error.mark.column}`);
      console.log(`   Context: ${error.mark.buffer?.substring(error.mark.position - 30, error.mark.position + 30)}`);
    }
  }

  console.log();
}

console.log('='.repeat(80));
console.log('Validation complete');
console.log('='.repeat(80));
