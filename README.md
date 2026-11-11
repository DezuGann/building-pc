# 🖥️ PC Builder Asistido & Diagnóstico Inteligente

Sistema web interactivo para el armado de computadoras personales enfocado en la simplicidad, accesibilidad pedagógica y validaciones técnicas rigurosas (cuello de botella, holguras físicas y balance energético).

---

## 📚 Documentación del Proyecto

* 📋 **[Plan de Trabajo Completo](docs/PLAN_DE_TRABAJO.md)**: Hoja de ruta estratégica, fases de desarrollo (Fases 1 a 6) y objetivos.
* 🗄️ **[Diseño de Base de Datos y Motor Matemático](docs/DISENO_BD_Y_COMPATIBILIDAD.md)**: Diagramas entidad-relación, reglas de validación física y fórmulas de cuello de botella (*bottleneck*).
* 💾 **[Script SQL de la Base de Datos](database/schema.sql)**: Definición DDL de las tablas, claves primarias, claves foráneas e índices.

---

## ⚡ Modos de Funcionamiento

1. **Modo Asistido (Para Principiantes):**
   * El usuario selecciona **Procesador (CPU)** y **Tarjeta Gráfica (GPU)**.
   * El sistema autocompleta el resto del ensamble (Motherboard, Cooler, Fuente, Gabinete, RAM, SSD).
   * Cada componente sugerido incluye la sección interactiva **"¿Por qué te recomendamos esto?"** con explicaciones comprensibles sin tecnicismos excesivos.

2. **Modo Libre (Personalizado):**
   * Selección manual de cualquiera de los componentes.
   * Diagnóstico inmediato de compatibilidad física (largo de GPU, alto de disipador, factor de forma de placa).

3. **Panel de Diagnóstico Matemático en Tiempo Real:**
   * **Cuello de Botella:** Cálculo dinámico con selector de resolución (1080p, 1440p, 4K).
   * **Demanda Energética:** Cálculo de watts máximos en pico y fuente recomendada (+30% de reserva).
   * **Lista de Verificación de Compatibilidad:** Alertas en verde, amarillo y rojo.
   * **Casos Tipo:** Botones de carga rápida para probar casos económicos, equilibrados, gama alta y cuellos de botella deliberados.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** React 18 + TypeScript + Vite
* **Estilos:** Tailwind CSS
* **Iconografía:** Lucide React
* **Arquitectura:** Modular (`src/services/engine.ts`, `src/data/hardwareCatalog.ts`, `src/types/hardware.ts`)

---

## 🚀 Comandos del Proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción
npm run build
```
