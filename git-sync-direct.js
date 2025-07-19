const { execSync } = require('child_process');

console.log('🔄 Direct Git Sync');
console.log('==================');

// Change to project directory
process.chdir('/Users/thomasdowuona-hyde/AI-Masterclass');
console.log('📁 Working directory:', process.cwd());

try {
  // Check git status
  console.log('\n📋 Checking git status...');
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log('Git status output:', status.trim() || 'Clean working directory');
  
  if (status.trim()) {
    console.log('\n📦 Adding changes...');
    execSync('git add .', { stdio: 'inherit' });
    
    console.log('\n💬 Committing changes...');
    const commitMessage = 'Fix JavaScript syntax errors in premium content seed file - enable 206K+ words access';
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    console.log('\n🚀 Pushing to remote...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Git sync completed successfully!');
  } else {
    console.log('✅ No changes to commit - repository is clean');
  }
  
} catch (error) {
  console.error('❌ Git operation failed:', error.message);
  
  if (error.message.includes('not a git repository')) {
    console.log('\n🔧 Initializing git repository...');
    execSync('git init', { stdio: 'inherit' });
    execSync('git branch -M main', { stdio: 'inherit' });
    execSync('git remote add origin https://github.com/tom2tomtomtom/AI-Masterclass.git', { stdio: 'inherit' });
    console.log('✅ Git initialized - run script again to commit changes');
  }
}