export function validateAccount(body, { passwordRequired = false } = {}) {
  const name = typeof body.store_name === 'string' ? body.store_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!name || name.length > 100) throw new Error('Name must contain 1–100 characters.');
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  if (passwordRequired) validatePassword(body.password);
  return {name,email};
}
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password,'utf8') > 72 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Use at least 8 characters with uppercase, lowercase, and a number (maximum 72 bytes).');
  }
}
