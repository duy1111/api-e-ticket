export default () => ({
  app: {
    env: process.env.APP_ENV || 'development',
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    root: process.env.APPLICATION_ROOT,
    domain: process.env.APP_DOMAIN,
  },
  swagger: {
    docsUrl: process.env.DOCS_URL || 'docs',
  },
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/api',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'r@sadfkdshgdskghkdsajghgakslig',
  },
  mail: {
    host: process.env.MAIL_HOST,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },
  stripe: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceLookupKey: process.env.STRIPE_PRICE_LOOKUP_KEY || 'NodeForge',
  },
  aws: {
    region: process.env.AWS_REGION,
  },
});
