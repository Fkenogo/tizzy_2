import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { normalizeCatalogExercise, CatalogExercise } from '../types';
import * as fs from 'fs';
import * as path from 'path';

interface ExerciseAuditReport {
  timestamp: string;
  totalExercises: number;
  completeExercises: number;
  incompleteExercises: number;
  missingCriticalFields: number;
  missingOptionalFields: number;
  dataQualityScore: number;
  criticalIssues: Array<{
    id: string;
    name: string;
    missingFields: string[];
  }>;
  optionalFieldGaps: Array<{
    id: string;
    name: string;
    missingOptionalFields: string[];
  }>;
  suggestions: string[];
  summary: {
    tier_1_distribution: Record<string, number>;
    tier_2_distribution: Record<string, number>;
    difficulty_distribution: Record<string, number>;
    metric_type_distribution: Record<string, number>;
  };
}

/**
 * Verifies all exercise documents in the catalogExercises collection
 * against the CatalogExercise interface and generates a comprehensive report
 */
async function verifyExerciseDatabase(): Promise<void> {
  console.log('🔍 Starting Exercise Database Verification...');
  
  try {
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportsDir, `exercise-database-audit-${timestamp}.json`);

    // Query all exercises
    console.log('📊 Fetching all exercise documents...');
    const exercisesRef = collection(db, 'catalogExercises');
    const q = query(exercisesRef, orderBy('name'));
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} exercise documents`);

    if (snapshot.size === 0) {
      console.log('⚠️  No exercises found in database. Please run migration or seeding first.');
      return;
    }

    // Initialize report structure
    const report: ExerciseAuditReport = {
      timestamp,
      totalExercises: snapshot.size,
      completeExercises: 0,
      incompleteExercises: 0,
      missingCriticalFields: 0,
      missingOptionalFields: 0,
      dataQualityScore: 0,
      criticalIssues: [],
      optionalFieldGaps: [],
      suggestions: [],
      summary: {
        tier_1_distribution: {},
        tier_2_distribution: {},
        difficulty_distribution: {},
        metric_type_distribution: {}
      }
    };

    const criticalFields = ['id', 'name', 'tier_1', 'tier_2', 'metric'];
    const optionalFields = [
      'difficulty', 'musclesTargeted', 'equipment', 'trainingGoals', 'description',
      'setup', 'execution', 'breathing', 'formCues', 'commonMistakes', 
      'progressions', 'advancedVariations', 'safetyNotes', 'recommendedVolume'
    ];

    // Process each exercise document
    for (const doc of snapshot.docs) {
      const rawData = { id: doc.id, ...doc.data() };
      const normalizedExercise = normalizeCatalogExercise(rawData);
      
      // Check for critical field issues
      const missingCritical = criticalFields.filter(field => {
        if (field === 'metric') {
          return !rawData.metric || !rawData.metric.type || !rawData.metric.unit;
        }
        return !rawData[field];
      });

      // Check for optional field gaps
      const missingOptional = optionalFields.filter(field => {
        if (field === 'breathing') {
          return !rawData.breathing || !rawData.breathing.inhale || !rawData.breathing.exhale;
        }
        if (field === 'recommendedVolume') {
          return !rawData.recommendedVolume || !rawData.recommendedVolume.beginner;
        }
        return !rawData[field];
      });

      // Update distributions
      report.summary.tier_1_distribution[normalizedExercise.tier_1] = 
        (report.summary.tier_1_distribution[normalizedExercise.tier_1] || 0) + 1;
      
      report.summary.tier_2_distribution[normalizedExercise.tier_2] = 
        (report.summary.tier_2_distribution[normalizedExercise.tier_2] || 0) + 1;
      
      report.summary.difficulty_distribution[normalizedExercise.difficulty] = 
        (report.summary.difficulty_distribution[normalizedExercise.difficulty] || 0) + 1;
      
      report.summary.metric_type_distribution[normalizedExercise.metric.type] = 
        (report.summary.metric_type_distribution[normalizedExercise.metric.type] || 0) + 1;

      if (missingCritical.length > 0) {
        report.criticalIssues.push({
          id: doc.id,
          name: rawData.name || 'Unknown Exercise',
          missingFields: missingCritical
        });
        report.incompleteExercises++;
        report.missingCriticalFields += missingCritical.length;
      } else {
        report.completeExercises++;
      }

      if (missingOptional.length > 0) {
        report.optionalFieldGaps.push({
          id: doc.id,
          name: rawData.name || 'Unknown Exercise',
          missingOptionalFields: missingOptional
        });
        report.missingOptionalFields += missingOptional.length;
      }
    }

    // Calculate data quality score
    const totalFields = snapshot.size * (criticalFields.length + optionalFields.length);
    const totalMissing = report.missingCriticalFields + report.missingOptionalFields;
    report.dataQualityScore = Math.max(0, Math.round(((totalFields - totalMissing) / totalFields) * 100));

    // Generate suggestions
    if (report.missingCriticalFields > 0) {
      report.suggestions.push('Fix critical field issues to ensure exercises display properly in the library');
    }
    
    if (report.missingOptionalFields > 0) {
      report.suggestions.push('Complete optional fields to provide better user experience and exercise guidance');
    }
    
    if (report.dataQualityScore < 50) {
      report.suggestions.push('Data quality is very low. Consider reviewing migration process or data sources');
    } else if (report.dataQualityScore < 80) {
      report.suggestions.push('Data quality is moderate. Focus on completing missing optional fields');
    }

    // Generate console report
    console.log('\n📊 EXERCISE DATABASE AUDIT REPORT');
    console.log('=====================================');
    console.log(`Total Exercises: ${report.totalExercises}`);
    console.log(`Complete Exercises: ${report.completeExercises} (${Math.round((report.completeExercises / report.totalExercises) * 100)}%)`);
    console.log(`Incomplete Exercises: ${report.incompleteExercises} (${Math.round((report.incompleteExercises / report.totalExercises) * 100)}%)`);
    console.log(`Missing Critical Fields: ${report.missingCriticalFields}`);
    console.log(`Missing Optional Fields: ${report.missingOptionalFields}`);
    console.log(`Data Quality Score: ${report.dataQualityScore}%`);
    
    console.log('\n📈 FIELD DISTRIBUTIONS:');
    console.log('Tier 1 Categories:', report.summary.tier_1_distribution);
    console.log('Tier 2 Categories:', report.summary.tier_2_distribution);
    console.log('Difficulty Levels:', report.summary.difficulty_distribution);
    console.log('Metric Types:', report.summary.metric_type_distribution);

    if (report.criticalIssues.length > 0) {
      console.log('\n⚠️  CRITICAL ISSUES (Need Immediate Attention):');
      report.criticalIssues.slice(0, 10).forEach(issue => {
        console.log(`  - ${issue.name} (${issue.id}): Missing ${issue.missingFields.join(', ')}`);
      });
      if (report.criticalIssues.length > 10) {
        console.log(`  ... and ${report.criticalIssues.length - 10} more`);
      }
    }

    if (report.optionalFieldGaps.length > 0) {
      console.log('\n📝 OPTIONAL FIELD GAPS (Improve User Experience):');
      report.optionalFieldGaps.slice(0, 5).forEach(gap => {
        console.log(`  - ${gap.name}: Missing ${gap.missingOptionalFields.join(', ')}`);
      });
      if (report.optionalFieldGaps.length > 5) {
        console.log(`  ... and ${report.optionalFieldGaps.length - 5} more`);
      }
    }

    if (report.suggestions.length > 0) {
      console.log('\n💡 SUGGESTIONS:');
      report.suggestions.forEach(suggestion => {
        console.log(`  - ${suggestion}`);
      });
    }

    // Save detailed report to file
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    
    console.log('\n🎉 Exercise database verification completed!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  }
}

/**
 * Optional: Fix common issues in exercise documents
 */
async function fixCommonIssues(): Promise<void> {
  console.log('🔧 Attempting to fix common issues...');
  
  try {
    const exercisesRef = collection(db, 'catalogExercises');
    const snapshot = await getDocs(exercisesRef);
    
    let fixedCount = 0;
    
    for (const doc of snapshot.docs) {
      const rawData = { id: doc.id, ...doc.data() };
      const normalized = normalizeCatalogExercise(rawData);
      
      // Check if we need to update the document
      const needsUpdate = !rawData.metric || 
                         !rawData.description || 
                         !rawData.setup || 
                         !rawData.execution ||
                         !rawData.breathing;
      
      if (needsUpdate) {
        // Update document with normalized data (only if it's significantly different)
        await doc.ref.update({
          metric: normalized.metric,
          description: normalized.description,
          setup: normalized.setup,
          execution: normalized.execution,
          breathing: normalized.breathing,
          createdAt: normalized.createdAt
        });
        fixedCount++;
        console.log(`Fixed: ${normalized.name}`);
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} documents with common issues`);
    
  } catch (error) {
    console.error('❌ Error fixing issues:', error);
  }
}

// Run the verification
if (require.main === module) {
  verifyExerciseDatabase()
    .then(() => {
      console.log('\nWould you like to attempt fixing common issues? (y/N)');
      // Note: In a real implementation, you'd use readline or similar for user input
      // For now, we'll skip the interactive part
    })
    .catch(console.error);
}

export { verifyExerciseDatabase, fixCommonIssues };