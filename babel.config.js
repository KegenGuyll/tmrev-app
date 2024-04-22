module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
       'babel-plugin-root-import',
       {
         root: __dirname,
         rootPathPrefix: '~',
         rootPathSuffix: './src',
       },
      ],
      [
        'module:react-native-dotenv',
        {
          envName: 'TMDB_API_KEY',
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          blacklist: null, // DEPRECATED
          whitelist: null, // DEPRECATED
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      'react-native-reanimated/plugin'
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel', 'react-native-reanimated/plugin'],
      },
    },
  }
}
