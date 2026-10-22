import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, accent, change, trend, bar }) => {
  const tint = accent || { bg: 'bg-admin-blue/10', fg: 'text-admin-blue' };
  const barColor = bar || 'from-admin-blue to-admin-blue-hover';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-admin-border bg-white p-5 shadow-[0_16px_40px_-34px_rgba(12,57,104,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_-30px_rgba(12,57,104,0.45)]">
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${barColor}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted">
            {title}
          </p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-admin-text lg:text-3xl">
            {value}
          </p>
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint.bg} ${tint.fg}`}
        >
          <Icon size={20} />
        </span>
      </div>

      {change !== undefined && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
              trend === 'up'
                ? 'bg-admin-success/10 text-admin-success'
                : 'bg-admin-pending/10 text-admin-pending'
            }`}
          >
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change > 0 ? '+' : ''}
            {change}%
          </span>
          <span className="text-[11px] text-admin-muted">vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
