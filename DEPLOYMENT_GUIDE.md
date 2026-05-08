# Guía de Despliegue en AWS S3 + CloudFront

## Resumen de Cambios

Se han corregido los problemas de dependencias circulares que causaban el error `Cannot access 'Game' before initialization` en producción.

### Archivos Modificados

1. **src/main.js**
   - Cambio de `window.load` a `DOMContentLoaded`
   - Verificación de módulos cargados antes de inicialización
   - Manejo de `document.readyState`

2. **vite.config.js**
   - Configuración de Rollup para preservar estructura de módulos
   - Formato ES6 explícito

## Verificación Local

### 1. Verificar Build de Desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000 y verificar que:
- El juego carga sin errores en consola
- El sprite del fantasma se muestra correctamente
- Los sonidos funcionan al hacer clic
- El juego es jugable

### 2. Verificar Build de Producción Localmente

```bash
# Limpiar y construir
npm run build

# Verificar con script automatizado
./verify-production-build.sh

# Probar build localmente
npm run preview
```

Abrir http://localhost:4174 y verificar:
- No hay errores en la consola del navegador
- El juego funciona igual que en desarrollo
- Los assets (sprite, sonidos) cargan correctamente

### 3. Verificar en Modo Incógnito

Probar en modo incógnito para asegurar que no hay problemas de caché.

## Despliegue en AWS S3 + CloudFront

### Paso 1: Preparar Archivos

```bash
# Construir para producción
npm run build

# Verificar que todo está correcto
./verify-production-build.sh
```

Los archivos listos para despliegue están en `./dist/`

### Paso 2: Subir a S3

#### Opción A: AWS CLI

```bash
# Configurar AWS CLI (si no está configurado)
aws configure

# Subir archivos a S3
aws s3 sync ./dist/ s3://tu-bucket-name/ --delete

# Establecer permisos públicos (si es necesario)
aws s3 sync ./dist/ s3://tu-bucket-name/ --acl public-read
```

#### Opción B: Consola de AWS

1. Ir a AWS S3 Console
2. Seleccionar tu bucket
3. Eliminar archivos antiguos (opcional pero recomendado)
4. Subir todos los archivos de `./dist/`
5. Asegurar que los archivos tengan permisos de lectura pública

### Paso 3: Configurar S3 para Hosting Estático

1. En S3 Console, ir a tu bucket
2. Ir a "Properties" → "Static website hosting"
3. Habilitar "Static website hosting"
4. Index document: `index.html`
5. Error document: `index.html` (para SPA)

### Paso 4: Invalidar Caché de CloudFront

```bash
# Obtener Distribution ID
aws cloudfront list-distributions

# Invalidar caché
aws cloudfront create-invalidation \
  --distribution-id TU_DISTRIBUTION_ID \
  --paths "/*"
```

O desde la consola:
1. Ir a CloudFront Console
2. Seleccionar tu distribución
3. Ir a "Invalidations"
4. Crear nueva invalidación con path: `/*`

### Paso 5: Verificar Despliegue

1. **Esperar a que la invalidación complete** (puede tomar 5-15 minutos)

2. **Abrir en navegador en modo incógnito:**
   ```
   https://tu-dominio.cloudfront.net
   ```

3. **Verificar en DevTools:**
   - Abrir DevTools (F12)
   - Ir a Console
   - No debe haber errores de "Cannot access before initialization"
   - Verificar que todos los assets cargan correctamente

4. **Probar funcionalidad:**
   - Click en "Start Game" debe iniciar el juego
   - Sonidos deben funcionar
   - Colisiones deben detectarse
   - Score debe incrementarse

## Solución de Problemas

### Error: "Cannot access 'Game' before initialization"

Si aún ves este error después del despliegue:

1. **Verificar que subiste los archivos correctos:**
   ```bash
   # Reconstruir
   rm -rf dist
   npm run build
   
   # Verificar
   ./verify-production-build.sh
   
   # Subir nuevamente
   aws s3 sync ./dist/ s3://tu-bucket-name/ --delete
   ```

2. **Invalidar caché completamente:**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id TU_DISTRIBUTION_ID \
     --paths "/*"
   ```

3. **Limpiar caché del navegador:**
   - Usar modo incógnito
   - O limpiar caché manualmente (Ctrl+Shift+Delete)

### Error: Assets no cargan (404)

1. **Verificar estructura de archivos en S3:**
   ```
   /index.html
   /assets/index-[hash].js
   /assets/ghosty.png
   /assets/jump.wav
   /assets/game_over.wav
   ```

2. **Verificar permisos de archivos:**
   ```bash
   aws s3 sync ./dist/ s3://tu-bucket-name/ --acl public-read
   ```

3. **Verificar configuración de CloudFront:**
   - Origin debe apuntar al bucket S3 correcto
   - Behavior debe permitir todos los métodos HTTP necesarios

### Error: CORS

Si ves errores de CORS:

1. **Configurar CORS en S3:**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

2. **Verificar headers de CloudFront:**
   - Asegurar que CloudFront pasa los headers CORS correctos

## Configuración Recomendada de CloudFront

### Behavior Settings

- **Viewer Protocol Policy:** Redirect HTTP to HTTPS
- **Allowed HTTP Methods:** GET, HEAD, OPTIONS
- **Cache Policy:** CachingOptimized
- **Compress Objects Automatically:** Yes

### Custom Error Responses

Para SPA, configurar:
- **HTTP Error Code:** 403, 404
- **Response Page Path:** /index.html
- **HTTP Response Code:** 200

## Monitoreo Post-Despliegue

### 1. Verificar Logs de CloudFront

```bash
aws cloudfront get-distribution-config \
  --id TU_DISTRIBUTION_ID
```

### 2. Verificar Métricas en CloudWatch

- Requests
- Bytes Downloaded
- Error Rate

### 3. Probar en Múltiples Navegadores

- Chrome
- Firefox
- Safari
- Edge

### 4. Probar en Dispositivos Móviles

- iOS Safari
- Android Chrome

## Checklist de Despliegue

- [ ] Build local exitoso (`npm run build`)
- [ ] Verificación automatizada exitosa (`./verify-production-build.sh`)
- [ ] Preview local funciona (`npm run preview`)
- [ ] Archivos subidos a S3
- [ ] Permisos de S3 configurados
- [ ] Caché de CloudFront invalidado
- [ ] Esperado 5-15 minutos para invalidación
- [ ] Verificado en navegador (modo incógnito)
- [ ] No hay errores en consola
- [ ] Assets cargan correctamente
- [ ] Juego es jugable
- [ ] Sonidos funcionan
- [ ] Probado en múltiples navegadores
- [ ] Probado en dispositivos móviles

## Comandos Rápidos

```bash
# Build y verificación completa
npm run build && ./verify-production-build.sh

# Despliegue completo (AWS CLI)
npm run build && \
aws s3 sync ./dist/ s3://tu-bucket-name/ --delete --acl public-read && \
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths "/*"

# Verificar despliegue
curl -I https://tu-dominio.cloudfront.net
```

## Contacto y Soporte

Si encuentras problemas adicionales:

1. Revisar `PRODUCTION_FIX.md` para detalles técnicos
2. Verificar logs de CloudFront
3. Verificar consola del navegador (DevTools)
4. Verificar que la versión de Node.js es compatible (>= 14)

## Notas Adicionales

- **Tiempo de propagación de CloudFront:** 5-15 minutos
- **Caché del navegador:** Usar modo incógnito para pruebas
- **Versionado de assets:** Vite genera hashes automáticamente
- **Rollback:** Mantener backup de versión anterior en S3

---

**Última actualización:** $(date)
**Versión del juego:** 1.0.0
**Node.js requerido:** >= 14
**Vite versión:** 5.4.21
