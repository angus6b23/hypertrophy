module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',

  plugins: [
    require.resolve('prettier-plugin-tailwindcss'),
    require.resolve('prettier-plugin-sort-imports'),
  ],
  tailwindAttributes: ['className'],
  sortingMethod: 'alphabetical',
  sortingOrder: 'ascending',
  importTypeOrder: ['NPMPackages', 'localImports'],
  newlineBetweenTypes: true,
};
