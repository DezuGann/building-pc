export type SocketType = 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
export type MemoryType = 'DDR4' | 'DDR5' | 'DDR4/DDR5';
export type FormFactor = 'ATX' | 'Micro-ATX' | 'Mini-ITX';
export type CaseType = 'mini_tower' | 'mid_tower' | 'full_tower';
export type TierType = 'entry' | 'mid' | 'high' | 'enthusiast';
export type Resolution = '1080p' | '1440p' | '4k';

export interface CPU {
  id: string;
  brand: 'AMD' | 'Intel';
  model: string;
  generation: string;
  socket: SocketType;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  tdpWatts: number;
  maxPowerWatts: number;
  integratedGraphics: boolean;
  memoryType: MemoryType;
  pcieVersion: string;
  cpuScoreSingle: number; // 0-100 normalized IPC / single-core gaming index
  cpuScoreMulti: number;
  tier: TierType;
  priceUsd: number;
}

export interface GPU {
  id: string;
  brand: 'NVIDIA' | 'AMD' | 'Intel';
  model: string;
  chipset: string;
  vramGb: number;
  vramType: string;
  tdpWatts: number;
  lengthMm: number;
  slotWidth: number;
  recommendedPsuWatts: number;
  powerConnectors: string;
  has12Vhpwr: boolean;
  gpuScore1080p: number; // 0-100 normalized
  gpuScore1440p: number;
  gpuScore4k: number;
  tier: TierType;
  priceUsd: number;
}

export interface Motherboard {
  id: string;
  brand: string;
  model: string;
  chipset: string;
  socket: SocketType;
  formFactor: FormFactor;
  memoryType: 'DDR4' | 'DDR5';
  memorySlots: number;
  maxMemoryGb: number;
  m2Slots: number;
  hasWifi: boolean;
  vrmQualityTier: 'A' | 'B' | 'C';
  tdpMaxRecommendedWatts: number;
  priceUsd: number;
}

export interface Cooler {
  id: string;
  brand: string;
  model: string;
  coolingType: 'air' | 'aio_liquid';
  heightMm?: number;
  radiatorSizeMm?: number;
  maxTdpCoolingCapacity: number;
  supportedSockets: SocketType[];
  fanNoiseDb: number;
  priceUsd: number;
}

export interface PowerSupply {
  id: string;
  brand: string;
  model: string;
  wattage: number;
  efficiencyRating: '80+ White' | '80+ Bronze' | '80+ Gold' | '80+ Platinum';
  modularity: 'non-modular' | 'semi-modular' | 'full-modular';
  formFactor: 'ATX' | 'SFX';
  pcie8PinConnectors: number;
  has12VhpwrConnector: boolean;
  priceUsd: number;
}

export interface Case {
  id: string;
  brand: string;
  model: string;
  caseType: CaseType;
  supportedMotherboards: FormFactor[];
  psuFormFactor: 'ATX' | 'SFX';
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  maxRadiatorSizeTopMm: number;
  maxRadiatorSizeFrontMm: number;
  includedFans: number;
  hasTypeCFront: boolean;
  priceUsd: number;
}

export interface RAMModule {
  id: string;
  brand: string;
  model: string;
  memoryType: 'DDR4' | 'DDR5';
  capacityGb: number;
  modulesCount: number;
  speedMhz: number;
  casLatency: number;
  priceUsd: number;
}

export interface StorageDrive {
  id: string;
  brand: string;
  model: string;
  driveType: 'NVMe M.2' | 'SATA SSD' | 'HDD';
  formFactor: 'M.2 2280' | '2.5"' | '3.5"';
  capacityGb: number;
  readSpeedMbps: number;
  writeSpeedMbps: number;
  priceUsd: number;
}

export interface SelectedComponents {
  cpu?: CPU;
  gpu?: GPU;
  motherboard?: Motherboard;
  cooler?: Cooler;
  ram?: RAMModule;
  storage?: StorageDrive;
  storageDrives?: StorageDrive[];
  psu?: PowerSupply;
  caseItem?: Case;
}

export interface BottleneckEvaluation {
  resolution: Resolution;
  percentage: number;
  limitingComponent: 'CPU' | 'GPU' | 'Balanced';
  explanation: string;
  severity: 'optimal' | 'moderate' | 'high';
}

export interface CompatibilityCheck {
  id: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
}

export interface RecommendationReason {
  componentType: string;
  componentName: string;
  shortWhy: string;
  detailedWhy: string;
  tips: string[];
}
