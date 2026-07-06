/**
 * Reusable schema validator middleware using Zod.
 * Validates request body, parameters, and query parameters dynamically.
 * 
 * @param {z.ZodObject} schema - The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace requests with fully validated & sanitized data
    req.body = validatedData.body;
    req.query = validatedData.query;
    req.params = validatedData.params;
    
    next();
  } catch (error) {
    // Forward Zod error directly to the global error handling middleware
    next(error);
  }
};

export default validate;
