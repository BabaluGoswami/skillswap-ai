import { z } from 'zod';

// Validator for adding skills to teach
export const addSkillSchema = z.object({
  body: z.object({
    skill: z.string({
      required_error: 'Skill name is required.',
    })
    .trim()
    .min(1, 'Skill name cannot be empty.')
    .max(50, 'Skill name cannot exceed 50 characters.'),
  }),
});

// URL Zod validator supporting empty strings or valid URLs
const optionalUrlSchema = z.string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .pipe(z.string().url('Must be a valid HTTP or HTTPS URL').optional())
  .or(z.literal(''));

// Profile update validation schema
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').optional(),
    university: z.string().trim().min(2, 'University name must be at least 2 characters.').optional().or(z.literal('')),
    branch: z.string().trim().min(2, 'Branch name must be at least 2 characters.').optional().or(z.literal('')),
    year: z.string().trim().min(1, 'Current year selection is required.').optional().or(z.literal('')),
    bio: z.string().trim().max(250, 'Bio cannot exceed 250 characters.').optional().or(z.literal('')),
    github: optionalUrlSchema.optional(),
    linkedin: optionalUrlSchema.optional(),
    portfolio: optionalUrlSchema.optional(),
    skillsToTeach: z.array(z.string()).optional(),
    skillsToLearn: z.array(z.string()).optional(),
    availability: z.string().trim().optional().or(z.literal('')),
  }),
});
