param (
    [string]$Message = "chore: actualización y mejoras automáticas"
)

Write-Host "`n🚀 Iniciando despliegue hacia GitHub y Vercel..." -ForegroundColor Cyan

# 1. Verificar si hay cambios locales
$status = git status --porcelain
if (-not $status) {
    Write-Host "ℹ️ No hay cambios pendientes para subir. Tu repositorio ya está al día." -ForegroundColor Yellow
    exit 0
}

# 2. Agregar cambios
Write-Host "📦 Empaquetando cambios locales..." -ForegroundColor Gray
git add .

# 3. Crear commit
Write-Host "📝 Guardando commit: '$Message'" -ForegroundColor Gray
git commit -m $Message

# 4. Enviar a GitHub (Vercel actualizará la web automáticamente)
Write-Host "☁️ Enviando a GitHub (origin/main)..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✨ ¡Éxito total! Cambios subidos a GitHub." -ForegroundColor Green
    Write-Host "🌐 Vercel ha detectado el cambio y tu web se actualizará sola en vivo en ~20 segundos.`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Ocurrió un error al subir a GitHub. Revisa tus credenciales o conexión.`n" -ForegroundColor Red
}

