import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mood Trend Line Chart
export const MoodTrendChart = ({ data, darkMode }) => {
  const COLORS = {
    line: darkMode ? '#a855f7' : '#9333ea',
    grid: darkMode ? '#334155' : '#e2e8f0'
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis 
          dataKey="date" 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          domain={[0, 5]}
          ticks={[1, 2, 3, 4, 5]}
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            color: darkMode ? '#ffffff' : '#000000'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="mood" 
          stroke={COLORS.line} 
          strokeWidth={3}
          dot={{ fill: COLORS.line, r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Focus Sessions Bar Chart
export const FocusSessionsChart = ({ data, darkMode }) => {
  const COLORS = {
    bar: darkMode ? '#a855f7' : '#9333ea',
    grid: darkMode ? '#334155' : '#e2e8f0'
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis 
          dataKey="date" 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            color: darkMode ? '#ffffff' : '#000000'
          }}
        />
        <Legend />
        <Bar dataKey="duration" fill={COLORS.bar} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Content Category Pie Chart
export const ContentCategoryChart = ({ data, darkMode }) => {
  const COLORS = ['#10b981', '#a855f7', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            color: darkMode ? '#ffffff' : '#000000'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Platform Usage Bar Chart
export const PlatformUsageChart = ({ data, darkMode }) => {
  const COLORS = ['#a855f7', '#ec4899', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
        <XAxis 
          type="number" 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
          width={100}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            color: darkMode ? '#ffffff' : '#000000'
          }}
        />
        <Bar dataKey="time" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Weekly Activity Chart
export const WeeklyActivityChart = ({ data, darkMode }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
        <XAxis 
          dataKey="day" 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke={darkMode ? '#94a3b8' : '#64748b'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            color: darkMode ? '#ffffff' : '#000000'
          }}
        />
        <Legend />
        <Bar dataKey="focusTime" fill="#a855f7" name="Focus Time" radius={[8, 8, 0, 0]} />
        <Bar dataKey="screenTime" fill="#ec4899" name="Screen Time" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};