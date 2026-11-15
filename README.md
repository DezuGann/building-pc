# 🖥️ PC Builder 3D — Simulador & Diagnóstico Inteligente

Plataforma web interactiva para el diseño, configuración y validación en tiempo real de computadoras de alto rendimiento. Integra un **Visor 3D WebGL acelerado por hardware a 60 FPS**, un motor matemático de compatibilidad física/eléctrica y un sistema de ensamble asistido.

---

## ✨ Características Principales

### 🎮 Visor 3D Neón Studio (Three.js)
* **Modelado y Renderizado en Tiempo Real:** Visualización a 60 FPS con chasis metálico personalizable (*Mini Tower, Mid Tower, Full Tower*).
* **Presets de Cámara y Desmontaje:** Vistas isométrica, frontal e interior; opción para desmontar disipador térmico (*Cooler*) e inspección de sockets de placa madre, slots DDR5 y puertos M.2 NVMe.
* **Inspección de Hardware (Raytracing & Tooltips):** Detección dinámica al pasar el cursor sobre CPU, GPU, RAM, placa y fuente de poder con métricas de rendimiento.

### ⚡ Motor Matemático de Compatibilidad & Diagnóstico
* **Detección de Cuello de Botella (*Bottleneck*):** Evaluación gráfica de equilibrio entre CPU y GPU en resoluciones **1080p**, **1440p** y **4K**.
* **Balance Energético:** Cálculo instantáneo de consumo TDP en picos con recomendación de potencia en watts y holgura de seguridad (+30%).
* **Validación Física & Mecánica:** Chequeo estricto de dimensiones (largo de GPU vs gabinete, alto de disipador vs ancho de chasis, sockets compatibles, memorias DDR4/DDR5).
* **Alertas Flotantes de Incompatibilidad:** Notificaciones emergentes automáticas en rojo neón con auto-desvanecimiento al detectar incompatibilidades críticas de ensamble.

### 📱 Experiencia Móvil Optimizada
* **Diseño Táctil Responsivo:** Interfaz adaptativa con carrusel deslizable (*swipe*) de pruebas rápidas, barra compacta de herramientas 3D y navegación móvil organizada por pestañas (*Visor 3D*, *Piezas*, *Diagnóstico*).

### 🚀 Despliegue Continuo (CI/CD)
* **Automatización con Vercel:** Publicación 24/7 en la nube conectada a la rama `main` de GitHub. Actualización instantánea en vivo ante cada cambio mediante el script `deploy.ps1`.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Renderizado 3D:** [Three.js](https://threejs.org/) + OrbitControls
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Bundler:** [Vite](https://vitejs.dev/)
* **Iconografía:** [Lucide React](https://lucide.dev/)

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── components/         # Componentes de UI, Visor 3D, Cards de Diagnóstico y Alertas
│   │   ├── PCViewer3D.tsx              # Visor 3D con Three.js a 60 FPS
│   │   ├── AtmosphereBackground.tsx    # Fondo fluido de niebla metálica optimizado
│   │   ├── ComponentDropdowns.tsx      # Selector dinámico de los 8 componentes
│   │   ├── CompatibilityList.tsx       # Lista de verificación física y eléctrica
│   │   ├── IncompatibilityToast.tsx    # Ventanas emergentes de alerta roja
│   │   ├── BottleneckCard.tsx          # Medidor y diagnóstico de cuello de botella
│   │   ├── PowerCard.tsx               # Cálculo de fuentes y demanda energética
│   │   ├── CaseAdvisor.tsx             # Recomendador de gabinete según componentes
│   │   ├── AssistedMode.tsx            # Equipos prearmados con explicación pedagógica
│   │   ├── Header.tsx                  # Barra de navegación principal
│   │   └── SkeletonCockpit.tsx         # Pantalla de carga tipo esqueleto animado
│   ├── data/
│   │   └── hardwareCatalog.ts          # Catálogo con especificaciones de mercado real
│   ├── services/
│   │   ├── engine.ts                   # Algoritmos de compatibilidad y cuello de botella
│   │   └── pricingService.ts           # Servicio y normalización de precios
│   └── types/
│       └── hardware.ts                 # Definiciones de tipos e interfaces TypeScript
├── deploy.ps1              # Script de despliegue automático a GitHub y Vercel
├── index.html              # Punto de entrada HTML
├── package.json            # Dependencias y scripts de ejecución
├── tsconfig.json           # Configuración de compilación TypeScript
└── vite.config.ts          # Configuración del servidor y empaquetador Vite
```

---

## 💻 Comandos del Proyecto

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:3000
npm run dev
```

### Compilación para Producción
```bash
# Validar tipos TypeScript y compilar a la carpeta /dist
npm run build
```

### Despliegue a Producción (GitHub & Vercel)
```powershell
# Ejecutar en PowerShell para subir cambios automáticamente a la nube
.\deploy.ps1 "Descripción del cambio"
```
