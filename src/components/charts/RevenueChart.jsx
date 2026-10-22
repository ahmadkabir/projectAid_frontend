import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 4" stroke="#EEF2F7" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          dy={8}
        />
        <YAxis
          stroke="#9CA3AF"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={72}
          tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 12px 30px -12px rgba(12,57,104,0.25)'
          }}
          formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#1188C9"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
