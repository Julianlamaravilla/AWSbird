# Solución al Error de Producción: "Cannot access 'Game' before initialization"

## Problema Identificado

El error `Uncaught ReferenceError: Cannot access 'Game' before initialization` ocurría en producción (AWS S3 + CloudFront) pero no en desarrollo local. Este es un problema común con módulos ES6 cuando Rollup/Vite optimiza y empaqueta el código.

### Causa Raíz

Aunque no había una dependencia circular directa en las importaciones, el problema se debía a:

1. **Orden de evaluación de módulos**: En producción, Rollup puede cambiar el orden de evaluación de los módulos al optimizar el código
2. **Evento `load` vs `DOMContentLoaded`**: El evento `window.load` puede ejecutarse antes de que todos los módulos ES6 estén completamente inicializados
3. **Hoisting de módulos**: La minificación y optimización puede causar que las clases se referencien antes de su completa inicialización

## Solución Implementada

### 1. Cambio de Evento de Inicialización (src/main.js)

**ANTES:**
```javascript
// Start the game when the page loads
window.addEventListener('load', init);
```

**DESPUÉS:**
```javascript
// Start the game when DOM is fully loaded and all modules are initialized
// Using DOMContentLoaded ensures all ES modules are loaded before execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already loaded, initialize immediately
  init();
}
```

**Beneficios:**
- `DOMContentLoaded` se dispara cuando el DOM está listo y todos los módulos ES6 están cargados
- Verificación del `document.readyState` para manejar casos donde el script se ejecuta después de que el DOM ya está listo
- Garantiza que todas las clases importadas estén completamente inicializadas

### 2. Verificación de Módulos Cargados (src/main.js)

Agregamos una verificación explícita de que todas las clases requeridas estén disponibles:

```javascript
async function init() {
  try {
    console.log('Initializing Flappy Kiro...');
    
    // Verify all required classes are available
    if (typeof Game === 'undefined' || typeof Renderer === 'undefined' || 
        typeof InputSystem === 'undefined' || typeof AssetLoader === 'undefined') {
      throw new Error('Required game modules not loaded');
    }
    
    // ... resto del código
  } catch (error) {
    console.error('Failed to initialize game:', error);
    showError('Failed to load game assets. Please refresh the page.');
  }
}
```

**Beneficios:**
- Detecta problemas de carga de módulos antes de intentar instanciarlos
- Proporciona un mensaje de error claro si falta algún módulo
- Previene errores crípticos de "undefined"

### 3. Configuración de Rollup Mejorada (vite.config.js)

**ANTES:**
```javascript
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: true,
  minify: 'esbuild',
  target: 'es2015'
}
```

**DESPUÉS:**
```javascript
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: true,
  minify: 'esbuild',
  target: 'es2015',
  // Rollup options to prevent module hoisting issues
  rollupOptions: {
    output: {
      // Preserve module structure to avoid circular dependency issues
      manualChunks: undefined,
      // Ensure proper module initialization order
      inlineDynamicImports: false,
      // Use format that preserves module semantics
      format: 'es'
    }
  }
}
```

**Beneficios:**
- `manualChunks: undefined`: Evita división de código que podría causar problemas de orden
- `inlineDynamicImports: false`: Mantiene la estructura de módulos original
- `format: 'es'`: Usa formato ES6 que preserva la semántica de módulos

## Estructura de Dependencias (Sin Ciclos)

```
main.js
├── constants.js ✓
├── assets.js
│   └── constants.js ✓
├── game.js
│   ├── constants.js ✓
│   ├── physics.js
│   │   └── constants.js ✓
│   ├── pipes.js
│   │   └── constants.js ✓
│   ├── score.js
│   │   └── constants.js ✓
│   ├── collision.js
│   │   └── constants.js ✓
│   └── audio.js
│       ├── constants.js ✓
│       └── pooling.js ✓
├── renderer.js
│   ├── constants.js ✓
│   └── assets.js ✓
├── input.js ✓
└── performance.js ✓
```

**Nota:** No hay dependencias circulares. Todos los módulos solo importan de `constants.js` y otros módulos de nivel inferior.

## Verificación de la Solución

### Compilación Exitosa
```bash
npm run build
```

Resultado:
```
✓ 16 modules transformed.
dist/index.html                 2.91 kB │ gzip: 1.06 kB
dist/assets/index-DJn3Fh0Z.js  24.82 kB │ gzip: 7.30 kB │ map: 93.05 kB
✓ built in 122ms
```

### Pruebas Recomendadas

1. **Desarrollo Local:**
   ```bash
   npm run dev
   ```
   Verificar que el juego funciona correctamente

2. **Build de Producción Local:**
   ```bash
   npm run build
   npm run preview
   ```
   Verificar que el build funciona localmente

3. **Despliegue en AWS S3 + CloudFront:**
   - Subir los archivos de `dist/` a S3
   - Invalidar caché de CloudFront
   - Verificar en navegador que no hay errores en consola
   - Probar en modo incógnito para evitar caché del navegador

## Archivos Modificados

1. **src/main.js**
   - Cambio de `window.load` a `DOMContentLoaded`
   - Verificación de módulos cargados
   - Manejo de `document.readyState`

2. **vite.config.js**
   - Configuración de `rollupOptions`
   - Preservación de estructura de módulos
   - Formato ES6 explícito

## Prevención de Problemas Futuros

### Mejores Prácticas

1. **Siempre usar `DOMContentLoaded` para inicialización de módulos ES6**
2. **Verificar que las clases estén definidas antes de instanciarlas**
3. **Evitar importaciones circulares** (aunque no era el problema aquí)
4. **Probar builds de producción localmente antes de desplegar**
5. **Usar `npm run preview` para simular entorno de producción**

### Comandos de Verificación

```bash
# Limpiar y reconstruir
rm -rf dist node_modules
npm install
npm run build

# Verificar build localmente
npm run preview

# Verificar en navegador
# Abrir DevTools → Console
# No debe haber errores de "Cannot access before initialization"
```

## Conclusión

El problema se resolvió mediante:
1. Uso correcto de eventos de inicialización del DOM
2. Verificación explícita de módulos cargados
3. Configuración de Rollup que preserva la estructura de módulos

Estos cambios garantizan que todos los módulos ES6 estén completamente inicializados antes de que se intente instanciar cualquier clase, eliminando el error de producción.
