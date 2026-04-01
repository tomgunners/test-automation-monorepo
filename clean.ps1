# ============================================
# clean.ps1 - Limpa o projeto para estado
# equivalente a um clone limpo do repositorio
#
# Uso:
#   .\clean.ps1
#
# Apos executar, reinstale as dependencias:
#   yarn install
# ============================================

Write-Host ""
Write-Host "[clean] Iniciando limpeza do projeto..." -ForegroundColor Cyan
Write-Host ""

# --- Dependencias ------------------------------------------------------------
Write-Host "[1/4] Removendo node_modules..." -ForegroundColor Yellow
Get-ChildItem -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "      OK - node_modules removidos" -ForegroundColor Green

# --- Lockfile ---------------------------------------------------------------
Write-Host "[2/4] Removendo yarn.lock..." -ForegroundColor Yellow
if (Test-Path "yarn.lock") {
  Remove-Item yarn.lock -Force
  Write-Host "      OK - yarn.lock removido" -ForegroundColor Green
} else {
  Write-Host "      yarn.lock nao encontrado" -ForegroundColor DarkYellow
}

# --- Artefatos de teste ------------------------------------------------------
Write-Host "[3/4] Removendo artefatos de teste..." -ForegroundColor Yellow
@("allure-results", "allure-report", "test-results", "results", "reports") | ForEach-Object {
  Get-ChildItem -Recurse -Directory -Filter $_ -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
}
Write-Host "      OK - artefatos removidos" -ForegroundColor Green

# --- Caches TypeScript -------------------------------------------------------
Write-Host "[4/4] Removendo caches TypeScript..." -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*.tsbuildinfo" -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Host "      OK - caches TypeScript removidos" -ForegroundColor Green

# --- Concluido ---------------------------------------------------------------
Write-Host ""
Write-Host "[clean] Projeto limpo com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Para reinstalar as dependencias execute:" -ForegroundColor Cyan
Write-Host "   yarn install" -ForegroundColor White
Write-Host ""