import { z } from 'zod';

export const createFeedbackSchema = z.object({
  body: z.object({
    rating: z.coerce.number()
      .int()
      .min(1, 'Rating must be at least 1 star.')
      .max(5, 'Rating cannot exceed 5 stars.'),
    type: z.enum(['Report a Bug', 'Suggest a Feature', 'General Feedback'], {
      errorMap: () => ({ message: 'Invalid feedback category.' }),
    }),
    title: z.string({
      required_error: 'Title is required.',
    })
    .trim()
    .min(10, 'Title must be at least 10 characters.')
    .max(100, 'Title cannot exceed 100 characters.'),
    description: z.string({
      required_error: 'Description is required.',
    })
    .trim()
    .min(20, 'Description must be at least 20 characters.')
    .max(1000, 'Description cannot exceed 1000 characters.'),
    pageUrl: z.string().min(1, 'Page URL is required.'),
    routeName: z.string().min(1, 'Route name is required.'),
    browser: z.string().min(1, 'Browser info is required.'),
    platform: z.string().min(1, 'Platform info is required.'),
    screenResolution: z.string().min(1, 'Screen resolution is required.'),
  }),
});
