/**
 * Express Async Wrapper.
 * Eliminates repetitive try-catch blocks in route controllers.
 * 
 * @param {Function} fn - Asynchronous route controller function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
