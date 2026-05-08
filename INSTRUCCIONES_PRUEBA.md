# 🧪 Instrucciones de Prueba - Build de Producción

## 📋 Checklist de Verificación

Sigue estos pasos para verificar que el error de producción ha sido completamente resuelto:

---

## 1️⃣ Verificación Automática

### Ejecutar el Script de Verificación

```bash
node verify-production-fix.js
```

### Resultado Esperado:

```
🔍 Verifying Production Build Fix...

📦 Analyzing bundle: index-CeiV4XH2.js

✅ Check 1: Deferred initialization
   ✓ Found setTimeout for deferred init
   ✓ No immediate init() calls detected

✅ Check 2: Class definition order
   ✓ All class definitions appear before init call

✅ Check 3: Module structure
   ✓ All modules bundled into single file (no circular dependency risk)

✅ Check 4: DOM ready handling
   ✓ DOMContentLoaded event listener present

============================================================
✅ PRODUCTION BUILD VERIFICATION PASSED
```

**Si ves este mensaje:** ✅ El fix está correctamente aplicado.

---

## 2️⃣ Construir para Producción

### Ejecutar el Build

```bash
npm run build
```

### Resultado Esperado:

```
> flappy-kiro@1.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 16 modules transformed.
dist/index.html                 2.91 kB │ gzip: 1.06 kB
dist/assets/index-XXXXXXXX.js  24.83 kB │ gzip: 7.31 kB │ map: 93.35 kB
✓ built in XXXms
```

**Si ves este mensaje:** ✅ El build se completó sin errores.

---

## 3️⃣ Servir el Build de Producción

### Iniciar el Servidor de Preview

```bash
npm run preview
```

### Resultado Esperado:

```
> flappy-kiro@1.0.0 preview
> vite preview

  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Si ves este mensaje:** ✅ El servidor está corriendo.

---

## 4️⃣ Prueba en el Navegador

### Abrir la Aplicación

1. Abre tu navegador
2. Navega a: **http://localhost:4173**
3. Abre la **Consola de Desarrollador** (F12 o Cmd+Option+I)

### Verificaciones en la Consola

#### ✅ Verificación 1: Sin Errores de Inicialización

**Busca en la consola:**

```
Initializing Flappy Kiro...
AssetLoader: Starting asset loading...
AssetLoader: Loading image: ghostSprite from assets/ghosty.png
AssetLoader: Loading audio: jumpSound from assets/jump.wav
AssetLoader: Loading audio: gameOverSound from assets/game_over.wav
AssetLoader: Successfully loaded image: ghostSprite (32x32)
AssetLoader: Successfully loaded audio: jumpSound
AssetLoader: Successfully loaded audio: gameOverSound
AssetLoader: All assets loaded successfully
Game: Initialized in Menu state
Renderer: Initialized with canvas dimensions 800 x 600
InputSystem: Initialized
Game initialized successfully
```

**NO debes ver:**
- ❌ `Uncaught ReferenceError: Cannot access 'Game' before initialization`
- ❌ `Uncaught TypeError: Cannot read properties of undefined`
- ❌ Cualquier error relacionado con clases no definidas

#### ✅ Verificación 2: Pantalla de Menú

**Debes ver:**
- ✅ Fondo azul cielo (`#87CEEB`)
- ✅ Título "Flappy Kiro" en blanco
- ✅ Botón "Start Game" en verde
- ✅ "High Score: X" debajo del botón

#### ✅ Verificación 3: Inicialización de Audio

**Haz clic en el canvas**

**Busca en la consola:**
```
Initializing audio on first user interaction...
AudioEngine: Web Audio API initialized successfully
AudioEngine: Audio context state: running
AudioEngine: Loading sound (Web Audio): jump from assets/jump.wav
AudioEngine: Loading sound (Web Audio): gameOver from assets/game_over.wav
AudioEngine: Successfully loaded sound: jump (0.XXs)
AudioEngine: Successfully loaded sound: gameOver (0.XXs)
AudioEngine: All sounds loaded successfully
Audio initialized successfully
```

**NO debes ver:**
- ❌ Errores de audio
- ❌ Fallos al cargar sonidos

---

## 5️⃣ Prueba de Funcionalidad

### Jugar una Partida Completa

1. **Haz clic en "Start Game"**
   - ✅ El juego debe iniciar
   - ✅ El fantasma debe aparecer
   - ✅ Los pipes deben empezar a moverse

2. **Haz clic para saltar**
   - ✅ El fantasma debe saltar
   - ✅ Debe sonar el efecto de salto
   - ✅ La física debe funcionar correctamente

3. **Pasa por un pipe**
   - ✅ El score debe incrementar
   - ✅ El número debe aparecer en la parte superior

4. **Colisiona con un pipe o el suelo**
   - ✅ Debe sonar el efecto de game over
   - ✅ Debe aparecer la pantalla de "Game Over"
   - ✅ Debe mostrar el score final
   - ✅ Debe mostrar el high score

5. **Haz clic en "Restart"**
   - ✅ Debe volver al menú
   - ✅ El high score debe persistir

### Verificar en la Consola

**Durante el juego, busca:**
```
Game: Transitioned to Playing state
Game: Transitioned to GameOver state
Game: Transitioned to Menu state
Game: All game systems reset
```

**NO debes ver:**
- ❌ Errores de colisión
- ❌ Errores de física
- ❌ Errores de renderizado
- ❌ Errores de audio

---

## 6️⃣ Prueba de Rendimiento

### Verificar FPS

1. **Durante el juego, presiona la tecla `P`**
   - ✅ Debe aparecer un overlay con estadísticas de rendimiento

2. **Verifica los valores:**
   - ✅ FPS: ~60 (puede variar ligeramente)
   - ✅ Frame Time: ~16-17ms
   - ✅ No debe haber caídas significativas de FPS

3. **Presiona `R` para ver el reporte completo en la consola**

---

## 7️⃣ Prueba en Diferentes Navegadores

### Navegadores a Probar

- ✅ **Chrome/Chromium** (versión reciente)
- ✅ **Firefox** (versión reciente)
- ✅ **Safari** (si estás en macOS)
- ✅ **Edge** (versión reciente)

### Verificación en Cada Navegador

1. Abre http://localhost:4173
2. Verifica que no hay errores en la consola
3. Juega una partida completa
4. Verifica que el audio funciona
5. Verifica que el high score persiste

---

## 8️⃣ Prueba de Persistencia

### Verificar localStorage

1. **Juega y obtén un score**
2. **Abre la consola de desarrollador**
3. **Ve a la pestaña "Application" o "Storage"**
4. **Busca "localStorage"**
5. **Verifica que existe la clave:** `flappyKiroHighScore`
6. **Recarga la página (F5)**
7. **Verifica que el high score persiste**

---

## 9️⃣ Prueba de Assets

### Verificar Carga de Assets

1. **Abre la pestaña "Network" en DevTools**
2. **Recarga la página**
3. **Verifica que se cargan:**
   - ✅ `ghosty.png` (Status: 200)
   - ✅ `jump.wav` (Status: 200)
   - ✅ `game_over.wav` (Status: 200)
   - ✅ `index-XXXXXXXX.js` (Status: 200)

**NO debes ver:**
- ❌ Status 404 (Not Found)
- ❌ Status 500 (Server Error)
- ❌ Errores de CORS

---

## 🔟 Prueba de Despliegue (Opcional)

### Simular Despliegue en Servidor Estático

```bash
# Opción 1: Usar Python
cd dist
python3 -m http.server 8000

# Opción 2: Usar Node.js (http-server)
npx http-server dist -p 8000

# Opción 3: Usar PHP
cd dist
php -S localhost:8000
```

**Luego:**
1. Abre http://localhost:8000
2. Repite todas las verificaciones anteriores

---

## ✅ CHECKLIST FINAL

Marca cada item cuando lo hayas verificado:

- [ ] ✅ Script de verificación pasa (Exit Code 0)
- [ ] ✅ Build de producción completa sin errores
- [ ] ✅ Servidor de preview inicia correctamente
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ Pantalla de menú se muestra correctamente
- [ ] ✅ Audio se inicializa correctamente
- [ ] ✅ El juego inicia al hacer clic en "Start Game"
- [ ] ✅ El fantasma salta al hacer clic
- [ ] ✅ Los pipes se mueven correctamente
- [ ] ✅ El score incrementa al pasar pipes
- [ ] ✅ La colisión funciona correctamente
- [ ] ✅ La pantalla de game over aparece
- [ ] ✅ El botón "Restart" funciona
- [ ] ✅ El high score persiste en localStorage
- [ ] ✅ FPS es estable (~60)
- [ ] ✅ Funciona en Chrome
- [ ] ✅ Funciona en Firefox
- [ ] ✅ Funciona en Safari (si aplica)
- [ ] ✅ Funciona en Edge
- [ ] ✅ Assets se cargan correctamente
- [ ] ✅ No hay errores de red (404, 500, CORS)

---

## 🎯 RESULTADO ESPERADO

Si todos los items del checklist están marcados:

### ✅ EL BUILD DE PRODUCCIÓN ESTÁ FUNCIONANDO CORRECTAMENTE

El error `Uncaught ReferenceError: Cannot access 'Game' before initialization` ha sido **completamente resuelto** y el código está **listo para desplegar en producción**.

---

## 🚨 SI ENCUENTRAS PROBLEMAS

### Problema: El script de verificación falla

**Solución:**
```bash
# Reconstruir el proyecto
npm run build

# Ejecutar el script nuevamente
node verify-production-fix.js
```

### Problema: Errores en la consola del navegador

**Solución:**
1. Verifica que estás usando el build de producción (`npm run preview`)
2. Limpia la caché del navegador (Ctrl+Shift+Delete)
3. Recarga la página con caché limpia (Ctrl+Shift+R)

### Problema: Assets no se cargan (404)

**Solución:**
1. Verifica que los assets existen en `dist/assets/`
2. Verifica que el servidor está sirviendo desde `dist/`
3. Verifica la configuración de `base` en `vite.config.js`

### Problema: Audio no funciona

**Solución:**
1. Verifica que hiciste clic en el canvas (requerido por navegadores)
2. Verifica que los archivos `.wav` existen en `dist/assets/`
3. Verifica la consola para errores de audio

---

## 📞 DOCUMENTACIÓN ADICIONAL

Si necesitas más información:

- **`RESUMEN_AUDITORIA_FINAL.md`** - Reporte completo de auditoría
- **`PRODUCTION_BUILD_FIX.md`** - Documentación técnica detallada
- **`SOLUCION_FINAL.md`** - Explicación visual del problema y solución

---

**Última actualización:** $(date)
**Estado:** ✅ Listo para pruebas
