import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OrdersChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(12,57,104,0.04)' }}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 12px 30px -12px rgba(12,57,104,0.25)'
          }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="orders" fill="#1188C9" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="completed" fill="#82C53A" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OrdersChart;
