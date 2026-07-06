import User from '../models/User.js';
import SwapRequest from '../models/SwapRequest.js';
import Session from '../models/Session.js';

class StatisticsService {
  /**
   * Calculates platform-wide statistics.
   * Eliminates skill double-counting by normalizing and taking unique set unions.
   */
  async getPlatformStatistics() {
    // 1. Total users
    const totalUsers = await User.countDocuments();

    // 2. Total swap requests
    const totalSwapRequests = await SwapRequest.countDocuments();

    // 3. Completed learning sessions
    let completedSessions = 0;
    try {
      completedSessions = await Session.countDocuments({ status: 'Completed' });
    } catch (error) {
      console.warn('Session model status count fallback:', error.message);
    }

    // 4. Count unique normalized skills (Case-insensitive, trimmed, ignoring empty values)
    const users = await User.find({}, 'skillsToTeach skillsToLearn');
    const uniqueSkills = new Set();

    users.forEach(user => {
      if (Array.isArray(user.skillsToTeach)) {
        user.skillsToTeach.forEach(skill => {
          if (typeof skill === 'string') {
            const cleaned = skill.trim().toLowerCase();
            if (cleaned) uniqueSkills.add(cleaned);
          }
        });
      }

      if (Array.isArray(user.skillsToLearn)) {
        user.skillsToLearn.forEach(skill => {
          if (typeof skill === 'string') {
            const cleaned = skill.trim().toLowerCase();
            if (cleaned) uniqueSkills.add(cleaned);
          }
        });
      }
    });

    return {
      totalUsers,
      totalSkills: uniqueSkills.size,
      totalSwapRequests,
      completedSessions
    };
  }
}

export default new StatisticsService();
