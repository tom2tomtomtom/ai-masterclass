-- Fix the remaining schema issues

-- For quizzes table - rename question_text to question if that's what the schema expects
ALTER TABLE quizzes DROP COLUMN IF EXISTS question CASCADE;
ALTER TABLE quizzes RENAME COLUMN question_text TO question;

-- For tasks table - check if validation_criteria should be an array
-- Let's see the current schema first by describing the table
\d quizzes;
\d tasks;