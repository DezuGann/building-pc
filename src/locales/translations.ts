export type Language = 'es' | 'en';

export type TranslationSchema = Record<keyof typeof TRANSLATIONS['es'], string>;

export const TRANSLATIONS = {
  es: {
    // Header & Brand
    brandName: 'PC Builder',
    modeWorkshop: 'Taller 3D',
    modePrebuilt: 'Equipos Armados',
    backToPrebuilt: 'Ir a Equipos Armados',

    // Hero Section
    heroBadge: 'TECNOLOGÍA DE VANGUARDIA • SIMULADOR 3D 60 FPS',
    heroTitlePrefix: 'ARMA LA PC DE',
    heroTitleHighlight: 'TUS SUEÑOS',
    heroTitleSuffix: 'EN TIEMPO REAL',
    heroDescription: 'Diseña tu próxima estación de batalla a tu gusto. Elige tus piezas favoritas, pruébalas en 3D y nosotros nos encargamos de que todo funcione en perfecta armonía.',
    heroCTAStart: 'Explorar Ensamble 3D',
    heroCTAPrebuilt: 'Ver Equipos Armados',
    heroStatsFPS: '60 FPS',
    heroStatsFPSDesc: 'Gráficos fluidos al instante',
    heroStatsAccuracy: '100%',
    heroStatsAccuracyDesc: 'Compatibilidad garantizada',
    heroStatsCatalog: '8/8',
    heroStatsCatalogDesc: 'Precios reales de tienda',

    // Showcase Ribbon
    showcaseTitle: 'COMPONENTES DE ÚLTIMA GENERACIÓN',
    showcaseSubtitle: 'Arquitecturas Zen 5, Blackwell RTX 50, memorias DDR5 de alta frecuencia y almacenamiento Gen5.',

    // Quick Test Toolbar
    quickTestsLabel: 'Pruebas:',
    scenarioBudget: '💵 Económico',
    scenarioBalanced: '🔥 Gama Media',
    scenarioExtreme: '⚡ Gama Alta',
    scenarioTitan: '👑 Titán 4K',
    scenarioBottleneck: '⚠️ Cuello Botella',
    resolutionLabel: 'Resolución:',

    // Component Dropdowns Section
    configHeader: 'Configurar Componentes',
    partsCount: 'Piezas',
    btnReset: 'Reiniciar',
    btnAutoComplete: 'Auto-completar',
    btnSelectPart: 'Seleccionar...',
    btnChangePart: 'Cambiar',
    btnRemovePart: 'Quitar',
    btnAddExtraStorage: '+ Agregar Unidad Extra (M.2 / SATA)',

    // Categories
    catCpu: 'PROCESADOR (CPU)',
    catMobo: 'PLACA MADRE',
    catGpu: 'TARJETA GRÁFICA (GPU)',
    catRam: 'MEMORIA RAM',
    catStorage: 'ALMACENAMIENTO',
    catPsu: 'FUENTE DE PODER (PSU)',
    catCooler: 'DISIPADOR (COOLER)',
    catCase: 'GABINETE / CHASIS',

    // 3D Viewer Toolbar
    viewerTitle: 'Visor 3D Neón Studio',
    presetIso: 'Isométrica',
    presetMobo: 'Placa & Sockets',
    presetInterior: 'Interior',
    presetFront: 'Frontal',
    toggleCooler: 'Cooler',
    toggleCoolerDismounted: 'Cooler Desmontado',
    toggleGlass: 'Vidrio',
    toggleGlassOpen: 'Vidrio Abierto',
    resetCamera: 'Restablecer posición',
    estimatedBudget: 'Presupuesto Estimado',
    btnClear: 'Limpiar Todo',
    btnCopyConfig: 'Copiar Configuración',
    btnCopied: '¡Copiado!',

    // Mobile Navigation
    tab3D: 'Visor 3D',
    tabParts: 'Piezas',
    tabDiagnostics: 'Diagnóstico',
    tabAll: 'Todo',

    // Diagnostics & Advisor Section
    diagnosticsSectionTitle: 'Centro de Diagnóstico & Balance Técnico',
    diagnosticsSectionSubtitle: 'Monitoreo dinámico de cuello de botella, telemetría energética y compatibilidad física.',
    caseAdvisorTitle: 'Asesor de Gabinete Recomendado',
    recommendedBadge: 'Recomendado para tu ensamble',
    bottleneckTitle: 'Evaluación de Cuello de Botella',
    powerTitle: 'Demanda Energética & Fuente Recomendada',
    compatibilityTitle: 'Validación de Compatibilidad',
    criticalIncompatibilityToast: 'Incompatibilidad Crítica',
    noBuildWarning: 'No Ensamblar',
    optimalBuild: '100% Compatible y Balanceado'
  },
  en: {
    // Header & Brand
    brandName: 'PC Builder',
    modeWorkshop: '3D Workshop',
    modePrebuilt: 'Prebuilt PCs',
    backToPrebuilt: 'Go to Prebuilts',

    // Hero Section
    heroBadge: 'CUTTING-EDGE TECH • 60 FPS 3D SIMULATOR',
    heroTitlePrefix: 'BUILD YOUR',
    heroTitleHighlight: 'DREAM PC',
    heroTitleSuffix: 'IN REAL-TIME',
    heroDescription: 'Build your dream battle station your way. Choose your favorite components, test them in 3D, and let us make sure everything runs in perfect harmony.',
    heroCTAStart: 'Explore 3D Build',
    heroCTAPrebuilt: 'Browse Prebuilt PCs',
    heroStatsFPS: '60 FPS',
    heroStatsFPSDesc: 'Instant smooth visuals',
    heroStatsAccuracy: '100%',
    heroStatsAccuracyDesc: 'Guaranteed compatibility',
    heroStatsCatalog: '8/8',
    heroStatsCatalogDesc: 'Real-time retail pricing',

    // Showcase Ribbon
    showcaseTitle: 'NEXT-GENERATION HARDWARE',
    showcaseSubtitle: 'Zen 5 architectures, Blackwell RTX 50 series, high-frequency DDR5, and Gen5 NVMe storage.',

    // Quick Test Toolbar
    quickTestsLabel: 'Presets:',
    scenarioBudget: '💵 Budget',
    scenarioBalanced: '🔥 Mid-Range',
    scenarioExtreme: '⚡ High-End',
    scenarioTitan: '👑 4K Titan',
    scenarioBottleneck: '⚠️ Bottleneck Test',
    resolutionLabel: 'Target Res:',

    // Component Dropdowns Section
    configHeader: 'Configure Components',
    partsCount: 'Parts',
    btnReset: 'Reset',
    btnAutoComplete: 'Auto-complete',
    btnSelectPart: 'Select part...',
    btnChangePart: 'Change',
    btnRemovePart: 'Remove',
    btnAddExtraStorage: '+ Add Extra Drive (M.2 / SATA)',

    // Categories
    catCpu: 'PROCESSOR (CPU)',
    catMobo: 'MOTHERBOARD',
    catGpu: 'GRAPHICS CARD (GPU)',
    catRam: 'RAM MEMORY',
    catStorage: 'STORAGE DRIVE',
    catPsu: 'POWER SUPPLY (PSU)',
    catCooler: 'CPU COOLER',
    catCase: 'CHASSIS / CASE',

    // 3D Viewer Toolbar
    viewerTitle: 'Neon Studio 3D Viewer',
    presetIso: 'Isometric',
    presetMobo: 'Board & Sockets',
    presetInterior: 'Interior',
    presetFront: 'Front',
    toggleCooler: 'Cooler',
    toggleCoolerDismounted: 'Cooler Dismounted',
    toggleGlass: 'Glass',
    toggleGlassOpen: 'Glass Opened',
    resetCamera: 'Reset camera view',
    estimatedBudget: 'Estimated Budget',
    btnClear: 'Clear All',
    btnCopyConfig: 'Copy Build',
    btnCopied: 'Copied!',

    // Mobile Navigation
    tab3D: '3D Viewer',
    tabParts: 'Parts',
    tabDiagnostics: 'Diagnostics',
    tabAll: 'All Sections',

    // Diagnostics & Advisor Section
    diagnosticsSectionTitle: 'Diagnostic Center & Technical Balance',
    diagnosticsSectionSubtitle: 'Real-time bottleneck telemetry, power demand calculations, and mechanical compatibility checks.',
    caseAdvisorTitle: 'Recommended Case Advisor',
    recommendedBadge: 'Recommended for your build',
    bottleneckTitle: 'Bottleneck Assessment',
    powerTitle: 'Power Demand & Recommended PSU',
    compatibilityTitle: 'Compatibility Validation',
    criticalIncompatibilityToast: 'Critical Incompatibility',
    noBuildWarning: 'Do Not Assemble',
    optimalBuild: '100% Compatible & Balanced'
  }
} as const;

export type TranslationKeys = keyof typeof TRANSLATIONS['es'];

