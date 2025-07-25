const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditDatabaseContent() {
  try {
    console.log('🔍 COMPREHENSIVE DATABASE CONTENT AUDIT');
    console.log('=====================================');
    console.log(`Timestamp: ${new Date().toISOString()}\n`);
    
    const audit = {
      timestamp: new Date().toISOString(),
      tables: {},
      relationships: {},
      contentQuality: {},
      issues: []
    };

    // 1. AUDIT ALL TABLES
    console.log('📊 COUNTING RECORDS IN ALL TABLES');
    console.log('================================');
    
    const tablesToAudit = ['courses', 'modules', 'lessons', 'prompts', 'quizzes', 'tasks'];
    
    for (const tableName of tablesToAudit) {
      try {
        console.log(`\n📋 Auditing table: ${tableName}`);
        
        // Count total records
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.log(`   ❌ Could not access ${tableName}: ${countError.message}`);
          audit.issues.push(`Table ${tableName} not accessible: ${countError.message}`);
          audit.tables[tableName] = { exists: false, error: countError.message };
          continue;
        }
        
        console.log(`   📈 Total records: ${count || 0}`);
        audit.tables[tableName] = { 
          exists: true, 
          count: count || 0,
          records: []
        };
        
        // If table has records, get sample data
        if (count > 0) {
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(5);
          
          if (!sampleError && sampleData) {
            audit.tables[tableName].records = sampleData;
            
            // Analyze content quality
            if (tableName === 'lessons') {
              console.log('   🔍 Analyzing lesson content quality...');
              await analyzeLessonContent(sampleData, audit);
            }
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error auditing ${tableName}: ${error.message}`);
        audit.issues.push(`Error auditing ${tableName}: ${error.message}`);
      }
    }

    // 2. AUDIT FOREIGN KEY RELATIONSHIPS
    console.log('\n🔗 AUDITING FOREIGN KEY RELATIONSHIPS');
    console.log('===================================');
    
    await auditRelationships(audit);

    // 3. DETAILED CONTENT ANALYSIS
    console.log('\n📝 DETAILED CONTENT ANALYSIS');
    console.log('===========================');
    
    await analyzeContentQuality(audit);

    // 4. SAMPLE LESSON RECORDS
    console.log('\n📖 SAMPLING LESSON RECORDS');
    console.log('=========================');
    
    await sampleLessonRecords(audit);

    // 5. IDENTIFY CONTENT ISSUES
    console.log('\n⚠️  IDENTIFYING CONTENT ISSUES');
    console.log('=============================');
    
    identifyContentIssues(audit);

    // 6. FINAL SUMMARY
    console.log('\n📊 AUDIT SUMMARY');
    console.log('================');
    
    printAuditSummary(audit);

    return audit;

  } catch (error) {
    console.error('❌ Database audit failed:', error);
    throw error;
  }
}

async function analyzeLessonContent(lessons, audit) {
  const contentAnalysis = {
    richContent: 0,
    minimalContent: 0,
    emptyContent: 0,
    genericContent: 0,
    totalWords: 0
  };

  for (const lesson of lessons) {
    if (!lesson.content || lesson.content.trim().length === 0) {
      contentAnalysis.emptyContent++;
    } else {
      const wordCount = lesson.content.split(/\s+/).length;
      contentAnalysis.totalWords += wordCount;
      
      if (wordCount < 20) {
        contentAnalysis.minimalContent++;
      } else if (wordCount > 100) {
        contentAnalysis.richContent++;
      }
      
      // Check for generic content patterns
      const isGeneric = lesson.content.includes('Coming soon') || 
                       lesson.content.includes('TODO') ||
                       lesson.content.includes('Placeholder') ||
                       lesson.content.length < 50;
      
      if (isGeneric) {
        contentAnalysis.genericContent++;
      }
    }
  }

  audit.contentQuality.lessons = contentAnalysis;
  console.log(`   📊 Rich content lessons: ${contentAnalysis.richContent}`);
  console.log(`   📋 Minimal content lessons: ${contentAnalysis.minimalContent}`);
  console.log(`   📄 Empty content lessons: ${contentAnalysis.emptyContent}`);
  console.log(`   🤖 Generic content lessons: ${contentAnalysis.genericContent}`);
}

async function auditRelationships(audit) {
  // Check courses -> modules relationship
  try {
    const { data: modulesWithCourses, error } = await supabase
      .from('modules')
      .select('id, course_id, courses(id, title)')
      .limit(10);
    
    if (!error && modulesWithCourses) {
      const orphanedModules = modulesWithCourses.filter(m => !m.courses);
      console.log(`   ✅ Modules with valid course links: ${modulesWithCourses.length - orphanedModules.length}`);
      console.log(`   ⚠️  Orphaned modules: ${orphanedModules.length}`);
      
      audit.relationships.modulesToCourses = {
        valid: modulesWithCourses.length - orphanedModules.length,
        orphaned: orphanedModules.length,
        orphanedIds: orphanedModules.map(m => m.id)
      };
    }
  } catch (error) {
    console.log(`   ❌ Could not audit modules->courses: ${error.message}`);
    audit.issues.push(`Relationship audit failed: ${error.message}`);
  }

  // Check modules -> lessons relationship
  try {
    const { data: lessonsWithModules, error } = await supabase
      .from('lessons')
      .select('id, module_id, modules(id, title)')
      .limit(10);
    
    if (!error && lessonsWithModules) {
      const orphanedLessons = lessonsWithModules.filter(l => !l.modules);
      console.log(`   ✅ Lessons with valid module links: ${lessonsWithModules.length - orphanedLessons.length}`);
      console.log(`   ⚠️  Orphaned lessons: ${orphanedLessons.length}`);
      
      audit.relationships.lessonsToModules = {
        valid: lessonsWithModules.length - orphanedLessons.length,
        orphaned: orphanedLessons.length,
        orphanedIds: orphanedLessons.map(l => l.id)
      };
    }
  } catch (error) {
    console.log(`   ❌ Could not audit lessons->modules: ${error.message}`);
    audit.issues.push(`Relationship audit failed: ${error.message}`);
  }

  // Check prompts/quizzes/tasks -> lessons relationship
  for (const table of ['prompts', 'quizzes', 'tasks']) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id, lesson_id')
        .limit(10);
      
      if (!error && data) {
        const withLessons = data.filter(item => item.lesson_id);
        console.log(`   📋 ${table} linked to lessons: ${withLessons.length}/${data.length}`);
        
        audit.relationships[`${table}ToLessons`] = {
          total: data.length,
          linked: withLessons.length,
          unlinked: data.length - withLessons.length
        };
      }
    } catch (error) {
      console.log(`   ❌ Could not audit ${table}->lessons: ${error.message}`);
    }
  }
}

async function analyzeContentQuality(audit) {
  // Get all lessons for comprehensive analysis
  try {
    const { data: allLessons, error } = await supabase
      .from('lessons')
      .select('id, title, content, lesson_type, estimated_minutes, status, module_id');
    
    if (!error && allLessons) {
      const qualityMetrics = {
        total: allLessons.length,
        published: 0,
        draft: 0,
        withContent: 0,
        withoutContent: 0,
        wordCounts: [],
        lessonTypes: {},
        contentLengthDistribution: {
          empty: 0,
          minimal: 0, // < 100 words
          moderate: 0, // 100-500 words
          rich: 0 // > 500 words
        }
      };

      allLessons.forEach(lesson => {
        // Status analysis
        if (lesson.status === 'published') {
          qualityMetrics.published++;
        } else {
          qualityMetrics.draft++;
        }

        // Content analysis
        if (lesson.content && lesson.content.trim()) {
          qualityMetrics.withContent++;
          const wordCount = lesson.content.split(/\s+/).length;
          qualityMetrics.wordCounts.push(wordCount);

          if (wordCount === 0) {
            qualityMetrics.contentLengthDistribution.empty++;
          } else if (wordCount < 100) {
            qualityMetrics.contentLengthDistribution.minimal++;
          } else if (wordCount < 500) {
            qualityMetrics.contentLengthDistribution.moderate++;
          } else {
            qualityMetrics.contentLengthDistribution.rich++;
          }
        } else {
          qualityMetrics.withoutContent++;
          qualityMetrics.contentLengthDistribution.empty++;
        }

        // Lesson type analysis
        const type = lesson.lesson_type || 'unknown';
        qualityMetrics.lessonTypes[type] = (qualityMetrics.lessonTypes[type] || 0) + 1;
      });

      audit.contentQuality.comprehensive = qualityMetrics;

      console.log(`   📊 Total lessons analyzed: ${qualityMetrics.total}`);
      console.log(`   ✅ Published: ${qualityMetrics.published}`);
      console.log(`   📝 Draft: ${qualityMetrics.draft}`);
      console.log(`   📄 With content: ${qualityMetrics.withContent}`);
      console.log(`   📭 Without content: ${qualityMetrics.withoutContent}`);
      console.log(`   📈 Content distribution:`);
      console.log(`      Empty: ${qualityMetrics.contentLengthDistribution.empty}`);
      console.log(`      Minimal: ${qualityMetrics.contentLengthDistribution.minimal}`);
      console.log(`      Moderate: ${qualityMetrics.contentLengthDistribution.moderate}`);
      console.log(`      Rich: ${qualityMetrics.contentLengthDistribution.rich}`);
    }
  } catch (error) {
    console.log(`   ❌ Could not analyze content quality: ${error.message}`);
    audit.issues.push(`Content quality analysis failed: ${error.message}`);
  }
}

async function sampleLessonRecords(audit) {
  try {
    // Get samples from different categories
    const samples = {
      richContent: [],
      minimalContent: [],
      emptyContent: []
    };

    // Rich content lessons
    const { data: richLessons } = await supabase
      .from('lessons')
      .select('id, title, content, module_id')
      .not('content', 'is', null)
      .limit(3);

    if (richLessons) {
      for (const lesson of richLessons) {
        if (lesson.content && lesson.content.length > 200) {
          samples.richContent.push({
            id: lesson.id,
            title: lesson.title,
            contentLength: lesson.content.length,
            contentPreview: lesson.content.substring(0, 200) + '...',
            module_id: lesson.module_id
          });
        }
      }
    }

    // Minimal content lessons
    const { data: minimalLessons } = await supabase
      .from('lessons')
      .select('id, title, content, module_id')
      .not('content', 'is', null)
      .limit(5);

    if (minimalLessons) {
      for (const lesson of minimalLessons) {
        if (lesson.content && lesson.content.length > 0 && lesson.content.length <= 200) {
          samples.minimalContent.push({
            id: lesson.id,
            title: lesson.title,
            contentLength: lesson.content.length,
            fullContent: lesson.content,
            module_id: lesson.module_id
          });
        }
      }
    }

    // Empty content lessons
    const { data: emptyLessons } = await supabase
      .from('lessons')
      .select('id, title, content, module_id')
      .or('content.is.null,content.eq.')
      .limit(3);

    if (emptyLessons) {
      samples.emptyContent = emptyLessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content || null,
        module_id: lesson.module_id
      }));
    }

    audit.samples = samples;

    console.log(`   📖 Rich content samples: ${samples.richContent.length}`);
    console.log(`   📋 Minimal content samples: ${samples.minimalContent.length}`);
    console.log(`   📭 Empty content samples: ${samples.emptyContent.length}`);

    // Print some samples
    if (samples.richContent.length > 0) {
      console.log('\n   🌟 RICH CONTENT SAMPLE:');
      const sample = samples.richContent[0];
      console.log(`      ID: ${sample.id}`);
      console.log(`      Title: "${sample.title}"`);
      console.log(`      Length: ${sample.contentLength} characters`);
      console.log(`      Preview: ${sample.contentPreview}`);
    }

    if (samples.emptyContent.length > 0) {
      console.log('\n   📭 EMPTY CONTENT SAMPLE:');
      const sample = samples.emptyContent[0];
      console.log(`      ID: ${sample.id}`);
      console.log(`      Title: "${sample.title}"`);
      console.log(`      Content: ${sample.content || 'NULL'}`);
    }

  } catch (error) {
    console.log(`   ❌ Could not sample lesson records: ${error.message}`);
    audit.issues.push(`Lesson sampling failed: ${error.message}`);
  }
}

function identifyContentIssues(audit) {
  const issues = [];

  // Check table counts
  Object.entries(audit.tables).forEach(([tableName, tableInfo]) => {
    if (!tableInfo.exists) {
      issues.push(`❌ Table '${tableName}' is missing or inaccessible`);
    } else if (tableInfo.count === 0) {
      issues.push(`⚠️  Table '${tableName}' exists but is empty`);
    }
  });

  // Check relationships
  if (audit.relationships.modulesToCourses?.orphaned > 0) {
    issues.push(`⚠️  ${audit.relationships.modulesToCourses.orphaned} modules are not linked to courses`);
  }

  if (audit.relationships.lessonsToModules?.orphaned > 0) {
    issues.push(`⚠️  ${audit.relationships.lessonsToModules.orphaned} lessons are not linked to modules`);
  }

  // Check content quality
  if (audit.contentQuality.comprehensive) {
    const quality = audit.contentQuality.comprehensive;
    const emptyPercentage = (quality.contentLengthDistribution.empty / quality.total) * 100;
    
    if (emptyPercentage > 50) {
      issues.push(`❌ ${emptyPercentage.toFixed(1)}% of lessons have no content`);
    } else if (emptyPercentage > 25) {
      issues.push(`⚠️  ${emptyPercentage.toFixed(1)}% of lessons have no content`);
    }

    const minimalPercentage = (quality.contentLengthDistribution.minimal / quality.total) * 100;
    if (minimalPercentage > 50) {
      issues.push(`⚠️  ${minimalPercentage.toFixed(1)}% of lessons have minimal content`);
    }
  }

  audit.identifiedIssues = issues;
  
  if (issues.length === 0) {
    console.log('   ✅ No major content issues identified');
  } else {
    issues.forEach(issue => console.log(`   ${issue}`));
  }
}

function printAuditSummary(audit) {
  console.log('\n📋 TABLE SUMMARY:');
  Object.entries(audit.tables).forEach(([name, info]) => {
    if (info.exists) {
      console.log(`   ${name}: ${info.count} records`);
    } else {
      console.log(`   ${name}: ❌ Not accessible`);
    }
  });

  if (audit.contentQuality.comprehensive) {
    const q = audit.contentQuality.comprehensive;
    console.log('\n📊 CONTENT QUALITY:');
    console.log(`   Total lessons: ${q.total}`);
    console.log(`   Published: ${q.published} (${((q.published/q.total)*100).toFixed(1)}%)`);
    console.log(`   With content: ${q.withContent} (${((q.withContent/q.total)*100).toFixed(1)}%)`);
    console.log(`   Rich content: ${q.contentLengthDistribution.rich} (${((q.contentLengthDistribution.rich/q.total)*100).toFixed(1)}%)`);
  }

  console.log('\n🔗 RELATIONSHIPS:');
  Object.entries(audit.relationships).forEach(([name, info]) => {
    if (typeof info === 'object' && info.valid !== undefined) {
      console.log(`   ${name}: ${info.valid} valid, ${info.orphaned} orphaned`);
    } else if (typeof info === 'object' && info.linked !== undefined) {
      console.log(`   ${name}: ${info.linked}/${info.total} linked`);
    }
  });

  if (audit.identifiedIssues.length > 0) {
    console.log('\n⚠️  ISSUES TO ADDRESS:');
    audit.identifiedIssues.forEach(issue => console.log(`   ${issue}`));
  }

  console.log(`\n💾 Full audit data saved to audit object`);
  console.log('=====================================');
}

// Run the audit
if (require.main === module) {
  auditDatabaseContent()
    .then(audit => {
      console.log('\n✅ Audit completed successfully');
      // Save audit to file for reference
      const fs = require('fs');
      fs.writeFileSync('database-audit-report.json', JSON.stringify(audit, null, 2));
      console.log('📄 Detailed report saved to: database-audit-report.json');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { auditDatabaseContent };