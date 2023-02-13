
module.exports = {
  public_path:'server/public',
  jwtSecret: process.env.JWT_SECRET || 'my-api-secret',
  jwtDuration: process.env.JWT_DURATION || '2 hours',
}
