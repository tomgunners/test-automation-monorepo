/**
 * Utilitários para detecção e informações do ambiente CI/CD.
 * Centraliza a lógica de CI detection para evitar repetição entre workspaces.
 */

/** Retorna true quando a execução ocorre em qualquer ambiente CI conhecido */
export const isCI: boolean =
  process.env.CI === 'true' ||
  process.env.GITHUB_ACTIONS === 'true' ||
  process.env.GITLAB_CI === 'true' ||
  process.env.JENKINS_URL !== undefined ||
  process.env.CIRCLECI === 'true' ||
  process.env.BITBUCKET_BUILD_NUMBER !== undefined;

/** Nome legível do CI ativo, ou "Local Machine" fora de CI */
export function getExecutorName(): string {
  if (process.env.GITHUB_ACTIONS) return 'GitHub Actions';
  if (process.env.GITLAB_CI) return 'GitLab CI';
  if (process.env.JENKINS_URL) return 'Jenkins';
  if (process.env.CIRCLECI) return 'CircleCI';
  if (process.env.BITBUCKET_BUILD_NUMBER) return 'Bitbucket Pipelines';
  return 'Local Machine';
}

/** URL do build atual no CI (vazio quando executado localmente) */
export function getBuildUrl(): string {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  if (GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_RUN_ID) {
    return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
  }
  return process.env.REPORT_URL ?? '';
}

/** Nome do pipeline/workflow atual */
export function getBuildName(): string {
  return (
    process.env.GITHUB_WORKFLOW ??
    process.env.CI_PIPELINE_NAME ??
    'Local Test Execution'
  );
}

/** Número sequencial do build (para ordenação do Trend no Allure) */
export function getBuildOrder(): string | number {
  return (
    process.env.GITHUB_RUN_NUMBER ??
    process.env.CI_PIPELINE_ID ??
    Date.now()
  );
}
