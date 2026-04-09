"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import KeyHeatmap from '@/components/KeyHeatmap';

interface AnalyticsDatum {
  accuracy: number;
  date: string;
  lessons: number;
  sessions: number;
  time: number;
  wpm: number;
}

interface AnalyticsDashboardProps {
  data: AnalyticsDatum[];
  heatmapData: Record<string, number>;
}

export default function AnalyticsDashboard({ data, heatmapData }: AnalyticsDashboardProps) {
  return (
    <>
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div className="h-72 rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="mb-2 text-sm font-medium text-gray-300">WPM Trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid stroke="#2d2d2f" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#757575" tick={{ fontSize: 10 }} />
              <YAxis stroke="#757575" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1c', border: 'none' }} labelStyle={{ color: '#a3a3a3' }} />
              <Line type="monotone" dataKey="wpm" stroke="#6396f3" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="mb-2 text-sm font-medium text-gray-300">Accuracy Trend</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid stroke="#2d2d2f" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#757575" tick={{ fontSize: 10 }} />
              <YAxis stroke="#757575" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1c', border: 'none' }} labelStyle={{ color: '#a3a3a3' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#8fbff7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-100">Key Error Heatmap (Demo)</h2>
        <p className="mb-4 text-sm text-gray-400">
          Keys with more mistakes are tinted warmer. This example uses random data to illustrate
          how a heatmap could be displayed. Future versions will aggregate real session
          error statistics to highlight your weakest keys.
        </p>
        <KeyHeatmap data={heatmapData} />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div className="h-72 rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="mb-2 text-sm font-medium text-gray-300">Time Practiced (mins)</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid stroke="#2d2d2f" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#757575" tick={{ fontSize: 10 }} />
              <YAxis stroke="#757575" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1c', border: 'none' }} labelStyle={{ color: '#a3a3a3' }} />
              <Bar dataKey="time" fill="#3a6edc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="mb-2 text-sm font-medium text-gray-300">Lessons & Sessions</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid stroke="#2d2d2f" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#757575" tick={{ fontSize: 10 }} />
              <YAxis stroke="#757575" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1c', border: 'none' }} labelStyle={{ color: '#a3a3a3' }} />
              <Bar dataKey="lessons" fill="#8fbff7" name="Lessons" />
              <Bar dataKey="sessions" fill="#6396f3" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
