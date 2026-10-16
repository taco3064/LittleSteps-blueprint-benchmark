import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Clock, Moon, X } from 'lucide-react';
import { useState } from 'react';
import { listItem, stagger } from '~app/platform/components/Motion';
import type { Alert } from '~app/littlesteps/domain/alertEngine';

interface AlertBannerProps {
  alerts: Alert[];
}

// Map icon name strings to actual lucide-react components
const iconMap: Record<string, React.ElementType> = {
  AlertTriangle, AlertOctagon, Clock, Moon,
};

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((alert) => !dismissedIds.has(alert.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => {
          const isDanger = alert.severity === 'danger';
          const bgColor = isDanger ? 'bg-primary-light' : 'bg-butter-light';
          const borderColor = isDanger ? 'border-red-500' : 'border-butter';
          const textColor = isDanger ? 'text-red-800' : 'text-butter-dark';
          const IconComponent = iconMap[alert.icon] || AlertTriangle;

          return (
            <motion.div
              key={alert.id}
              layout
              variants={listItem}
              exit="hidden"
              className={`card border-l-4 ${bgColor} ${borderColor}`}
            >
              <div className="flex items-start gap-3">
                {/* Severity is what this glyph carries, so it stays. */}
                <IconComponent
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textColor}`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className={textColor}>{alert.title}</h4>
                  <p
                    className={`text-xs ${textColor} opacity-80 mt-1 leading-relaxed`}
                  >
                    {alert.message}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className={`btn-icon -my-2.5 ${textColor}`}
                  aria-label="關閉提醒"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
