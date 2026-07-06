import User from '../models/User.js';
import storageService from '../services/storage.service.js';
import matchingService from '../services/matching.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Calculates profile completion percentage based on 9 core parameters.
 */
const calculateCompletion = (user) => {
  const fields = [
    user.name,
    user.university,
    user.branch,
    user.year,
    user.bio,
    user.profileImage,
    user.github,
    user.linkedin,
    user.portfolio
  ];
  
  const filledFieldsCount = fields.filter((field) => field && field.toString().trim().length > 0).length;
  return Math.round((filledFieldsCount / 9) * 100);
};

/**
 * Fetch the authenticated user's latest profile and completion score.
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return ApiResponse.error(res, 'User profile not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  const completionPercentage = calculateCompletion(user);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skillsToTeach: user.skillsToTeach,
    skillsToLearn: user.skillsToLearn,
    ratingAverage: user.ratingAverage,
    totalSessions: user.totalSessions,
    totalTeachingHours: user.totalTeachingHours,
    university: user.university,
    branch: user.branch,
    year: user.year,
    bio: user.bio,
    github: user.github,
    linkedin: user.linkedin,
    portfolio: user.portfolio,
    profileImage: user.profileImage,
    profileCompletionPercentage: completionPercentage,
    updatedAt: user.updatedAt,
  };

  return ApiResponse.success(res, 'Profile fetched successfully.', { user: userData }, HTTP_STATUS.OK);
});

/**
 * Update authenticated user's profile details.
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, university, branch, year, bio, github, linkedin, portfolio } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.error(res, 'User profile not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  // 1. Process profile image upload if provided
  if (req.file) {
    try {
      // Save new file using StorageService abstraction
      const imageUrl = await storageService.saveFile(req.file.buffer, req.file.originalname);
      
      // Delete old file if existed
      if (user.profileImage) {
        await storageService.deleteFile(user.profileImage);
      }
      
      user.profileImage = imageUrl;
    } catch (uploadError) {
      return ApiResponse.error(
        res, 
        uploadError.message || 'Failed to upload profile photo.', 
        [], 
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // 2. Update text fields
  if (name !== undefined) user.name = name;
  if (university !== undefined) user.university = university;
  if (branch !== undefined) user.branch = branch;
  if (year !== undefined) user.year = year;
  if (bio !== undefined) user.bio = bio;
  if (github !== undefined) user.github = github;
  if (linkedin !== undefined) user.linkedin = linkedin;
  if (portfolio !== undefined) user.portfolio = portfolio;

  await user.save();

  // 3. Re-calculate completion percentage
  const completionPercentage = calculateCompletion(user);

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skillsToTeach: user.skillsToTeach,
    skillsToLearn: user.skillsToLearn,
    ratingAverage: user.ratingAverage,
    totalSessions: user.totalSessions,
    totalTeachingHours: user.totalTeachingHours,
    university: user.university,
    branch: user.branch,
    year: user.year,
    bio: user.bio,
    github: user.github,
    linkedin: user.linkedin,
    portfolio: user.portfolio,
    profileImage: user.profileImage,
    profileCompletionPercentage: completionPercentage,
    updatedAt: user.updatedAt,
  };

  return ApiResponse.success(res, 'Profile updated successfully.', { user: userData }, HTTP_STATUS.OK);
});

/**
 * Add a skill to the authenticated user's skillsToTeach array.
 * PUT /api/users/skills/teach
 */
export const addSkillToTeach = asyncHandler(async (req, res) => {
  const { skill } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.error(res, 'User not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  const trimmedSkill = skill.trim();

  // Case-insensitive duplicate check
  const isDuplicate = user.skillsToTeach.some(
    (existingSkill) => existingSkill.toLowerCase() === trimmedSkill.toLowerCase()
  );

  if (isDuplicate) {
    return ApiResponse.error(
      res,
      `The skill "${trimmedSkill}" already exists in your teaching directory.`,
      [],
      HTTP_STATUS.CONFLICT
    );
  }

  user.skillsToTeach.push(trimmedSkill);
  await user.save();

  const completionPercentage = calculateCompletion(user);

  const updatedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skillsToTeach: user.skillsToTeach,
    skillsToLearn: user.skillsToLearn,
    ratingAverage: user.ratingAverage,
    totalSessions: user.totalSessions,
    totalTeachingHours: user.totalTeachingHours,
    university: user.university,
    branch: user.branch,
    year: user.year,
    bio: user.bio,
    github: user.github,
    linkedin: user.linkedin,
    portfolio: user.portfolio,
    profileImage: user.profileImage,
    profileCompletionPercentage: completionPercentage,
    updatedAt: user.updatedAt,
  };

  return ApiResponse.success(
    res,
    'Skill added successfully to your teaching directory.',
    { user: updatedUser },
    HTTP_STATUS.OK
  );
});

/**
 * Fetch list of matched peers with matchScore > 0 sorted by score and profiles.
 * GET /api/users/matches
 */
export const getMatches = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const myUser = await User.findById(currentUserId);
  if (!myUser) {
    return ApiResponse.error(res, 'User not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  // Fetch all other users
  const allUsers = await User.find({ _id: { $ne: currentUserId } });

  const matches = allUsers
    .map(otherUser => {
      const matchResult = matchingService.calculateMatchScore(myUser, otherUser);
      const completionPercentage = calculateCompletion(otherUser);

      return {
        id: otherUser._id,
        name: otherUser.name,
        profileImage: otherUser.profileImage,
        university: otherUser.university,
        branch: otherUser.branch,
        skillsToTeach: otherUser.skillsToTeach,
        skillsToLearn: otherUser.skillsToLearn,
        ratingAverage: otherUser.ratingAverage,
        totalSessions: otherUser.totalSessions,
        profileCompletionPercentage: completionPercentage,
        updatedAt: otherUser.updatedAt,
        matchScore: matchResult.matchScore,
        commonTeachSkills: matchResult.commonTeachSkills,
        commonLearnSkills: matchResult.commonLearnSkills,
      };
    })
    .filter(match => match.matchScore > 0)
    .sort((a, b) => {
      // 1. Descending Match Score
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // 2. Descending profile completion percentage
      if (b.profileCompletionPercentage !== a.profileCompletionPercentage) {
        return b.profileCompletionPercentage - a.profileCompletionPercentage;
      }
      // 3. Descending ratingAverage
      if (b.ratingAverage !== a.ratingAverage) {
        return b.ratingAverage - a.ratingAverage;
      }
      // 4. Descending totalSessions
      return b.totalSessions - a.totalSessions;
    });

  return ApiResponse.success(res, 'Matches fetched successfully.', { matches }, HTTP_STATUS.OK);
});
