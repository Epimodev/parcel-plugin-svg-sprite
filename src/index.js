module.exports = function(bundler) {
  bundler.addAssetType('svg', require.resolve('./asset'));
  bundler.addPackager('svg', require.resolve('./packager'));
  bundler.addPackager('html', require.resolve('./htmlPackager'));
};
