const { execSync } = require('child_process');
const fs = require('fs');

function syncWithGit() {
  console.log('🔄 Syncing with Git Repository');
  console.log('==============================');
  console.log('Repository: github.com/tom2tomtomtom/AI-Masterclass');
  console.log('Working directory:', process.cwd());
  
  try {
    // Check if we're in a git repository
    console.log('\n📋 Checking Git Status...');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim()) {
      console.log('📝 Changes detected:');
      console.log(gitStatus);
      
      // Add all changes
      console.log('\n📦 Adding changes to git...');
      execSync('git add .', { stdio: 'inherit' });
      
      // Commit changes
      const commitMessage = `🔧 Fix JavaScript syntax errors in seed-complete-courses.js

- Fixed Pattern A error at line 5036 where content continued outside object boundaries
- Added proper lesson metadata structure (order_index, resources, learning_objectives)
- Created clean separation between "Problem-Solving Methodology" and "Business Applications" lessons
- Preserved all 206K+ words of premium educational content
- Maintained proper JavaScript object structure for database seeding

This fix enables the complete premium content to be loaded into the database.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      console.log('✅ Changes committed successfully');
      
      // Push to remote
      console.log('\n🚀 Pushing to remote repository...');
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Changes pushed to GitHub');
      
    } else {
      console.log('✅ Working directory is clean - no changes to commit');
    }
    
    // Show current git log
    console.log('\n📊 Recent commits:');
    const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' });
    console.log(recentCommits);
    
    return true;
    
  } catch (error) {
    console.error('❌ Git sync failed:', error.message);
    
    // Check if it's not a git repository
    if (error.message.includes('not a git repository')) {
      console.log('\n🔧 Initializing Git repository...');
      try {
        execSync('git init', { stdio: 'inherit' });
        execSync('git branch -M main', { stdio: 'inherit' });
        execSync(`git remote add origin https://github.com/tom2tomtomtom/AI-Masterclass.git`, { stdio: 'inherit' });
        
        console.log('✅ Git repository initialized');
        console.log('🔄 Now run this script again to commit and push changes');
        
      } catch (initError) {
        console.error('❌ Git initialization failed:', initError.message);
        return false;
      }
    }
    
    return false;
  }
}

// Change to the project directory
try {
  process.chdir('/Users/thomasdowuona-hyde/AI-Masterclass');
  console.log('📁 Changed to project directory');
} catch (error) {
  console.error('❌ Failed to change directory:', error.message);
  process.exit(1);
}

syncWithGit().then(success => {
  if (success) {
    console.log('\n🎉 Git sync completed successfully!');
    console.log('🔗 Repository: https://github.com/tom2tomtomtom/AI-Masterclass');
    console.log('⏭️  Next: Deploy to Railway to update production');
  } else {
    console.log('\n❌ Git sync failed - manual intervention may be required');
  }
}).catch(error => {
  console.error('Sync script failed:', error);
});