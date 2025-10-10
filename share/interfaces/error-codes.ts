export class CustomError extends Error {
  code = 0;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code || 400;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const AuthErrors = {
  no_auth_header: "No Authorization header",
  invalid_auth_header: "Invalid Authorization header",
  username_missing: "Username is missing",
  username_too_short: "Username must be at least 3 characters long",
  username_too_long: "Username must be less than 32 characters long",
  username_invalid_char: "Username must be alphanumeric or underscore",
  username_exists: "Username already exists",
  password_missing: "Password required",
  password_too_short: "Password must be longer than 8 characters",
  password_too_long: "Password must be less than 32 characters long",
  displayName_missing: "Display name is required for signup",
  displayName_too_long: "Display name must be less than 32 characters long",
  displayName_too_short: "Display name must be at least 3 characters long",
  user_is_disabled: "User is disabled",
  username_or_password_incorrect: "Username or password is incorrect",
  expected_refresh_token: "Token not accepted",
  unauthorized_access: "Unauthorized access",
  user_id_not_found: "User id not found",
} as const;

export const MeasurementErrors = {
  all_fields_empty: "All fields are empty",
  id_not_found: "Id not found",
  weight_negative: "Weight cannot be negative",
  weight_too_high: "Weight cannot be higher than 999",
  height_negative: "Height cannot be negative",
  height_too_high: "Height cannot be higher than 300",
  bodyfat_negative: "Body fat cannot be negative",
  bodyfat_too_high: "Body fat cannot be higher than 100",
  chest_negative: "Chest cannot be negative",
  chest_too_high: "Chest cannot be higher than 999",
  waist_negative: "Waist cannot be negative",
  waist_too_high: "Waist cannot be higher than 999",
  hip_negative: "Hip cannot be negative",
  hip_too_high: "Hip cannot be higher than 999",
} as const;

export const PathErrors = {
  id_not_found: "Id not found",
  id_invalid: "Id is invalid",
  param_invalid: "Invalid parameters",
};

export const InputError = {
  not_number: "Please enter a number",
};
