module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@components": "./src/components",
            "@components/ui": "./src/components/ui",
            "@services": "./src/services",
            "@types": "./src/types",
          },
        },
      ],
    ],
  };
};
