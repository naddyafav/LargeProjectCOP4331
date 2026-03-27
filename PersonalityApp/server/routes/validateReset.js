/**
 * validateReset.js
 * Validates user input for forgot-password and reset-password routes.
 * Call these as middleware before your route handlers.
 */

/**
 * Validates forgot password input.
 * Checks: email format.
 */
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validates reset password input.
 * Checks: token presence, new password length, password match.
 */
const validateResetPassword = (req, res, next) => {
  const { token, newPassword, confirmNewPassword } = req.body;
  const errors = [];

  if (!token || token.trim().length === 0) {
    errors.push('Reset token is missing.');
  }

  if (!newPassword) {
    errors.push('New password is required.');
  } else if (newPassword.length < 6) {
    errors.push('New password must be at least 6 characters.');
  }

  if (!confirmNewPassword) {
    errors.push('Please confirm your new password.');
  } else if (newPassword !== confirmNewPassword) {
    errors.push('Passwords do not match.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = { validateForgotPassword, validateResetPassword };
