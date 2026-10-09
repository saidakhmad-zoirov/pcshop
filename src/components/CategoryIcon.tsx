import {
  Box, CircuitBoard, Cpu, Fan, HardDrive, Headphones, Keyboard, MemoryStick, Monitor, Mouse, PcCase, Plug, Gamepad2,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  cpu: Cpu, circuit: CircuitBoard, memory: MemoryStick, gpu: Gamepad2, drive: HardDrive, power: Plug,
  case: PcCase, fan: Fan, monitor: Monitor, keyboard: Keyboard, mouse: Mouse, headphones: Headphones,
};

// Turkum slug'idan ikonka
const BY_SLUG: Record<string, string> = {
  cpu: "cpu", motherboard: "circuit", ram: "memory", gpu: "gpu", storage: "drive", psu: "power",
  case: "case", cooler: "fan", monitor: "monitor", keyboard: "keyboard", mouse: "mouse", headset: "headphones",
};

export default function CategoryIcon({ name, slug, className }: { name?: string; slug?: string; className?: string }) {
  const Icon = ICONS[name ?? BY_SLUG[slug ?? ""] ?? ""] ?? Box;
  return <Icon className={className} aria-hidden strokeWidth={1.6} />;
}
