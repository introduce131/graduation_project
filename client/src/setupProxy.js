const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://arcane-dynamics-470515-j8.du.r.appspot.com',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};
