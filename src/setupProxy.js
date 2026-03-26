const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api/manage-list',
    createProxyMiddleware({
      target: 'http://hospital.softtrails.net',
      changeOrigin: true,
      secure: false,
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://hospital.softtrails.net',
      changeOrigin: true,
      secure: false,
    })
  );

  app.use(
    '/dmsapi',
    createProxyMiddleware({
      target: 'http://65.2.31.121:3002',
      changeOrigin: true,
      secure: false,
    })
  );
};
