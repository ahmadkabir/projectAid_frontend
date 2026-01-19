import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, color, change, trend }) => {
  return (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-primary-blue">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="text-primary-green mr-1" size={16} />
              ) : (
                <TrendingDown className="text-primary-blue-light mr-1" size={16} />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-primary-green' : 'text-primary-blue-light'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs previous period</span>
            </div>
          )}
        </div>
        <div className={`p-4 ${color} rounded-full bg-opacity-10`}>
          <Icon className={color.replace('bg-', 'text-')} size={32} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
