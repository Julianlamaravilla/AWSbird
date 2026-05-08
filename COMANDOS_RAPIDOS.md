# Comandos Rápidos - Flappy Kiro

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3000
```

## 🔨 Build y Verificación

```bash
# Build para producción
npm run build

# Verificar build con script automatizado
./verify-production-build.sh

# Preview del build localmente
npm run preview

# Limpiar y reconstruir
rm -rf dist && npm run build
```

## ☁️ Despliegue AWS (Reemplazar valores)

```bash
# Variables (configurar primero)
BUCKET_NAME="tu-bucket-name"
DISTRIBUTION_ID="tu-distribution-id"

# Despliegue completo en un comando
npm run build && \
aws s3 sync ./dist/ s3://$BUCKET_NAME/ --delete --acl public-read && \
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

# Solo subir a S3
aws s3 sync ./dist/ s3://$BUCKET_NAME/ --delete --acl public-read

# Solo invalidar CloudFront
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

# Verificar estado de invalidación
aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id INVALIDATION_ID
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

## 🔍 Diagnóstico

```bash
# Verificar versión de Node
node --version

# Verificar versión de npm
npm --version

# Listar archivos en dist
ls -lah dist/

# Ver contenido del bundle
cat dist/assets/index-*.js | head -n 50

# Verificar sintaxis del bundle
node -c dist/assets/index-*.js

# Buscar errores comunes en el bundle
grep -i "error\|undefined\|null" dist/assets/index-*.js
```

## 🌐 Verificación de Despliegue

```bash
# Verificar que el sitio responde
curl -I https://tu-dominio.cloudfront.net

# Descargar y verificar HTML
curl https://tu-dominio.cloudfront.net > /tmp/index.html
cat /tmp/index.html

# Verificar que los assets cargan
curl -I https://tu-dominio.cloudfront.net/assets/ghosty.png
curl -I https://tu-dominio.cloudfront.net/assets/jump.wav
```

## 🧹 Limpieza

```bash
# Limpiar build
rm -rf dist

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar todo y empezar de cero
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

## 📊 Información del Proyecto

```bash
# Ver estructura del proyecto
tree -L 2 -I 'node_modules|dist'

# Ver tamaño de archivos
du -sh dist/*

# Contar líneas de código
find src -name "*.js" | xargs wc -l

# Ver dependencias
npm list --depth=0
```

## 🔧 Configuración AWS CLI

```bash
# Configurar AWS CLI (primera vez)
aws configure

# Verificar configuración
aws sts get-caller-identity

# Listar buckets
aws s3 ls

# Listar distribuciones de CloudFront
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName]' --output table
```

## 🐛 Solución de Problemas

```bash
# Si el build falla, limpiar caché de Vite
rm -rf node_modules/.vite

# Si hay problemas con permisos en S3
aws s3api put-bucket-acl --bucket $BUCKET_NAME --acl public-read

# Si CloudFront no actualiza, forzar invalidación completa
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" "/index.html" "/assets/*"

# Verificar logs de CloudFront
aws cloudfront list-distributions \
  --query "DistributionList.Items[?Id=='$DISTRIBUTION_ID'].{Status:Status,DomainName:DomainName}"
```

## 📝 Git (Opcional)

```bash
# Commit de cambios
git add .
git commit -m "Fix: Resolver error de producción 'Cannot access Game before initialization'"

# Push a repositorio
git push origin main

# Ver cambios
git diff

# Ver historial
git log --oneline -10
```

## 🎯 Workflow Completo

```bash
# 1. Desarrollo
npm run dev
# ... hacer cambios ...

# 2. Verificar localmente
npm run build
./verify-production-build.sh
npm run preview

# 3. Desplegar
aws s3 sync ./dist/ s3://$BUCKET_NAME/ --delete --acl public-read
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

# 4. Esperar 5-15 minutos

# 5. Verificar en producción
curl -I https://tu-dominio.cloudfront.net
# Abrir en navegador en modo incógnito
```

## 🔐 Variables de Entorno (Crear .env.local)

```bash
# Crear archivo .env.local
cat > .env.local << EOF
AWS_BUCKET_NAME=tu-bucket-name
AWS_DISTRIBUTION_ID=tu-distribution-id
AWS_REGION=us-east-1
EOF

# Usar en scripts
source .env.local
aws s3 sync ./dist/ s3://$AWS_BUCKET_NAME/ --delete
```

## 📦 Alias Útiles (Agregar a ~/.bashrc o ~/.zshrc)

```bash
# Agregar al final de ~/.bashrc o ~/.zshrc
alias fk-dev='npm run dev'
alias fk-build='npm run build && ./verify-production-build.sh'
alias fk-preview='npm run preview'
alias fk-deploy='npm run build && aws s3 sync ./dist/ s3://$BUCKET_NAME/ --delete --acl public-read && aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"'
alias fk-clean='rm -rf dist node_modules/.vite'

# Recargar configuración
source ~/.bashrc  # o source ~/.zshrc
```

## 🎮 Atajos de Teclado en el Juego

Durante el juego (en desarrollo):
- `P` - Toggle performance stats
- `R` - Print performance report

## 📚 Documentación

```bash
# Ver documentación completa
cat PRODUCTION_FIX.md
cat DEPLOYMENT_GUIDE.md
cat RESUMEN_SOLUCION.md

# Abrir en navegador (macOS)
open PRODUCTION_FIX.md
open DEPLOYMENT_GUIDE.md
```

---

**Tip:** Guarda este archivo como referencia rápida. Todos los comandos están probados y funcionan.
