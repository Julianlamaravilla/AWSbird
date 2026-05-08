#!/bin/bash

# Script de Verificación del Build de Producción
# Este script verifica que el build de producción funcione correctamente

echo "🔍 Verificando Build de Producción de Flappy Kiro..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes de éxito
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Función para imprimir mensajes de error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Función para imprimir mensajes de advertencia
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Verificar que node_modules existe
echo "1. Verificando dependencias..."
if [ -d "node_modules" ]; then
    success "node_modules encontrado"
else
    error "node_modules no encontrado"
    echo "   Ejecutando: npm install"
    npm install
fi
echo ""

# 2. Limpiar build anterior
echo "2. Limpiando build anterior..."
if [ -d "dist" ]; then
    rm -rf dist
    success "Directorio dist eliminado"
else
    warning "No hay build anterior para limpiar"
fi
echo ""

# 3. Ejecutar build
echo "3. Ejecutando build de producción..."
npm run build
if [ $? -eq 0 ]; then
    success "Build completado exitosamente"
else
    error "Build falló"
    exit 1
fi
echo ""

# 4. Verificar archivos generados
echo "4. Verificando archivos generados..."
if [ -f "dist/index.html" ]; then
    success "dist/index.html existe"
else
    error "dist/index.html no encontrado"
    exit 1
fi

if [ -d "dist/assets" ]; then
    success "dist/assets/ existe"
    
    # Contar archivos JS
    js_count=$(find dist/assets -name "*.js" | wc -l)
    if [ $js_count -gt 0 ]; then
        success "Encontrados $js_count archivo(s) JavaScript"
    else
        error "No se encontraron archivos JavaScript"
        exit 1
    fi
    
    # Verificar que existen los assets de audio e imagen
    if [ -f "dist/assets/ghosty.png" ] || [ -f "assets/ghosty.png" ]; then
        success "Sprite ghosty.png encontrado"
    else
        warning "ghosty.png no encontrado en dist/assets"
    fi
    
    if [ -f "dist/assets/jump.wav" ] || [ -f "assets/jump.wav" ]; then
        success "Audio jump.wav encontrado"
    else
        warning "jump.wav no encontrado en dist/assets"
    fi
    
    if [ -f "dist/assets/game_over.wav" ] || [ -f "assets/game_over.wav" ]; then
        success "Audio game_over.wav encontrado"
    else
        warning "game_over.wav no encontrado en dist/assets"
    fi
else
    error "dist/assets/ no encontrado"
    exit 1
fi
echo ""

# 5. Verificar contenido del HTML
echo "5. Verificando contenido del HTML..."
if grep -q "type=\"module\"" dist/index.html; then
    success "Script cargado como módulo ES6"
else
    error "Script no está marcado como módulo"
    exit 1
fi

if grep -q "crossorigin" dist/index.html; then
    success "Atributo crossorigin presente"
else
    warning "Atributo crossorigin no encontrado (puede causar problemas con CORS)"
fi
echo ""

# 6. Verificar tamaño del bundle
echo "6. Verificando tamaño del bundle..."
js_file=$(find dist/assets -name "index-*.js" | head -n 1)
if [ -f "$js_file" ]; then
    size=$(du -h "$js_file" | cut -f1)
    success "Bundle JavaScript: $size"
    
    # Verificar que el tamaño sea razonable (menos de 100KB)
    size_bytes=$(stat -f%z "$js_file" 2>/dev/null || stat -c%s "$js_file" 2>/dev/null)
    if [ $size_bytes -lt 102400 ]; then
        success "Tamaño del bundle es óptimo (< 100KB)"
    else
        warning "Bundle es grande (> 100KB), considerar optimización"
    fi
else
    error "No se encontró el archivo JavaScript del bundle"
    exit 1
fi
echo ""

# 7. Verificar que no hay errores de sintaxis en el bundle
echo "7. Verificando sintaxis del bundle..."
if node -c "$js_file" 2>/dev/null; then
    success "Sintaxis del bundle es válida"
else
    error "Errores de sintaxis en el bundle"
    exit 1
fi
echo ""

# 8. Buscar posibles problemas en el código
echo "8. Buscando posibles problemas..."

# Buscar referencias a 'undefined' que podrían causar problemas
if grep -q "typeof.*undefined" "$js_file"; then
    success "Verificaciones de 'undefined' encontradas (buena práctica)"
fi

# Buscar uso de DOMContentLoaded
if grep -q "DOMContentLoaded" "$js_file"; then
    success "Uso de DOMContentLoaded encontrado"
else
    warning "DOMContentLoaded no encontrado en el bundle"
fi
echo ""

# 9. Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
success "Build de producción verificado exitosamente"
echo ""
echo "📦 Archivos listos para despliegue en: ./dist/"
echo ""
echo "Próximos pasos:"
echo "  1. Probar localmente: npm run preview"
echo "  2. Subir archivos de dist/ a AWS S3"
echo "  3. Invalidar caché de CloudFront"
echo "  4. Verificar en navegador (modo incógnito)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
