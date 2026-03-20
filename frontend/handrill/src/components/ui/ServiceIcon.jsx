import { Wrench, Zap, Sparkles, Wind, Hammer, PaintBucket, ShieldCheck, Settings } from 'lucide-react';

const ICON_MAP = {
  Wrench,
  Zap,
  Sparkles,
  Wind,
  Hammer,
  PaintBucket,
  ShieldCheck,
  Settings,
};

export default function ServiceIcon({ name, size = 20, className = '', style = {} }) {
  const IconComponent = ICON_MAP[name] || Settings;
  return <IconComponent size={size} className={className} style={style} />;
}
