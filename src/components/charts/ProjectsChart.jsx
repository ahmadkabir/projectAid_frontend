import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProjectsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="4 4" stroke="#EEF2F7" horizontal={false} />
        <XAxis
          type="number"
          stroke="#9CA3AF"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          allowDecimals={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          stroke="#9CA3AF"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={110}
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
        <Bar dataKey="purchases" fill="#0C3968" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProjectsChart;
