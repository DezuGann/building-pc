-- ==============================================================================
-- Schema inicial para el Sistema de Armado de PC (Building-PC)
-- Compatible con SQLite y PostgreSQL (usando tipos estándar)
-- ==============================================================================

-- 1. PROCESADORES (CPUs)
CREATE TABLE IF NOT EXISTS cpus (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(20) NOT NULL,              -- 'AMD', 'Intel'
    model VARCHAR(100) NOT NULL,            -- ej. 'Ryzen 5 7600', 'Core i5-14600K'
    generation VARCHAR(50),                 -- ej. 'Ryzen 7000', '14th Gen Raptor Lake'
    socket VARCHAR(30) NOT NULL,            -- ej. 'AM5', 'LGA1700', 'AM4'
    cores INT NOT NULL,
    threads INT NOT NULL,
    base_clock_ghz DECIMAL(3,2),
    boost_clock_ghz DECIMAL(3,2),
    tdp_watts INT NOT NULL,                 -- Consumo térmico base de diseño
    max_power_watts INT,                    -- Consumo en pico (PL2 / PPT)
    integrated_graphics BOOLEAN DEFAULT FALSE,
    memory_type VARCHAR(20) NOT NULL,       -- 'DDR4', 'DDR5', 'DDR4/DDR5'
    pcie_version VARCHAR(10) DEFAULT '4.0', -- '4.0', '5.0'
    cpu_score_single INT NOT NULL,          -- Puntuación relativa mono-núcleo (para cuello de botella)
    cpu_score_multi INT NOT NULL,           -- Puntuación relativa multi-núcleo
    tier VARCHAR(20) NOT NULL,              -- 'entry', 'mid', 'high', 'enthusiast'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TARJETAS GRÁFICAS (GPUs)
CREATE TABLE IF NOT EXISTS gpus (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(20) NOT NULL,              -- 'NVIDIA', 'AMD', 'Intel'
    model VARCHAR(100) NOT NULL,            -- ej. 'GeForce RTX 4070 Super', 'Radeon RX 7800 XT'
    chipset VARCHAR(50) NOT NULL,           -- 'RTX 4070 Super', 'RX 7800 XT'
    vram_gb INT NOT NULL,                   -- Capacidad de memoria VRAM (ej. 12, 16)
    vram_type VARCHAR(20) DEFAULT 'GDDR6X', -- 'GDDR6', 'GDDR6X'
    tdp_watts INT NOT NULL,                 -- Consumo típico de la tarjeta (TBP)
    length_mm INT NOT NULL,                 -- Longitud física en milímetros (para choque con gabinete)
    slot_width DECIMAL(2,1) DEFAULT 2.0,    -- Espacio que ocupa en ranuras (2.0, 2.5, 3.0 slots)
    recommended_psu_watts INT NOT NULL,     -- Potencia de fuente mínima recomendada por fabricante
    power_connectors VARCHAR(50) NOT NULL,  -- '1x8-pin', '2x8-pin', '1x16-pin (12VHPWR)'
    gpu_score_1080p INT NOT NULL,           -- Puntuación de rendimiento relativo en 1080p
    gpu_score_1440p INT NOT NULL,           -- Puntuación de rendimiento relativo en 1440p
    gpu_score_4k INT NOT NULL,              -- Puntuación de rendimiento relativo en 4K
    tier VARCHAR(20) NOT NULL,              -- 'entry', 'mid', 'high', 'enthusiast'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PLACAS MADRE (MOTHERBOARDS)
CREATE TABLE IF NOT EXISTS motherboards (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,             -- 'ASUS', 'MSI', 'Gigabyte', 'ASRock'
    model VARCHAR(100) NOT NULL,           -- ej. 'B650 Gaming Plus WiFi'
    chipset VARCHAR(30) NOT NULL,           -- 'B650', 'X670', 'B760', 'Z790'
    socket VARCHAR(30) NOT NULL,            -- 'AM5', 'LGA1700', 'AM4'
    form_factor VARCHAR(20) NOT NULL,       -- 'ATX', 'Micro-ATX', 'Mini-ITX'
    memory_type VARCHAR(10) NOT NULL,       -- 'DDR4' o 'DDR5'
    memory_slots INT DEFAULT 4,             -- Cantidad de ranuras DIMM
    max_memory_gb INT DEFAULT 128,          -- Límite soportado
    m2_slots INT DEFAULT 2,                 -- Cantidad de ranuras NVMe M.2
    pcie_slot_version VARCHAR(10) DEFAULT '4.0', -- '4.0', '5.0'
    has_wifi BOOLEAN DEFAULT FALSE,
    vrm_quality_tier VARCHAR(10) DEFAULT 'B', -- 'A' (Alta gama / Overclock), 'B' (Media), 'C' (Entrada)
    tdp_max_recommended_watts INT DEFAULT 150, -- Límite de TDP de CPU recomendado para sus fases de poder
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DISIPADORES (COOLERS)
CREATE TABLE IF NOT EXISTS coolers (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,           -- ej. 'Peerless Assassin 120 SE', 'Kraken 240'
    cooling_type VARCHAR(20) NOT NULL,      -- 'air' (aire) o 'aio_liquid' (líquida)
    height_mm INT,                          -- Altura del disipador de aire (para evaluar con gabinete)
    radiator_size_mm INT,                   -- 120, 240, 280, 360 (para refrigeración líquida)
    max_tdp_cooling_capacity INT NOT NULL,  -- Vatios máximos de calor que disipa eficientemente
    supported_sockets TEXT NOT NULL,        -- Lista de sockets soportados separados por comas: 'AM4,AM5,LGA1700'
    fan_noise_db DECIMAL(4,1),              -- Nivel sonoro máx
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. FUENTES DE PODER (POWER SUPPLIES - PSU)
CREATE TABLE IF NOT EXISTS power_supplies (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,             -- 'Corsair', 'Seasonic', 'EVGA', 'MSI'
    model VARCHAR(100) NOT NULL,           -- ej. 'RM750e'
    wattage INT NOT NULL,                   -- Potencia total (ej. 550, 650, 750, 850, 1000)
    efficiency_rating VARCHAR(20) NOT NULL, -- '80+ Bronze', '80+ Gold', '80+ Platinum'
    modularity VARCHAR(20) NOT NULL,        -- 'non-modular', 'semi-modular', 'full-modular'
    form_factor VARCHAR(10) DEFAULT 'ATX',  -- 'ATX', 'SFX'
    pcie_8pin_connectors INT DEFAULT 2,     -- Cantidad de conectores 6+2 pines
    has_12vhpwr_connector BOOLEAN DEFAULT FALSE, -- Conector nativo PCIe 5.0 (16 pines)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. GABINETES (CASES)
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,           -- ej. 'NZXT H5 Flow', 'Lian Li Lancool 216'
    supported_motherboards TEXT NOT NULL,   -- 'ATX,Micro-ATX,Mini-ITX'
    psu_form_factor VARCHAR(10) DEFAULT 'ATX', -- 'ATX' o 'SFX'
    max_gpu_length_mm INT NOT NULL,         -- Longitud máxima permitida para GPU
    max_cooler_height_mm INT NOT NULL,      -- Altura máxima para cooler de aire
    max_radiator_size_top_mm INT DEFAULT 240, -- Tamaño máximo de radiador soportado arriba
    max_radiator_size_front_mm INT DEFAULT 360, -- Tamaño máximo de radiador frontal
    included_fans INT DEFAULT 2,
    has_type_c_front BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. MEMORIA RAM (RAM MODULES)
CREATE TABLE IF NOT EXISTS ram_modules (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,           -- ej. 'Fury Beast 32GB (2x16GB)'
    memory_type VARCHAR(10) NOT NULL,       -- 'DDR4' o 'DDR5'
    capacity_gb INT NOT NULL,               -- Capacidad total en GB (ej. 16, 32, 64)
    modules_count INT NOT NULL,             -- Número de módulos en el kit (ej. 2 para 2x16GB)
    speed_mhz INT NOT NULL,                 -- Frecuencia (ej. 3200, 3600, 6000)
    cas_latency INT NOT NULL,               -- CL (ej. 16, 18, 30, 36)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ALMACENAMIENTO (STORAGE DRIVES)
CREATE TABLE IF NOT EXISTS storage_drives (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,           -- ej. 'Kingston NV2 1TB', 'Samsung 990 Pro 2TB'
    drive_type VARCHAR(20) NOT NULL,        -- 'NVMe M.2', 'SATA SSD 2.5', 'HDD 3.5'
    form_factor VARCHAR(20) NOT NULL,       -- 'M.2 2280', '2.5"', '3.5"'
    capacity_gb INT NOT NULL,               -- Capacidad en GB (ej. 1000, 2000)
    read_speed_mbps INT,                    -- Velocidad lectura (ej. 3500, 7450)
    write_speed_mbps INT,                   -- Velocidad escritura
    pcie_generation VARCHAR(10) DEFAULT '4.0', -- '3.0', '4.0', '5.0'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ENSAMBLES / CONFIGURACIONES (BUILDS)
-- Diseñado listo para asociar usuarios a futuro (user_id opcional/nullable)
CREATE TABLE IF NOT EXISTS builds (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),                    -- Opcional para cuando se implemente autenticación
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Componentes seleccionados
    cpu_id VARCHAR(50) REFERENCES cpus(id),
    gpu_id VARCHAR(50) REFERENCES gpus(id),
    motherboard_id VARCHAR(50) REFERENCES motherboards(id),
    cooler_id VARCHAR(50) REFERENCES coolers(id),
    psu_id VARCHAR(50) REFERENCES power_supplies(id),
    case_id VARCHAR(50) REFERENCES cases(id),
    ram_id VARCHAR(50) REFERENCES ram_modules(id),
    storage_id VARCHAR(50) REFERENCES storage_drives(id),

    -- Métricas calculadas por el sistema
    total_estimated_watts INT,              -- Watts totales calculados
    bottleneck_percentage DECIMAL(5,2),     -- Porcentaje de cuello de botella estimado
    bottleneck_component VARCHAR(20),       -- 'CPU', 'GPU' o 'Balanced'
    compatibility_status VARCHAR(20) DEFAULT 'valid', -- 'valid', 'warning', 'incompatible'
    compatibility_notes TEXT,               -- Explicaciones / alertas generadas
    
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. ÍNDICES DE RENDIMIENTO PARA CONSULTAS
CREATE INDEX IF NOT EXISTS idx_cpus_socket ON cpus(socket);
CREATE INDEX IF NOT EXISTS idx_motherboards_socket ON motherboards(socket);
CREATE INDEX IF NOT EXISTS idx_motherboards_mem_type ON motherboards(memory_type);
CREATE INDEX IF NOT EXISTS idx_ram_mem_type ON ram_modules(memory_type);
CREATE INDEX IF NOT EXISTS idx_gpus_length ON gpus(length_mm);
CREATE INDEX IF NOT EXISTS idx_psu_wattage ON power_supplies(wattage);
