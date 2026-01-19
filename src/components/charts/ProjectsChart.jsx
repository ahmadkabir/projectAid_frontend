import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProjectsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis 
          dataKey="name" 
          type="category" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          width={120}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="purchases" fill="#0C3968" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProjectsChart;
