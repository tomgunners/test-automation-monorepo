module.exports = {
  default: {
    paths: ['src/features/**/*.feature'],
    require: ['src/hooks/**/*.ts', 'src/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'allure-cucumberjs/reporter',
    ],
    
    formatOptions: {
      resultsDir: 'allure-results',
    },
    
    retry: 1,
    publish: true,
  },

  allure: {
    paths: ['src/features/**/*.feature'],
    require: ['src/hooks/**/*.ts', 'src/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'allure-cucumberjs/reporter',
    ],
    formatOptions: {
      resultsDir: 'allure-results',
    },
    publish: true,
  },
};