import helmet from 'helmet'

// Helmet Security Middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-<random>'"], // Restrict inline scripts
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  xssFilter: true,
  hidePoweredBy: true,
  noSniff: true,
  frameguard: { action: "deny" },
});
