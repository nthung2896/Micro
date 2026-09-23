import crypto from 'crypto';

const isDev = process.env.NODE_ENV !== 'production';

// Dynamic nonce generation per request (via middleware)
// Note: Actual nonce will be injected via middleware for production
const nonce = isDev ? crypto.randomBytes(16).toString('base64') : '__NONCE__';

const connectSrc = isDev
  ? "'self' http://localhost:5005 http://localhost:5000 ws://localhost:5005"
  : "'self' https://api-dvcbqp.ebizoffice.vn";

// Only include CDNs you actually use
const trustedDomains = {
  scripts: [
    "'self'",
    // "https://cdn.example.com" // Uncomment and replace with actual CDNs
  ],
  styles: [
    "'self'",
    "https://fonts.googleapis.com"
  ],
  fonts: [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  images: [
    "'self'",
    "data:",
    "blob:",
    "https://*.amcharts.com"
  ]
};

const ContentSecurityPolicy = `
  default-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  object-src 'none';
  script-src ${trustedDomains.scripts.join(' ')} ${isDev ? "'unsafe-eval' 'unsafe-inline'" : `'nonce-${nonce}'`};
  script-src-elem ${trustedDomains.scripts.join(' ')} ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`};
  style-src ${trustedDomains.styles.join(' ')} 'unsafe-inline';
  img-src ${trustedDomains.images.join(' ')};
  connect-src ${connectSrc};
  font-src ${trustedDomains.fonts.join(' ')};
  worker-src 'self' blob:;
  manifest-src 'self';
  ${!isDev ? 'upgrade-insecure-requests;' : ''}
`.replace(/\n/g, ' ').trim();

const securityHeaders = [
  // { 
  //   key: 'Content-Security-Policy', 
  //   value: ContentSecurityPolicy 
  // },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), serial=()'
  },
  ...(isDev ? [] : [
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    },
  ])
];

// const nextConfig = {
//   reactStrictMode: true,
//   poweredByHeader: false,
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: securityHeaders,
//       },
//     ];
//   },
//   // Remove webpack nonce loader since we'll use middleware
// };

const nextConfig = {
  output: 'standalone',

  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  async headers() {
    return [
      {
        // Áp dụng cho tất cả route
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // Liệt kê các nguồn gốc (origins) được phép nhúng.
            value: "frame-ancestors 'self' https://online.gov.vn http://localhost:3000 http://113.20.123.20:8889 http://localhost:3001",
          },
        ],
      },
    ];
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/auth/login',
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;