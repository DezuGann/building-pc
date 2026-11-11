import {
  CPU,
  GPU,
  SelectedComponents,
  BottleneckEvaluation,
  CompatibilityCheck,
  RecommendationReason,
  Resolution,
  Motherboard,
  Cooler,
  PowerSupply,
  Case,
  RAMModule,
  StorageDrive
} from '../types/hardware';
import {
  MOTHERBOARDS_CATALOG,
  COOLERS_CATALOG,
  PSUS_CATALOG,
  CASES_CATALOG,
  RAM_CATALOG,
  STORAGE_CATALOG
} from '../data/hardwareCatalog';

/**
 * Calcula el índice de cuello de botella según la resolución seleccionada (1080p, 1440p, 4K)
 * basado en la capacidad de entrega de fotogramas del CPU vs la demanda raster de la GPU.
 */
export function calculateBottleneck(
  cpu: CPU,
  gpu: GPU,
  resolution: Resolution = '1080p',
  ram?: RAMModule
): BottleneckEvaluation {
  // 1. Capacidad efectiva del procesador en juegos (FPS delivery headroom)
  let effectiveCpuPower = cpu.cpuScoreSingle;

  // Impacto de núcleos e hilos (los motores de juego modernos sufren con menos de 6C/12T)
  if (cpu.cores < 6) {
    effectiveCpuPower *= 0.74; // Penalización severa para CPUs de 4 núcleos en juegos modernos
  } else if (cpu.cores === 6 && cpu.threads === 6) {
    effectiveCpuPower *= 0.86; // 6 núcleos sin multithreading
  } else if (cpu.cores >= 8) {
    effectiveCpuPower *= 1.05; // Headroom para multitarea y motores modernos
  }

  // Bonificación de memoria caché masiva 3D V-Cache (7800X3D, 9800X3D)
  const is3DVcache = cpu.generation.toLowerCase().includes('3d') || cpu.model.includes('X3D');
  if (is3DVcache) {
    effectiveCpuPower *= 1.22; // +22% en estabilidad de frametimes y FPS mínimos
  }

  // Impacto de memoria RAM en el rendimiento del CPU
  if (ram) {
    if (ram.memoryType === 'DDR4' && ram.speedMhz <= 3000) {
      effectiveCpuPower *= 0.94;
    } else if (ram.memoryType === 'DDR5' && ram.speedMhz >= 6000) {
      effectiveCpuPower *= 1.05;
    }
  }

  // 2. Demanda del CPU impuesta por la GPU según la resolución
  // A 1080p: La GPU genera cuadros muy rápido -> La CPU debe alimentar cientos de frames por segundo
  // A 1440p (2K): Hay 78% más píxeles -> La GPU tarda más por frame, desahogando al procesador
  // A 4K: Hay 400% más píxeles (8.3M) -> La GPU está casi siempre al 99-100%, la CPU requiere menos esfuerzo
  let targetDemand = 0;
  if (resolution === '1080p') {
    targetDemand = gpu.gpuScore1080p * 1.04;
  } else if (resolution === '1440p') {
    targetDemand = gpu.gpuScore1440p * 0.88;
  } else {
    // 4K
    targetDemand = gpu.gpuScore4k * 0.68;
  }

  // 3. Ratio de equilibrio: Capacidad del CPU vs Demanda de la GPU
  const ratio = effectiveCpuPower / targetDemand;
  let percentage = 0;
  let limitingComponent: 'CPU' | 'GPU' | 'Balanced' = 'Balanced';
  let severity: 'optimal' | 'moderate' | 'high' = 'optimal';
  let explanation = '';

  if (ratio < 0.88) {
    // Cuello de botella por CPU: La gráfica es demasiado rápida para este procesador
    percentage = Math.min(Math.round((1 - ratio) * 100), 65);
    limitingComponent = 'CPU';
    if (percentage > 22) {
      severity = 'high';
      explanation = `En ${resolution.toUpperCase()}, la ${gpu.model} está fuertemente limitada por el ${cpu.model}. El procesador llegará al 100% provocando caídas de FPS e impidiendo que la GPU entregue todo su potencial.`;
    } else {
      severity = 'moderate';
      explanation = `En ${resolution.toUpperCase()}, la ${gpu.model} es muy potente y el ${cpu.model} podría limitar sus cuadros por segundo máximos en juegos competitivos.`;
    }
    if (resolution === '4k') {
      explanation += ` En 4K el impacto se mitiga porque casi toda la carga recae en los 8.3 millones de píxeles.`;
    }
  } else if (ratio > 1.25) {
    // Limitado por GPU (GPU Bound): El estado más deseable en gaming
    percentage = Math.min(Math.round(((ratio - 1) / ratio) * 45), 30);
    limitingComponent = 'GPU';
    severity = 'optimal';
    explanation = `Comportamiento gaming ideal: El ${cpu.model} alimenta con holgura a la ${gpu.model}, la cual rendirá al 99%-100% de su capacidad sin micro-tirones.`;
  } else {
    // Balance Óptimo (entre 0.88 y 1.25)
    percentage = Math.max(1, Math.round(Math.abs(1 - ratio) * 35));
    limitingComponent = 'Balanced';
    severity = 'optimal';
    explanation = `Excelente equilibrio para jugar a ${resolution.toUpperCase()}. Tanto el ${cpu.model} como la ${gpu.model} operan en perfecta sincronía sin limitarse mutuamente.`;
  }

  return {
    resolution,
    percentage,
    limitingComponent,
    explanation,
    severity
  };
}

/**
 * Calcula los vatios totales y la fuente recomendada
 */
export function calculatePowerMetrics(components: SelectedComponents) {
  const cpuWatts = components.cpu ? (components.cpu.maxPowerWatts || components.cpu.tdpWatts) : 0;
  const gpuWatts = components.gpu ? components.gpu.tdpWatts : 0;
  const systemBaseWatts = 65; // Placa base, ventiladores, RAM, SSD, periféricos USB

  const totalEstimatedWatts = cpuWatts + gpuWatts + (components.cpu || components.gpu ? systemBaseWatts : 0);
  const recommendedPsuWatts = Math.ceil((totalEstimatedWatts * 1.30) / 50) * 50; // Margen de seguridad del 30% redondeado a 50W

  return {
    cpuWatts,
    gpuWatts,
    systemBaseWatts: components.cpu || components.gpu ? systemBaseWatts : 0,
    totalEstimatedWatts,
    recommendedPsuWatts: Math.max(recommendedPsuWatts, 500)
  };
}

/**
 * Valida todas las compatibilidades físicas y eléctricas
 */
export function validateCompatibility(components: SelectedComponents): CompatibilityCheck[] {
  const checks: CompatibilityCheck[] = [];

  // 1. Socket CPU vs Placa
  if (components.cpu && components.motherboard) {
    const isSocketMatch = components.cpu.socket === components.motherboard.socket;
    checks.push({
      id: 'socket',
      title: 'Compatibilidad de Socket (CPU y Placa)',
      status: isSocketMatch ? 'passed' : 'failed',
      details: isSocketMatch
        ? `Correcto: Tanto el procesador como la placa utilizan el socket ${components.cpu.socket}.`
        : `Incompatible: El procesador requiere socket ${components.cpu.socket}, pero la placa seleccionada tiene socket ${components.motherboard.socket}.`
    });
  }

  // 2. Tipo de Memoria RAM vs Placa
  if (components.ram && components.motherboard) {
    const isRamMatch = components.ram.memoryType === components.motherboard.memoryType;
    checks.push({
      id: 'ram',
      title: 'Tipo de Memoria RAM (DDR4 vs DDR5)',
      status: isRamMatch ? 'passed' : 'failed',
      details: isRamMatch
        ? `Correcto: La placa y la memoria RAM son estándar ${components.ram.memoryType}.`
        : `Incompatible: La placa madre solo acepta memoria ${components.motherboard.memoryType}, pero has seleccionado módulos ${components.ram.memoryType}.`
    });
  }

  // 3. Disipación Térmica
  if (components.cpu && components.cooler) {
    const maxCpuHeat = components.cpu.maxPowerWatts || components.cpu.tdpWatts;
    const coolerCapacity = components.cooler.maxTdpCoolingCapacity;
    const isCoolerOk = coolerCapacity >= maxCpuHeat;
    checks.push({
      id: 'cooler-tdp',
      title: 'Capacidad Térmica del Disipador',
      status: isCoolerOk ? 'passed' : 'warning',
      details: isCoolerOk
        ? `Suficiente: El disipador evacúa hasta ${coolerCapacity}W, enfriando holgadamente los ${maxCpuHeat}W en pico del procesador.`
        : `Atención: El procesador puede generar picos de ${maxCpuHeat}W y el disipador soporta hasta ${coolerCapacity}W. Podrías experimentar altas temperaturas.`
    });
  }

  // 4. Espacio físico: Largo de GPU vs Gabinete
  if (components.gpu && components.caseItem) {
    const isLengthOk = components.gpu.lengthMm <= components.caseItem.maxGpuLengthMm;
    checks.push({
      id: 'gpu-clearance',
      title: 'Dimensiones físicas: GPU en Gabinete',
      status: isLengthOk ? 'passed' : 'failed',
      details: isLengthOk
        ? `Entra sin problemas: La tarjeta mide ${components.gpu.lengthMm}mm y el gabinete admite tarjetas de hasta ${components.caseItem.maxGpuLengthMm}mm.`
        : `No entra físicamente: La tarjeta gráfica mide ${components.gpu.lengthMm}mm y excede los ${components.caseItem.maxGpuLengthMm}mm máximos del gabinete.`
    });
  }

  // 5. Espacio físico: Altura de Disipador de Aire vs Gabinete
  if (components.cooler && components.caseItem && components.cooler.coolingType === 'air' && components.cooler.heightMm) {
    const isHeightOk = components.cooler.heightMm <= components.caseItem.maxCoolerHeightMm;
    checks.push({
      id: 'cooler-clearance',
      title: 'Altura del Disipador vs Gabinete',
      status: isHeightOk ? 'passed' : 'failed',
      details: isHeightOk
        ? `Espacio libre adecuado: El disipador mide ${components.cooler.heightMm}mm de alto y el gabinete permite hasta ${components.caseItem.maxCoolerHeightMm}mm.`
        : `La tapa no cerrará: El disipador mide ${components.cooler.heightMm}mm de altura y el gabinete solo admite disipadores de hasta ${components.caseItem.maxCoolerHeightMm}mm.`
    });
  }

  // 6. Factor de forma de Placa vs Gabinete
  if (components.motherboard && components.caseItem) {
    const isFormFactorOk = components.caseItem.supportedMotherboards.includes(components.motherboard.formFactor);
    checks.push({
      id: 'mb-formfactor',
      title: 'Factor de Forma: Placa en Gabinete',
      status: isFormFactorOk ? 'passed' : 'failed',
      details: isFormFactorOk
        ? `Compatible: El gabinete acepta placas con formato ${components.motherboard.formFactor}.`
        : `Incompatible: El gabinete no tiene los postes de anclaje para placas de formato ${components.motherboard.formFactor}.`
    });
  }

  // 7. Potencia y Conectores de Fuente de Poder
  if (components.psu && (components.cpu || components.gpu)) {
    const { recommendedPsuWatts } = calculatePowerMetrics(components);
    const isWattsOk = components.psu.wattage >= recommendedPsuWatts;
    checks.push({
      id: 'psu-power',
      title: 'Capacidad de la Fuente de Poder (PSU)',
      status: isWattsOk ? 'passed' : 'warning',
      details: isWattsOk
        ? `Capacidad óptima: Tienes una fuente de ${components.psu.wattage}W para una demanda recomendada de ${recommendedPsuWatts}W (incluyendo 30% de reserva).`
        : `Fuente insuficiente o ajustada: Se recomienda una fuente de al menos ${recommendedPsuWatts}W, y la seleccionada es de ${components.psu.wattage}W.`
    });

    if (components.gpu?.has12Vhpwr && !components.psu.has12VhpwrConnector) {
      checks.push({
        id: 'psu-connector',
        title: 'Conector de Alimentación PCIe 12VHPWR',
        status: 'warning',
        details: 'Tu GPU utiliza el conector moderno de 16 pines (12VHPWR). La fuente elegida no lo incluye de forma nativa, por lo que requerirás usar el adaptador que viene en la caja de la tarjeta.'
      });
    }
  }

  return checks;
}

/**
 * MOTOR DE RECOMENDACIÓN ASISTIDA (Dado CPU y GPU seleccionados)
 */
export function generateAssistedBuild(cpu: CPU, gpu: GPU): {
  recommended: {
    motherboard: Motherboard;
    cooler: Cooler;
    psu: PowerSupply;
    caseItem: Case;
    ram: RAMModule;
    storage: StorageDrive;
  };
  reasons: RecommendationReason[];
} {
  // 1. Placa Madre: Compatible con Socket CPU, buen balance de tier
  const compatibleMotherboards = MOTHERBOARDS_CATALOG.filter(mb => mb.socket === cpu.socket);
  let motherboard = compatibleMotherboards.find(mb => mb.vrmQualityTier === (cpu.tier === 'high' ? 'A' : 'B')) || compatibleMotherboards[0];

  // 2. RAM: Compatible con el tipo de memoria de la placa
  const compatibleRam = RAM_CATALOG.filter(r => r.memoryType === motherboard.memoryType);
  let ram = compatibleRam.find(r => (cpu.tier === 'high' ? r.capacityGb >= 32 : r.capacityGb >= 16)) || compatibleRam[0];

  // 3. Disipador: Debe enfriar el maxPowerWatts del CPU
  const cpuHeat = cpu.maxPowerWatts || cpu.tdpWatts;
  const compatibleCoolers = COOLERS_CATALOG.filter(
    c => c.supportedSockets.includes(cpu.socket) && c.maxTdpCoolingCapacity >= cpuHeat
  );
  let cooler = compatibleCoolers[0];
  if (cpuHeat > 180) {
    cooler = COOLERS_CATALOG.find(c => c.coolingType === 'aio_liquid') || compatibleCoolers[compatibleCoolers.length - 1];
  } else if (cpuHeat > 100) {
    cooler = COOLERS_CATALOG.find(c => c.id === 'cooler-peerless-120') || compatibleCoolers[0];
  }

  // 4. Fuente de Poder: Capaz de cubrir (CPU + GPU + 65) * 1.3
  const neededWatts = (cpuHeat + gpu.tdpWatts + 65) * 1.30;
  let psu = PSUS_CATALOG.find(p => p.wattage >= neededWatts && (gpu.has12Vhpwr ? p.has12VhpwrConnector : true)) 
    || PSUS_CATALOG.find(p => p.wattage >= neededWatts) 
    || PSUS_CATALOG[PSUS_CATALOG.length - 1];

  // 5. Gabinete: Debe soportar el largo de GPU, la placa y la altura del cooler
  const compatibleCases = CASES_CATALOG.filter(cs => {
    const supportsMb = cs.supportedMotherboards.includes(motherboard.formFactor);
    const fitsGpu = cs.maxGpuLengthMm >= gpu.lengthMm + 20; // 20mm margen
    const fitsCooler = cooler.coolingType === 'air' 
      ? cs.maxCoolerHeightMm >= (cooler.heightMm || 155) 
      : (cooler.radiatorSizeMm ? cs.maxRadiatorSizeTopMm >= cooler.radiatorSizeMm || cs.maxRadiatorSizeFrontMm >= cooler.radiatorSizeMm : true);
    return supportsMb && fitsGpu && fitsCooler;
  });
  let caseItem = compatibleCases[0] || CASES_CATALOG[0];

  // 6. Almacenamiento: 1TB o 2TB NVMe según gama
  let storage = cpu.tier === 'high' || gpu.tier === 'high' || gpu.tier === 'enthusiast' 
    ? STORAGE_CATALOG[1] 
    : STORAGE_CATALOG[0];

  // Justificaciones pedagógicas ("¿Por qué te recomendamos esto?")
  const reasons: RecommendationReason[] = [
    {
      componentType: 'Placa Madre',
      componentName: `${motherboard.brand} ${motherboard.model}`,
      shortWhy: `Socket ${motherboard.socket} y soporte nativo para ${motherboard.memoryType}.`,
      detailedWhy: `Para tu procesador ${cpu.model}, seleccionamos esta placa con chipset ${motherboard.chipset}. Cuenta con fases de alimentación de calidad ${motherboard.vrmQualityTier} que garantizan estabilidad sin gastar de más en gamas extremas innecesarias.`,
      tips: [
        `Incluye conectividad WiFi y ranuras M.2 para almacenamiento de alta velocidad.`,
        `Diseñada para el estándar de memoria ${motherboard.memoryType}.`
      ]
    },
    {
      componentType: 'Disipador Térmico',
      componentName: `${cooler.brand} ${cooler.model}`,
      shortWhy: `Capacidad de ${cooler.maxTdpCoolingCapacity}W para disipar los ${cpuHeat}W del CPU.`,
      detailedWhy: `Tu procesador ${cpu.model} genera hasta ${cpuHeat}W de calor bajo carga pesada. Este ${cooler.coolingType === 'aio_liquid' ? 'sistema de refrigeración líquida' : 'disipador de aire'} mantiene las temperaturas por debajo de los 75°C de forma silenciosa.`,
      tips: [
        cooler.coolingType === 'aio_liquid' 
          ? 'Refrigeración líquida ideal para mantener frecuencias Boost prolongadas.'
          : 'Doble torre de cobre silenciosa con prácticamente cero mantenimiento a largo plazo.'
      ]
    },
    {
      componentType: 'Fuente de Poder (PSU)',
      componentName: `${psu.brand} ${psu.model}`,
      shortWhy: `${psu.wattage}W con certificación ${psu.efficiencyRating} y modularidad.`,
      detailedWhy: `El consumo máximo estimado de tu CPU (${cpuHeat}W) más tu GPU (${gpu.tdpWatts}W) y periféricos es de aprox. ${Math.round(cpuHeat + gpu.tdpWatts + 65)}W. Una fuente de ${psu.wattage}W garantiza trabajar en el rango del 50-70% de carga, donde la eficiencia eléctrica es máxima y el ventilador apenas suena.`,
      tips: [
        gpu.has12Vhpwr && psu.has12VhpwrConnector 
          ? 'Posee el conector nativo PCIe 5.0 (12VHPWR) para tu GPU moderna.'
          : 'Certificación 80+ para menor desperdicio de energía y menor calor generado.'
      ]
    },
    {
      componentType: 'Gabinete (Case)',
      componentName: `${caseItem.brand} ${caseItem.model}`,
      shortWhy: `Espacio de ${caseItem.maxGpuLengthMm}mm para GPU y excelente flujo de aire mesh.`,
      detailedWhy: `Tu tarjeta gráfica ${gpu.model} mide ${gpu.lengthMm}mm. Este gabinete ofrece ${caseItem.maxGpuLengthMm}mm de espacio, dejando amplio margen para ventilación frontal y montaje cómodo de cables.`,
      tips: [
        `Incluye ${caseItem.includedFans} ventiladores de fábrica y panel frontal mallado para baja temperatura.`,
        `Compatible con el factor de forma ${motherboard.formFactor} de tu placa madre.`
      ]
    },
    {
      componentType: 'Memoria RAM',
      componentName: `${ram.brand} ${ram.model}`,
      shortWhy: `${ram.capacityGb}GB (${ram.modulesCount} módulos) a ${ram.speedMhz}MHz.`,
      detailedWhy: `Recomendamos un kit de 2 módulos para activar la tecnología Dual Channel (duplicando el ancho de banda hacia el procesador). Con ${ram.capacityGb}GB tienes fluidez total para gaming moderno, navegación y multitarea.`,
      tips: [`Frecuencia optimizada para la arquitectura de tu procesador.`]
    },
    {
      componentType: 'Almacenamiento SSD',
      componentName: `${storage.brand} ${storage.model}`,
      shortWhy: `${storage.capacityGb / 1000}TB NVMe M.2 a ${storage.readSpeedMbps} MB/s.`,
      detailedWhy: `Las unidades NVMe M.2 se conectan directamente a la placa madre sin cables molestos. Permiten encender Windows en 6 segundos y cargar juegos casi instantáneamente.`,
      tips: [`Velocidad PCIe de última generación.`]
    }
  ];

  return {
    recommended: {
      motherboard,
      cooler,
      psu,
      caseItem,
      ram,
      storage
    },
    reasons
  };
}
