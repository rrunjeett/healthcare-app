"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Plus,
  Heart,
  Scale,
  Activity,
  Thermometer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  getHealthMetrics,
  addHealthMetric,
  getLatestMetric,
  type HealthMetric,
} from "@/lib/health-data";

interface VitalForm {
  type: HealthMetric['type'];
  value: string;
  date: string;
  time: string;
}

const vitalTypes: Array<{
  value: HealthMetric['type'];
  label: string;
  unit: string;
  color: string;
  icon: any;
  normalRange: { min: number; max: number };
  description: string;
}> = [
  {
    value: 'weight',
    label: 'Weight',
    unit: 'kg',
    color: '#10B981',
    icon: Scale,
    normalRange: { min: 50, max: 100 },
    description: 'Body weight measurement'
  },
  {
    value: 'blood_pressure_systolic',
    label: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    color: '#EF4444',
    icon: Heart,
    normalRange: { min: 90, max: 120 },
    description: 'Upper blood pressure reading'
  },
  {
    value: 'blood_pressure_diastolic',
    label: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    color: '#F59E0B',
    icon: Heart,
    normalRange: { min: 60, max: 80 },
    description: 'Lower blood pressure reading'
  },
  {
    value: 'heart_rate',
    label: 'Heart Rate',
    unit: 'bpm',
    color: '#EF4444',
    icon: Activity,
    normalRange: { min: 60, max: 100 },
    description: 'Resting heart rate'
  },
  {
    value: 'steps',
    label: 'Daily Steps',
    unit: 'steps',
    color: '#3B82F6',
    icon: Activity,
    normalRange: { min: 8000, max: 15000 },
    description: 'Steps taken per day'
  },
  {
    value: 'sleep_hours',
    label: 'Sleep Duration',
    unit: 'hours',
    color: '#8B5CF6',
    icon: Activity,
    normalRange: { min: 7, max: 9 },
    description: 'Hours of sleep per night'
  },
  {
    value: 'water_intake',
    label: 'Water Intake',
    unit: 'L',
    color: '#06B6D4',
    icon: Activity,
    normalRange: { min: 2, max: 4 },
    description: 'Daily water consumption'
  },
];

export default function VitalsPage() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedVital, setSelectedVital] = useState<HealthMetric['type']>('weight');
  const [form, setForm] = useState<VitalForm>({
    type: 'weight',
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    setMetrics(getHealthMetrics());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.value) return;

    const vitalType = vitalTypes.find(v => v.value === form.type);
    addHealthMetric({
      type: form.type,
      value: parseFloat(form.value),
      unit: vitalType?.unit || '',
      date: form.date,
    });

    setForm({
      type: 'weight',
      value: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    });
    setShowForm(false);
    loadMetrics();
  };

  // Prepare chart data for selected vital
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      day: format(date, 'MMM dd'),
      date: format(date, 'yyyy-MM-dd'),
    };
  });

  const selectedVitalData = last30Days.map(day => {
    const dayMetrics = metrics.filter(m => 
      m.type === selectedVital && m.date === day.date
    );
    const avgValue = dayMetrics.length > 0 
      ? dayMetrics.reduce((sum, m) => sum + m.value, 0) / dayMetrics.length 
      : null;
    
    return {
      day: day.day,
      value: avgValue,
    };
  }).filter(item => item.value !== null);

  // Get latest readings for each vital
  const latestReadings = vitalTypes.map(vital => {
    const latest = getLatestMetric(vital.value);
    const isInRange = latest 
      ? latest.value >= vital.normalRange.min && latest.value <= vital.normalRange.max
      : null;
    
    return {
      ...vital,
      latest: latest?.value || 0,
      date: latest?.date || '',
      isInRange,
      trend: calculateTrend(vital.value),
    };
  });

  function calculateTrend(type: HealthMetric['type']): number {
    const recentMetrics = metrics
      .filter(m => m.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
    
    if (recentMetrics.length < 2) return 0;
    
    const recent = recentMetrics.slice(0, Math.ceil(recentMetrics.length / 2));
    const older = recentMetrics.slice(Math.ceil(recentMetrics.length / 2));
    
    const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  const selectedVitalType = vitalTypes.find(v => v.value === selectedVital);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Health Vitals
              </h1>
              <p className="text-gray-300">
                Monitor your vital signs and health metrics
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors mt-4 md:mt-0"
            >
              <Plus className="h-5 w-5" />
              <span>Record Vital</span>
            </button>
          </div>
        </motion.div>

        {/* Vital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {latestReadings.map((vital, index) => {
            const Icon = vital.icon;
            return (
              <motion.div
                key={vital.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                onClick={() => setSelectedVital(vital.value)}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-8 w-8`} style={{ color: vital.color }} />
                  <div className="flex items-center space-x-2">
                    {vital.isInRange === true && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    {vital.isInRange === false && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    {vital.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : vital.trend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    ) : null}
                  </div>
                </div>
                
                <h3 className="text-gray-300 text-sm font-medium mb-1">{vital.label}</h3>
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-bold text-white">
                    {vital.latest ? vital.latest.toFixed(1) : '--'}
                  </span>
                  <span className="text-gray-400 text-sm">{vital.unit}</span>
                </div>
                
                {vital.latest > 0 && (
                  <div className="text-xs text-gray-400">
                    {vital.date && format(new Date(vital.date), 'MMM dd')}
                    {vital.trend !== 0 && (
                      <span className={`ml-2 ${vital.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {vital.trend > 0 ? '+' : ''}{vital.trend.toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}
                
                {/* Normal range indicator */}
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        vital.isInRange ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: vital.latest 
                          ? `${Math.min(100, (vital.latest / vital.normalRange.max) * 100)}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{vital.normalRange.min}</span>
                    <span>Normal</span>
                    <span>{vital.normalRange.max}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Vital Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">
              {selectedVitalType?.label} Trend (Last 30 Days)
            </h2>
            
            <select
              value={selectedVital}
              onChange={(e) => setSelectedVital(e.target.value as HealthMetric['type'])}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {vitalTypes.map(vital => (
                <option key={vital.value} value={vital.value}>{vital.label}</option>
              ))}
            </select>
          </div>

          {selectedVitalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={selectedVitalData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedVitalType?.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={selectedVitalType?.color} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(1)} ${selectedVitalType?.unit}`,
                    selectedVitalType?.label
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={selectedVitalType?.color}
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                />
                
                {/* Normal range lines */}
                <Line 
                  type="monotone" 
                  dataKey={() => selectedVitalType?.normalRange.min}
                  stroke="#10B981" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey={() => selectedVitalType?.normalRange.max}
                  stroke="#10B981" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No data for {selectedVitalType?.label}</p>
                <p className="text-gray-500">Start recording your vitals to see trends</p>
              </div>
            </div>
          )}
          
          {/* Normal range legend */}
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Normal Range</span>
                </div>
                <span className="text-gray-400">
                  {selectedVitalType?.normalRange.min} - {selectedVitalType?.normalRange.max} {selectedVitalType?.unit}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{selectedVitalType?.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Readings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Recent Readings</h2>
          
          <div className="space-y-4">
            {metrics
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((metric, index) => {
                const vitalType = vitalTypes.find(v => v.value === metric.type);
                const Icon = vitalType?.icon || Activity;
                const isInRange = vitalType 
                  ? metric.value >= vitalType.normalRange.min && metric.value <= vitalType.normalRange.max
                  : true;
                
                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center space-x-4">
                      <Icon className="h-6 w-6" style={{ color: vitalType?.color }} />
                      <div>
                        <h3 className="text-white font-medium">{vitalType?.label}</h3>
                        <p className="text-gray-400 text-sm">
                          {format(new Date(metric.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center space-x-3">
                      <div>
                        <p className="text-white font-semibold">
                          {metric.value.toFixed(1)} {metric.unit}
                        </p>
                        {vitalType && (
                          <p className="text-xs text-gray-400">
                            Normal: {vitalType.normalRange.min}-{vitalType.normalRange.max}
                          </p>
                        )}
                      </div>
                      {isInRange ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            
            {metrics.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No vitals recorded yet</p>
                <p className="text-gray-500">Start tracking your health metrics!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Vital Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-600"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Record Health Vital</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vital Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as HealthMetric['type'] })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  {vitalTypes.map(vital => (
                    <option key={vital.value} value={vital.value}>
                      {vital.label} ({vital.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Value
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder={`Enter ${vitalTypes.find(v => v.value === form.type)?.label.toLowerCase()}`}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Normal range: {vitalTypes.find(v => v.value === form.type)?.normalRange.min} - {vitalTypes.find(v => v.value === form.type)?.normalRange.max} {vitalTypes.find(v => v.value === form.type)?.unit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Record Vital
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}