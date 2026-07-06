import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const requestSwapSchema = z.object({
  body: z.object({
    receiverId: z.string({
      required_error: 'Receiver ID is required.',
    }).regex(objectIdRegex, 'Invalid receiver ID format.'),
    message: z.string().trim().max(500, 'Message cannot exceed 500 characters.').optional().or(z.literal('')),
  }),
});

export const swapIdSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Request ID parameter is required.',
    }).regex(objectIdRegex, 'Invalid request ID format.'),
  }),
});
