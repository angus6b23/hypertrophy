export const AuthErrors = {
  username_missing: "Username is missing",
  username_too_short: "Username must be at least 3 characters long",
  username_too_long: "Username must be less than 32 characters long",
  username_invalid_char: "Username must be alphanumeric or underscore",
  password_missing: "Password is required for login",
  displayName_missing: "Display name is required for signup",
  displayName_too_long: "Display name must be less than 32 characters long",
  displayName_too_short: "Display name must be at least 3 characters long",
  user_is_disabled: "User is disabled",
  username_or_password_incorrect: "Username or password is incorrect",
  expected_refresh_token: "Token not accepted",
} as const;
