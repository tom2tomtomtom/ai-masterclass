// Check which courses have lessons
const fetch = require('node-fetch');

async function checkLessons() {
  try {
    console.log('🔍 Checking which courses have lessons...');
    
    const coursesResponse = await fetch('http://localhost:8000/api/courses');
    const coursesData = await coursesResponse.json();
    
    console.log(`Found ${coursesData.data.length} courses`);
    
    for (const course of coursesData.data.slice(0, 5)) { // Check first 5 courses
      try {
        const lessonsResponse = await fetch(`http://localhost:8000/api/courses/${course.id}/lessons`);
        const lessonsData = await lessonsResponse.json();
        
        console.log(`📚 ${course.title}:`);
        console.log(`   Course ID: ${course.id}`);
        console.log(`   Lessons: ${lessonsData.data ? lessonsData.data.length : 0}`);
        
        if (lessonsData.data && lessonsData.data.length > 0) {
          const firstLesson = lessonsData.data[0];
          console.log(`   First lesson: "${firstLesson.title}" (${firstLesson.content ? firstLesson.content.length : 0} chars)`);
        }
        console.log('');
      } catch (error) {
        console.log(`   Error fetching lessons: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkLessons();