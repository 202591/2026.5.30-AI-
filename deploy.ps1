# ═══════════════════════════════════════════════════════
# 宣室异闻录 — GitHub + Vercel 一键部署脚本
# ═══════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$repoName = "xuanshi-yiwenlu"

Write-Host "`n🔖 Step 1: 初始化 Git 仓库" -ForegroundColor Cyan
if (Test-Path .git) { Remove-Item -Recurse -Force .git }
git init
git branch -M main

Write-Host "`n🔖 Step 2: 清理不需要的文件" -ForegroundColor Cyan
# 确保 .gitignore 包含必要项
$gitignore = Get-Content .gitignore -Raw
if ($gitignore -notmatch "node_modules") {
    Add-Content .gitignore "`nnode_modules"
}

Write-Host "`n🔖 Step 3: 提交代码" -ForegroundColor Cyan
git add -A
git commit -m "feat: 宣室异闻录 v2.0 — 朱砂古籍案牍风互动叙事绘本"

Write-Host "`n🔖 Step 4: 创建 GitHub 仓库并推送" -ForegroundColor Cyan
Write-Host "  正在创建远程仓库..." -ForegroundColor Yellow
gh repo create $repoName --public --source=. --remote=origin --push

Write-Host "`n🔖 Step 5: 部署到 Vercel" -ForegroundColor Cyan
Write-Host "  正在连接 Vercel..." -ForegroundColor Yellow
npx vercel --yes

Write-Host "`n✅ 部署完成!" -ForegroundColor Green
Write-Host "  GitHub: https://github.com/$((gh api user --jq .login))/$repoName" -ForegroundColor White
Write-Host "  运行 'npx vercel --prod' 发布到生产环境" -ForegroundColor White
