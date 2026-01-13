// orval.config.js
module.exports = {
  api: {
    // Highlight the change from a local path to a URL
    input: 'C:\\Users\\Kegen\\Documents\\Projects\\tmrev-api-v2\\swagger-spec.json', // Your URL here
    output: {
      client: 'react-query',
      namingConvention: 'camelCase',
      mode: 'split',
      workspace: './api/tmrev-api-v2', // Adjust the workspace path as needed
      target: './endpoints.ts',
      schemas: './schemas',
      override: {
        mutator: {
          path: './mutator/axiosInstance.ts', // Path to your instance
          name: 'axiosInstance', // The name of the exported instance
        },
      },
    },
    hooks: {
      // Run ESLint directly against the generated API files.
      // Adjust extensions/glob as needed for your project.
      afterAllFilesWrite: 'prettier --write ./api/**/*.ts',
    },
  },
};
