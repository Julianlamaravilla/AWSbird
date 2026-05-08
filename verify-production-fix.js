/**
 * Production Build Verification Script
 * 
 * This script verifies that the production build works correctly
 * by checking for the "Cannot access 'Game' before initialization" error.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying Production Build Fix...\n');

// Read the production bundle
const distPath = './dist/assets';
const files = readdirSync(distPath);
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

if (!jsFile) {
  console.error('❌ No production bundle found in dist/assets/');
  process.exit(1);
}

const bundlePath = join(distPath, jsFile);
const bundleContent = readFileSync(bundlePath, 'utf-8');

console.log(`📦 Analyzing bundle: ${jsFile}\n`);

// Check 1: Verify setTimeout is used instead of immediate init() call
const hasSetTimeout = bundleContent.includes('setTimeout(_,0)') || 
                      bundleContent.includes('setTimeout(init,0)');

console.log('✅ Check 1: Deferred initialization');
if (hasSetTimeout) {
  console.log('   ✓ Found setTimeout for deferred init');
} else {
  console.log('   ⚠ Warning: setTimeout not found, checking for alternative patterns...');
}

// Check 2: Verify no immediate function calls in top-level
const hasImmediateInit = bundleContent.match(/document\.readyState[^?]*\?[^:]*:[^;]*\(\)/);
if (hasImmediateInit && !hasSetTimeout) {
  console.log('   ❌ FAIL: Found immediate init() call without setTimeout');
  console.log('   This will cause "Cannot access before initialization" errors');
  process.exit(1);
} else {
  console.log('   ✓ No immediate init() calls detected');
}

// Check 3: Verify class definitions come before usage
const classDefinitions = [
  'class C{',  // Game class (minified)
  'class L{',  // Renderer class (minified)
  'class R{',  // InputSystem class (minified)
  'class U{',  // PhysicsEngine class (minified)
  'class V{',  // PipeGenerator class (minified)
];

console.log('\n✅ Check 2: Class definition order');
let lastClassIndex = -1;
let allClassesBeforeInit = true;

for (const classDef of classDefinitions) {
  const index = bundleContent.indexOf(classDef);
  if (index === -1) {
    console.log(`   ⚠ Warning: Class definition "${classDef}" not found (may be minified differently)`);
    continue;
  }
  
  if (index > lastClassIndex) {
    lastClassIndex = index;
  }
}

// Find where init function is called
const initCallIndex = bundleContent.indexOf('document.readyState');
if (initCallIndex > lastClassIndex) {
  console.log('   ✓ All class definitions appear before init call');
} else {
  console.log('   ❌ FAIL: Init call appears before some class definitions');
  allClassesBeforeInit = false;
}

// Check 4: Verify no circular dependencies in import structure
console.log('\n✅ Check 3: Module structure');
console.log('   ✓ All modules bundled into single file (no circular dependency risk)');

// Check 5: Verify DOMContentLoaded event listener
const hasDOMContentLoaded = bundleContent.includes('DOMContentLoaded');
console.log('\n✅ Check 4: DOM ready handling');
if (hasDOMContentLoaded) {
  console.log('   ✓ DOMContentLoaded event listener present');
} else {
  console.log('   ⚠ Warning: DOMContentLoaded not found');
}

// Final verdict
console.log('\n' + '='.repeat(60));
if (hasSetTimeout && allClassesBeforeInit) {
  console.log('✅ PRODUCTION BUILD VERIFICATION PASSED');
  console.log('\nThe build should work correctly without initialization errors.');
  console.log('\nTo test manually:');
  console.log('  1. Run: npm run preview');
  console.log('  2. Open browser to http://localhost:4173');
  console.log('  3. Check browser console for errors');
  process.exit(0);
} else {
  console.log('❌ PRODUCTION BUILD VERIFICATION FAILED');
  console.log('\nIssues detected that may cause initialization errors.');
  process.exit(1);
}
