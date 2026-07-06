/**
 * Normalizes a list of skills by trimming, lowercasing, removing duplicates,
 * and filtering out empty strings.
 * 
 * @param {Array<String>} arr - Array of skills.
 * @returns {Array<String>} - Normalized skills array.
 */
const normalizeSkillsList = (arr) => {
  if (!arr || !Array.isArray(arr)) return [];
  const cleaned = arr
    .map(skill => (skill || '').toString().trim())
    .filter(skill => skill.length > 0);
  
  // Deduplicate case-insensitively
  const seen = new Set();
  const result = [];
  for (const skill of cleaned) {
    const lower = skill.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(skill); // Keep the original casing
    }
  }
  return result;
};

/**
 * AI Skill Matching Service.
 * Calculates matching scores and overlaps between students.
 */
class MatchingService {
  /**
   * Calculates matching score and overlaps between two user objects.
   * 
   * @param {Object} myUser - Currently logged-in user.
   * @param {Object} otherUser - Peer user to match against.
   * @returns {Object} - Match details: { matchScore, commonTeachSkills, commonLearnSkills, totalCommonSkills }
   */
  calculateMatchScore(myUser, otherUser) {
    const myTeach = normalizeSkillsList(myUser.skillsToTeach);
    const myLearn = normalizeSkillsList(myUser.skillsToLearn);
    const otherTeach = normalizeSkillsList(otherUser.skillsToTeach);
    const otherLearn = normalizeSkillsList(otherUser.skillsToLearn);

    const denominator = myTeach.length + myLearn.length;
    if (denominator === 0) {
      return {
        matchScore: 0,
        commonTeachSkills: [],
        commonLearnSkills: [],
        totalCommonSkills: 0,
      };
    }

    // 1. My Teach skills that match Their Learn skills
    const commonTeachSkills = myTeach.filter(mySkill =>
      otherLearn.some(otherSkill => otherSkill.toLowerCase() === mySkill.toLowerCase())
    );

    // 2. My Learn skills that match Their Teach skills
    const commonLearnSkills = myLearn.filter(mySkill =>
      otherTeach.some(otherSkill => otherSkill.toLowerCase() === mySkill.toLowerCase())
    );

    const totalCommonSkills = commonTeachSkills.length + commonLearnSkills.length;
    const matchScore = Math.round((totalCommonSkills / denominator) * 100);

    return {
      matchScore,
      commonTeachSkills,
      commonLearnSkills,
      totalCommonSkills,
    };
  }
}

export default new MatchingService();
