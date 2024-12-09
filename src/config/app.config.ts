export default () => ({
  port: parseInt(process.env.PORT || '8080', 10),
  environment: process.env.NODE_ENV || 'development',
});
