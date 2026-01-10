-- Add ranking_visible column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ranking_visible BOOLEAN DEFAULT false;

-- Create view for ranking scores
-- Logic: Count questions where the *first attempt* was correct.
CREATE OR REPLACE VIEW ranking_scores AS
SELECT 
    up.user_id,
    up.display_name,
    up.avatar_url,
    COUNT(DISTINCT first_attempts.question_id) as score
FROM user_profiles up
JOIN (
    SELECT DISTINCT ON (es.user_id, ea.question_id)
        es.user_id,
        ea.question_id,
        ea.is_correct
    FROM exam_answers ea
    JOIN exam_sessions es ON ea.session_id = es.id
    ORDER BY es.user_id, ea.question_id, ea.answered_at ASC
) first_attempts ON up.user_id = first_attempts.user_id
WHERE 
    up.ranking_visible = true 
    AND first_attempts.is_correct = true
GROUP BY up.user_id, up.display_name, up.avatar_url
ORDER BY score DESC;

-- Grant access to authenticated users
GRANT SELECT ON ranking_scores TO authenticated;
