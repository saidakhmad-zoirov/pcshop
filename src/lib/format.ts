// Server va brauzerda bir xil natija bo'lishi uchun Intl ishlatmaymiz (hydration xatosi bo'lmasin)
export const som = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";

export const STATUS: Record<string, string> = {
  new: "Yangi",
  confirmed: "Tasdiqlandi",
  assembling: "Yig'ilmoqda",
  shipped: "Yo'lda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

// Xususiyat nomlarini o'zbekchaga
export const SPEC_LABELS: Record<string, string> = {
  socket: "Soket", cores: "Yadrolar", threads: "Oqimlar", base_ghz: "Bazaviy chastota, GHz",
  boost_ghz: "Turbo chastota, GHz", tdp: "Quvvat (TDP), W", igpu: "O'rnatilgan grafika",
  box_cooler: "Qutida kuler", ram_types: "Xotira turi", chipset: "Chipset", form_factor: "Form-faktor",
  ram_type: "Xotira turi", ram_slots: "Xotira slotlari", max_ram_gb: "Maks. xotira, GB",
  m2_slots: "M.2 slotlar", wifi: "Wi-Fi", type: "Turi", capacity_gb: "Hajmi, GB", modules: "Planklar soni",
  speed: "Tezlik, MT/s", cl: "Kechikish (CL)", chip: "Grafik chip", vram_gb: "Video xotira, GB",
  length_mm: "Uzunligi, mm", recommended_psu: "Tavsiya etilgan blok, W", interface: "Ulanish",
  read_mbs: "O'qish tezligi, MB/s", wattage: "Quvvat, W", efficiency: "Sertifikat", modular: "Modulli",
  form_factors: "Ona plata o'lchamlari", max_gpu_mm: "Maks. videokarta, mm", max_cooler_mm: "Maks. kuler balandligi, mm",
  radiators_mm: "Radiatorlar, mm", sockets: "Soketlar", height_mm: "Balandligi, mm", tdp_rating: "Sovutish quvvati, W",
  radiator_mm: "Radiator, mm", size_inch: "Diagonal, dyuym", resolution: "Ruxsat", refresh_hz: "Chastota, Hz",
  panel: "Matritsa", layout: "Format", connection: "Ulanish", dpi: "DPI", weight_g: "Og'irligi, g",
  mic: "Mikrofon", surround: "Ovoz",
};

export function specValue(v: unknown): string {
  if (typeof v === "boolean") return v ? "Bor" : "Yo'q";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

// Kartochkada ko'rsatiladigan eng muhim 3 ta xususiyat
export const KEY_SPECS: Record<string, string[]> = {
  cpu: ["socket", "cores", "boost_ghz"],
  motherboard: ["socket", "form_factor", "ram_type"],
  ram: ["type", "capacity_gb", "speed"],
  gpu: ["vram_gb", "tdp", "length_mm"],
  storage: ["type", "capacity_gb", "read_mbs"],
  psu: ["wattage", "efficiency"],
  case: ["form_factors", "max_gpu_mm"],
  cooler: ["type", "tdp_rating"],
  monitor: ["size_inch", "resolution", "refresh_hz"],
  keyboard: ["type", "layout"],
  mouse: ["dpi", "connection"],
  headset: ["connection", "surround"],
};
