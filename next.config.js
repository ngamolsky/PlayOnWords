module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/type-graphql$/, (resource) => {
        resource.request = resource.request.replace(
          /type-graphql/,
          "type-graphql/dist/browser-shim.js"
        );
      })
    );
    return config;
  },
};
