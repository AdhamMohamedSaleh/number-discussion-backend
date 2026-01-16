# Security Features

This document outlines the security measures implemented in the Number Discussion Backend API.

## Overview

The API implements multiple layers of security to protect against common web vulnerabilities and attacks.

## Implemented Security Features

### 1. Rate Limiting

Rate limiting prevents abuse and protects against brute force attacks and DoS attempts.

#### API Rate Limiter
- **Endpoint**: All `/api/*` routes
- **Limit**: 100 requests per 15 minutes per IP
- **Purpose**: Prevent general API abuse

#### Authentication Rate Limiter
- **Endpoints**: `/api/auth/register`, `/api/auth/login`
- **Limit**: 5 attempts per 15 minutes per IP
- **Purpose**: Prevent brute force attacks on authentication
- **Note**: Successful requests don't count toward the limit

#### Creation Rate Limiter
- **Endpoints**: `/api/calculations` (POST), `/api/calculations/:id/respond` (POST)
- **Limit**: 10 requests per minute per IP
- **Purpose**: Prevent spam and resource exhaustion

### 2. CORS (Cross-Origin Resource Sharing)

CORS is configured to only allow requests from trusted origins.

#### Configuration
- **Development**: All origins allowed for ease of development
- **Production**: Only specific origins in `ALLOWED_ORIGINS` environment variable
- **Credentials**: Enabled for cookie/session support
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization

#### Setting Allowed Origins
Add your frontend URL to the `ALLOWED_ORIGINS` environment variable:

```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-domain.com
```

Multiple origins can be comma-separated.

### 3. Security Headers (Helmet)

Helmet sets various HTTP headers to protect against common vulnerabilities:

- **X-DNS-Prefetch-Control**: Controls browser DNS prefetching
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables XSS filter in browsers
- **Strict-Transport-Security**: Enforces HTTPS connections
- **Content-Security-Policy**: Prevents XSS and injection attacks

### 4. Request Logging

Morgan middleware logs all HTTP requests for monitoring and debugging.

- **Development**: Concise logging (`dev` format)
- **Production**: Detailed logging (`combined` format)

Log format includes:
- IP address
- Request method and URL
- Response status code
- Response time
- User agent

### 5. Input Validation

- **Body Size Limit**: Maximum 10MB per request
- **JSON Parsing**: Built-in Express JSON parser with size limits

### 6. Authentication Security

#### Password Hashing
- **Algorithm**: bcrypt with 10 salt rounds
- **Storage**: Only hashed passwords stored in database
- **Verification**: Constant-time comparison to prevent timing attacks

#### JWT Tokens
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days
- **Secret**: Strong random secret (minimum 32 characters)
- **Storage**: Client-side (typically localStorage or httpOnly cookies)

#### Token Validation
- Tokens must include "Bearer " prefix in Authorization header
- Invalid or expired tokens return 401 Unauthorized
- User information extracted from valid tokens

### 7. Database Security

- **Parameterized Queries**: All database queries use parameterized statements
- **SQL Injection Prevention**: No string concatenation in queries
- **Connection Pooling**: Limits concurrent database connections
- **Password Encryption**: Database passwords stored securely

## Environment Variables

### Required for Security

```env
# JWT secret - use a strong random string
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Allowed frontend origins (comma-separated)
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Environment mode
NODE_ENV=production
```

### Generating Secure Secrets

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

## Security Best Practices

### For Developers

1. **Never commit secrets**: Keep `.env` files out of version control
2. **Use HTTPS**: Always use HTTPS in production
3. **Rotate secrets**: Regularly rotate JWT secrets and database passwords
4. **Update dependencies**: Keep all packages up to date
5. **Review logs**: Regularly check logs for suspicious activity
6. **Validate input**: Always validate and sanitize user input
7. **Principle of least privilege**: Database users should have minimum required permissions

### For Deployment

1. **Use environment variables**: Never hardcode secrets
2. **Enable monitoring**: Set up logging and alerting
3. **Regular backups**: Backup database regularly
4. **SSL/TLS**: Use valid SSL certificates
5. **Firewall rules**: Restrict database access to application servers only
6. **Regular updates**: Keep server and dependencies updated

## Rate Limit Responses

When rate limit is exceeded, the API returns:

```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

Headers included:
- `RateLimit-Limit`: Maximum number of requests
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Time when the limit resets (Unix timestamp)

## CORS Error Responses

When CORS blocks a request:

```json
{
  "error": "Not allowed by CORS"
}
```

Check server logs for:
```
CORS blocked request from origin: https://unauthorized-site.com
```

## Security Incident Response

If you suspect a security incident:

1. **Immediate Actions**:
   - Rotate all secrets immediately
   - Review access logs
   - Identify affected users
   - Block malicious IPs if identified

2. **Investigation**:
   - Check application logs
   - Review database access logs
   - Analyze rate limit violations
   - Check for unusual patterns

3. **Remediation**:
   - Patch vulnerabilities
   - Update security measures
   - Notify affected users if needed
   - Document the incident

## Vulnerability Reporting

If you discover a security vulnerability, please report it to:
- Email: [Your security email]
- GitHub: Create a private security advisory

**Do not** create public issues for security vulnerabilities.

## Security Audits

### Recommended Tools

- **npm audit**: Check for vulnerable dependencies
  ```bash
  npm audit
  npm audit fix
  ```

- **Snyk**: Continuous security monitoring
  ```bash
  npm install -g snyk
  snyk test
  ```

- **OWASP ZAP**: Web application security testing
- **Burp Suite**: Security testing proxy

### Regular Checks

- [ ] Run `npm audit` monthly
- [ ] Review and update dependencies quarterly
- [ ] Test rate limiting functionality
- [ ] Verify CORS configuration
- [ ] Check for exposed secrets
- [ ] Review access logs for anomalies

## Compliance

This application implements security measures aligned with:
- OWASP Top 10
- GDPR requirements (for EU users)
- General data protection best practices

## Additional Recommendations

### Future Enhancements

1. **Two-Factor Authentication (2FA)**: Add optional 2FA for user accounts
2. **API Keys**: Implement API key authentication for third-party integrations
3. **IP Whitelisting**: Allow specific IPs for sensitive operations
4. **Audit Logging**: Log all data modifications with timestamps and user info
5. **Password Policies**: Enforce minimum password strength requirements
6. **Account Lockout**: Temporarily lock accounts after multiple failed login attempts
7. **Session Management**: Implement session timeouts and concurrent session limits
8. **Content Validation**: Add more robust input validation and sanitization
9. **Security Headers**: Fine-tune CSP headers for stricter security
10. **Penetration Testing**: Regular professional security assessments

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## Version History

- **v1.1.0** (2026-01-16): Added rate limiting, CORS configuration, helmet, and logging
- **v1.0.0** (2026-01-16): Initial security implementation with JWT and password hashing

---

**Last Updated**: January 16, 2026
**Security Contact**: [Your contact information]
