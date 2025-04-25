import { useMemo } from 'react';
import { Measurement } from '../../types/measurement';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material';

interface MeasurementHistoryChartProps {
  measurements: Measurement[];
}

const MeasurementHistoryChart = ({ measurements }: MeasurementHistoryChartProps) => {
  const theme = useTheme();

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!measurements.length) return [];

    // Sort measurements by date (oldest first)
    const sortedMeasurements = [...measurements].sort(
      (a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime()
    );

    return sortedMeasurements.map((measurement) => {
      return {
        date: new Date(measurement.dateTaken).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        chest: measurement.chest,
        waist: measurement.waist,
        hips: measurement.hips,
        // Add more measurements as needed
      };
    });
  }, [measurements]);

  // Define the lines to show in the chart
  const keyMeasurements = [
    { key: 'chest', name: 'Chest', color: theme.palette.primary.main },
    { key: 'waist', name: 'Waist', color: theme.palette.secondary.main },
    { key: 'hips', name: 'Hips', color: theme.palette.info.main },
  ];

  if (measurements.length < 2) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Add more measurements to see trends over time.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          label={{
            value: measurements[0]?.units === 'cm' ? 'Centimeters' : 'Inches',
            angle: -90,
            position: 'insideLeft'
          }}
        />
        <Tooltip
          formatter={(value, name) => [`${value} ${measurements[0]?.units}`, name]}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        />
        <Legend />
        {keyMeasurements.map((measurement) => (
          <Line
            key={measurement.key}
            type="monotone"
            dataKey={measurement.key}
            name={measurement.name}
            stroke={measurement.color}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MeasurementHistoryChart;