/**
 * Class representing standardized API responses.
 * Enforces uniform structures across all route endpoints.
 */
export class ApiResponse {
  /**
   * Send a success response.
   */
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send an error response.
   */
  static error(res, message = 'Error', errors = [], statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors],
      timestamp: new Date().toISOString(),
    });
  }
}
