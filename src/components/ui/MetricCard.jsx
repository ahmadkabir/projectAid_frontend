import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, accent, change, trend }) => {
  const tint = accent || { bg: 'bg-admin-blue/10', fg: 'text-admin-blue' };

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-admin-muted">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-admin-text mt-1 truncate">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="text-admin-success mr-1" size={16} />
              ) : (
                <TrendingDown className="text-admin-pending mr-1" size={16} />
              )}
              <span className={`text-sm font-semibold ${trend === 'up' ? 'text-admin-success' : 'text-admin-pending'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-admin-muted ml-1.5">vs previous period</span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-xl shrink-0 ${tint.bg}`}>
          <Icon className={tint.fg} size={26} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
