"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateEnhancedExerciseDatabase = migrateEnhancedExerciseDatabase;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../src/config/firebase");
const exercise_database_json_1 = __importDefault(require("./exercise_database.json"));
/**
 * Enhanced exercise content generator based on exercise type and characteristics
 */
class ExerciseContentGenerator {
    /**
     * Generate detailed content for an exercise based on its name and characteristics
     */
    static generateExerciseContent(exercise) {
        const nameLower = exercise.name.toLowerCase();
        const tier1Lower = exercise.tier_1.toLowerCase();
        const tier2Lower = exercise.tier_2.toLowerCase();
        // Determine exercise type based on name and categories
        let exerciseType = 'general';
        if (nameLower.includes('plank') || nameLower.includes('forearm')) {
            exerciseType = 'plank';
        }
        else if (nameLower.includes('push') || nameLower.includes('press')) {
            exerciseType = 'pushup';
        }
        else if (nameLower.includes('squat') || nameLower.includes('lunge')) {
            exerciseType = 'squat';
        }
        else if (nameLower.includes('jump') || nameLower.includes('run') || nameLower.includes('cardio')) {
            exerciseType = 'jumping_jack';
        }
        else if (nameLower.includes('run') || nameLower.includes('jog')) {
            exerciseType = 'running';
        }
        const template = this.EXERCISE_TEMPLATES[exerciseType] || this.EXERCISE_TEMPLATES['general'];
        // Generate specific description based on exercise
        const description = this.generateDescription(exercise, exerciseType);
        return {
            description,
            setup: template.setup,
            execution: template.execution,
            breathing: template.breathing,
            formCues: template.formCues,
            commonMistakes: template.commonMistakes,
            progressions: template.progressions,
            advancedVariations: template.advancedVariations,
            safetyNotes: template.safetyNotes,
            recommendedVolume: template.recommendedVolume
        };
    }
    static generateDescription(exercise, type) {
        const name = exercise.name;
        const tier1 = exercise.tier_1;
        const tier2 = exercise.tier_2;
        const muscles = exercise.tags.muscles_targeted.join(', ');
        const difficulty = exercise.tags.difficulty_level;
        const descriptions = {
            'plank': `${name} is a core stability exercise that builds isometric strength in your entire anterior chain. This ${tier2} movement targets ${muscles} and is essential for developing core endurance and proper posture. Perfect for ${difficulty.toLowerCase()} level fitness enthusiasts looking to build foundational core strength.`,
            'pushup': `${name} is a compound upper body exercise that builds strength in your chest, shoulders, and triceps. This ${tier2} movement targets ${muscles} and develops functional pushing strength. Excellent for ${difficulty.toLowerCase()} level individuals wanting to build upper body power and stability.`,
            'squat': `${name} is a fundamental lower body exercise that builds strength and mobility in your legs and glutes. This ${tier2} movement targets ${muscles} and improves functional movement patterns. Essential for ${difficulty.toLowerCase()} level fitness enthusiasts developing lower body strength.`,
            'jumping_jack': `${name} is a dynamic cardiovascular exercise that elevates heart rate while engaging multiple muscle groups. This ${tier2} movement targets ${muscles} and improves coordination and endurance. Great for ${difficulty.toLowerCase()} level individuals looking to build cardiovascular fitness.`,
            'running': `${name} is a fundamental cardiovascular exercise that builds endurance and improves overall fitness. This ${tier2} movement targets ${muscles} and enhances cardiovascular health. Essential for ${difficulty.toLowerCase()} level fitness enthusiasts developing aerobic capacity.`,
            'general': `${name} is a ${tier2} exercise that targets ${muscles} and builds functional strength. This ${difficulty.toLowerCase()} level movement is excellent for developing ${tier2.toLowerCase()} capabilities and overall fitness.`
        };
        return descriptions[type] || descriptions['general'];
    }
}
ExerciseContentGenerator.EXERCISE_TEMPLATES = {
    // Core & Planks
    'plank': {
        setup: [
            "Start in a prone position with forearms on the ground, elbows directly under shoulders",
            "Extend legs back with toes tucked, creating a straight line from head to heels",
            "Engage your core by drawing belly button toward spine, squeeze glutes and quads"
        ],
        execution: [
            "Maintain a rigid, straight body position throughout the hold",
            "Keep neck neutral by looking at the floor about 6 inches in front of your hands",
            "Breathe steadily while maintaining core tension",
            "Focus on preventing hips from sagging or hiking up"
        ],
        breathing: {
            inhale: "Inhale through nose during the hold, keeping chest expanded",
            exhale: "Exhale through mouth, engaging core deeper on each exhale",
            pattern: "Steady, controlled breathing while maintaining tension"
        },
        formCues: [
            "Elbows directly under shoulders",
            "Body forms a straight line from head to heels",
            "Engage glutes and quads to prevent hip sagging",
            "Pull shoulder blades back and down",
            "Keep neck neutral, eyes on floor"
        ],
        commonMistakes: [
            "Hips sagging toward the floor",
            "Hips hiking too high",
            "Holding breath instead of breathing steadily",
            "Elbows flaring out to the sides",
            "Looking up instead of keeping neck neutral"
        ],
        progressions: [
            "Knee planks - drop knees to floor while maintaining straight back",
            "Shorter duration holds with perfect form",
            "Wall planks - hands on wall, feet on floor"
        ],
        advancedVariations: [
            "Side planks with hip dips",
            "Plank with shoulder taps",
            "Plank with leg lifts",
            "Weighted planks with plate on back"
        ],
        safetyNotes: [
            "Stop immediately if you feel lower back pain",
            "Ensure proper wrist alignment if doing straight-arm planks",
            "Start with shorter holds and build up gradually",
            "Keep movements controlled, avoid jerking"
        ],
        recommendedVolume: {
            beginner: "3 sets of 15-30 seconds",
            intermediate: "3 sets of 30-60 seconds",
            advanced: "4 sets of 60-120 seconds"
        }
    },
    // Push-up variations
    'pushup': {
        setup: [
            "Start in high plank position with hands slightly wider than shoulder-width",
            "Fingers spread and pointing forward, wrists aligned under elbows",
            "Body in straight line from head to heels, core engaged"
        ],
        execution: [
            "Lower body by bending elbows to 90 degrees, keeping them at 45-degree angle",
            "Maintain straight body line, don't let hips sag or hike",
            "Push through palms to return to starting position",
            "Squeeze chest at the top of the movement"
        ],
        breathing: {
            inhale: "Inhale as you lower your body toward the floor",
            exhale: "Exhale as you push back up to starting position",
            pattern: "One breath per repetition, controlled tempo"
        },
        formCues: [
            "Hands slightly wider than shoulders",
            "Elbows at 45-degree angle to body",
            "Body stays in straight line throughout",
            "Lower chest to fist height or slightly below",
            "Push through entire palm, not just fingers"
        ],
        commonMistakes: [
            "Flaring elbows out to the sides",
            "Hips sagging or hiking up",
            "Partial range of motion",
            "Neck craning forward",
            "Rushing through the movement"
        ],
        progressions: [
            "Wall push-ups against wall",
            "Incline push-ups on bench or wall",
            "Knee push-ups with proper form",
            "Negative push-ups (slow lowering only)"
        ],
        advancedVariations: [
            "Diamond push-ups (hands close together)",
            "Decline push-ups (feet elevated)",
            "Plyometric push-ups",
            "One-arm push-ups"
        ],
        safetyNotes: [
            "Keep shoulders down and back, don't let them creep up to ears",
            "Maintain neutral spine throughout",
            "Stop if you feel shoulder pain",
            "Land softly in plyometric variations"
        ],
        recommendedVolume: {
            beginner: "3 sets of 5-10 reps",
            intermediate: "3 sets of 10-20 reps",
            advanced: "4 sets of 20-50 reps"
        }
    },
    // Squat variations
    'squat': {
        setup: [
            "Stand with feet slightly wider than hip-width, toes slightly turned out",
            "Engage core, chest up, shoulders back and down",
            "Weight distributed evenly across entire foot"
        ],
        execution: [
            "Push hips back as if sitting in a chair, keeping chest upright",
            "Bend knees and lower until thighs are parallel to floor or deeper",
            "Drive through heels and midfoot to stand back up",
            "Squeeze glutes at the top of the movement"
        ],
        breathing: {
            inhale: "Inhale as you descend into the squat",
            exhale: "Exhale as you drive up through the heels",
            pattern: "Brace core on descent, explosive exhale on ascent"
        },
        formCues: [
            "Chest up, shoulders back and down",
            "Knees tracking over toes, don't let them cave in",
            "Weight on heels and midfoot, not toes",
            "Sit back into hips, don't just bend knees",
            "Maintain neutral spine throughout"
        ],
        commonMistakes: [
            "Knees caving inward",
            "Heels lifting off the ground",
            "Rounding the lower back",
            "Leaning too far forward",
            "Not going deep enough"
        ],
        progressions: [
            "Chair squats - tap chair with glutes",
            "Wall squats - back against wall",
            "Box squats - controlled depth",
            "Goblet squats with light weight"
        ],
        advancedVariations: [
            "Jump squats",
            "Pistol squats (single leg)",
            "Overhead squats",
            "Bulgarian split squats"
        ],
        safetyNotes: [
            "Keep knees behind toes when possible",
            "Maintain arch in feet",
            "Don't bounce at the bottom",
            "Start with bodyweight before adding load"
        ],
        recommendedVolume: {
            beginner: "3 sets of 8-12 reps",
            intermediate: "3 sets of 12-20 reps",
            advanced: "4 sets of 20-30 reps"
        }
    },
    // Cardio exercises
    'jumping_jack': {
        setup: [
            "Stand tall with feet together and arms at sides",
            "Engage core and maintain upright posture",
            "Slightly bend knees to prepare for movement"
        ],
        execution: [
            "Jump feet out to the sides while raising arms overhead",
            "Land softly with knees slightly bent",
            "Jump back to starting position, lowering arms",
            "Maintain steady rhythm and breathing"
        ],
        breathing: {
            inhale: "Inhale as you jump feet apart and raise arms",
            exhale: "Exhale as you jump feet together and lower arms",
            pattern: "Rhythmic breathing matching movement tempo"
        },
        formCues: [
            "Land softly on balls of feet",
            "Keep movements controlled, not jerky",
            "Arms fully extend overhead",
            "Maintain upright posture throughout",
            "Engage core for stability"
        ],
        commonMistakes: [
            "Landing with straight legs (no knee bend)",
            "Hunching shoulders",
            "Moving too fast with poor form",
            "Not fully extending arms overhead",
            "Letting core go loose"
        ],
        progressions: [
            "Step jacks - step feet apart instead of jumping",
            "Half jacks - only move arms or legs",
            "Slow-motion jacks for control"
        ],
        advancedVariations: [
            "Burpee jacks",
            "Plank jacks",
            "Squat jacks",
            "Tuck jump jacks"
        ],
        safetyNotes: [
            "Land softly to protect joints",
            "Modify impact level based on fitness level",
            "Keep movements controlled",
            "Stop if you feel joint pain"
        ],
        recommendedVolume: {
            beginner: "3 sets of 30 seconds",
            intermediate: "3 sets of 60 seconds",
            advanced: "4 sets of 90 seconds"
        }
    },
    // Cardio running
    'running': {
        setup: [
            "Stand tall with relaxed shoulders and engaged core",
            "Arms bent at 90 degrees, hands relaxed",
            "Weight slightly forward on midfoot"
        ],
        execution: [
            "Drive knees forward and up with each stride",
            "Land midfoot under center of mass",
            "Push off through the ball of the foot",
            "Maintain relaxed arm swing and upright posture"
        ],
        breathing: {
            inhale: "Inhale through nose and mouth in rhythmic pattern",
            exhale: "Exhale fully, especially during longer runs",
            pattern: "2-2 breathing (2 steps inhale, 2 steps exhale)"
        },
        formCues: [
            "Relaxed shoulders, avoid tension",
            "Arms driving back, not across body",
            "Quick, light foot strikes",
            "Upright posture, slight forward lean",
            "Land midfoot, not on heel"
        ],
        commonMistakes: [
            "Overstriding (landing heel first)",
            "Tensing shoulders and arms",
            "Bouncing up and down too much",
            "Looking down instead of forward",
            "Holding breath or shallow breathing"
        ],
        progressions: [
            "Brisk walking intervals",
            "Run/walk intervals (1 min run, 2 min walk)",
            "Gradually increase run duration"
        ],
        advancedVariations: [
            "Tempo runs",
            "Interval training",
            "Hill sprints",
            "Fartlek training"
        ],
        safetyNotes: [
            "Wear proper running shoes",
            "Start slow and build up gradually",
            "Stay hydrated",
            "Run on appropriate surfaces",
            "Listen to your body for pain signals"
        ],
        recommendedVolume: {
            beginner: "20-30 minutes total (run/walk intervals)",
            intermediate: "30-45 minutes steady pace",
            advanced: "45-90 minutes with varied intensity"
        }
    }
};
/**
 * Normalize metric structure based on exercise type
 */
function normalizeMetric(metricString) {
    const metricStringLower = metricString.toLowerCase();
    if (metricStringLower.includes('reps')) {
        return {
            type: 'reps',
            unit: 'reps',
            allowCustomUnit: false
        };
    }
    else if (metricStringLower.includes('time (seconds)')) {
        return {
            type: 'time',
            unit: 'seconds',
            allowCustomUnit: false
        };
    }
    else if (metricStringLower.includes('time (minutes)')) {
        return {
            type: 'time',
            unit: 'minutes',
            allowCustomUnit: false
        };
    }
    else if (metricStringLower.includes('time or distance')) {
        return {
            type: 'time',
            unit: 'minutes',
            allowCustomUnit: false,
            metricOptions: [
                { type: 'time', unit: 'minutes' },
                { type: 'distance', unit: 'km' }
            ]
        };
    }
    else {
        // Default fallback
        return {
            type: 'reps',
            unit: 'reps',
            allowCustomUnit: false
        };
    }
}
/**
 * Convert difficulty level to enum format
 */
function convertDifficulty(difficulty) {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower.includes('advanced') || difficultyLower.includes('expert'))
        return "Advanced";
    if (difficultyLower.includes('intermediate') || difficultyLower.includes('moderate'))
        return "Intermediate";
    return "Beginner";
}
async function migrateEnhancedExerciseDatabase() {
    console.log('🚀 Starting Enhanced Exercise Database Migration...');
    try {
        if (!exercise_database_json_1.default.exercises || !Array.isArray(exercise_database_json_1.default.exercises)) {
            throw new Error('Invalid exercise database format: missing exercises array');
        }
        console.log(`Found ${exercise_database_json_1.default.exercises.length} exercises to migrate with enhanced details...`);
        // Track statistics
        const stats = {
            total: exercise_database_json_1.default.exercises.length,
            migrated: 0,
            skipped: 0,
            errors: 0,
            duplicates: 0
        };
        // Track processed exercise names to detect duplicates
        const processedNames = new Set();
        // Process each exercise
        for (const exercise of exercise_database_json_1.default.exercises) {
            try {
                // Check for duplicates
                if (processedNames.has(exercise.name)) {
                    console.log(`⚠️  Skipping duplicate: ${exercise.name}`);
                    stats.duplicates++;
                    stats.skipped++;
                    continue;
                }
                processedNames.add(exercise.name);
                // Generate slug-based ID
                const slugId = exercise.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '');
                // Generate enhanced exercise content
                const enhancedContent = ExerciseContentGenerator.generateExerciseContent(exercise);
                // Prepare the document data
                const exerciseDoc = {
                    id: slugId,
                    name: exercise.name,
                    tier_1: exercise.tier_1,
                    tier_2: exercise.tier_2,
                    difficulty: convertDifficulty(exercise.tags.difficulty_level),
                    musclesTargeted: exercise.tags.muscles_targeted,
                    equipment: exercise.tags.equipment,
                    trainingGoals: exercise.tags.training_goals,
                    metric: normalizeMetric(exercise.tags.metric),
                    description: enhancedContent.description,
                    setup: enhancedContent.setup,
                    execution: enhancedContent.execution,
                    breathing: enhancedContent.breathing,
                    formCues: enhancedContent.formCues,
                    commonMistakes: enhancedContent.commonMistakes,
                    progressions: enhancedContent.progressions,
                    advancedVariations: enhancedContent.advancedVariations,
                    safetyNotes: enhancedContent.safetyNotes,
                    recommendedVolume: enhancedContent.recommendedVolume,
                    createdAt: firestore_1.Timestamp.now()
                };
                // Add to Firestore
                await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, 'catalogExercises'), exerciseDoc);
                console.log(`✅ Migrated: ${exercise.name} (${exercise.tier_1} → ${exercise.tier_2}) - ${exercise.tags.difficulty_level}`);
                stats.migrated++;
            }
            catch (exerciseError) {
                console.error(`❌ Failed to migrate exercise ${exercise.name}:`, exerciseError);
                stats.errors++;
            }
        }
        console.log('\n🎉 Enhanced Exercise database migration completed!');
        console.log('📊 Migration Summary:');
        console.log(`   Total exercises: ${stats.total}`);
        console.log(`   Successfully migrated: ${stats.migrated}`);
        console.log(`   Duplicates skipped: ${stats.duplicates}`);
        console.log(`   Errors: ${stats.errors}`);
        console.log(`   Total in Firestore: ${stats.migrated}`);
        if (stats.errors > 0) {
            console.log(`\n⚠️  ${stats.errors} exercises failed to migrate. Check the logs above for details.`);
        }
        console.log('\n✨ All exercises now include:');
        console.log('   - Detailed descriptions based on exercise type');
        console.log('   - Step-by-step setup and execution instructions');
        console.log('   - Specific breathing patterns and form cues');
        console.log('   - Common mistakes and safety notes');
        console.log('   - Progressions and advanced variations');
        console.log('   - Recommended volume for each difficulty level');
    }
    catch (error) {
        console.error('❌ Enhanced migration failed:', error);
        throw error;
    }
}
// Run the enhanced migration
if (require.main === module) {
    migrateEnhancedExerciseDatabase();
}
