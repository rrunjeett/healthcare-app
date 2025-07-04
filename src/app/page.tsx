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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Plus,
  Play,
  Zap,
  Moon,
  Droplets,
  Scale,
} from "lucide-react";
import {
  getHealthMetrics,
  getTodaysActivities,
  getTodaysNutrition,
  getGoals,
  generateSampleData,
  getLatestMetric,
  addHealthMetric,
  addActivity,
  type HealthMetric,
  type Activity as ActivityType,
  type Goal,
} from "@/lib/health-data";

interface DashboardCard {
  title: string;
  value: string;
  unit: string;
  icon: any;
  color: string;
  trend?: number;
}

interface QuickActionModal {
  isOpen: boolean;
  type: 'metric' | 'activity' | null;
}

export default function Dashboard() {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [todaysActivities, setTodaysActivities] = useState<ActivityType[]>([]);
  const [todaysNutrition, setTodaysNutrition] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [quickAction, setQuickAction] = useState<QuickActionModal>({ isOpen: false, type: null });
  const [newMetricValue, setNewMetricValue] = useState('');
  const [selectedMetricType, setSelectedMetricType] = useState<HealthMetric['type']>('weight');

  useEffect(() => {
    // Initialize with sample data if no data exists
    const existingMetrics = getHealthMetrics();
    if (existingMetrics.length === 0) {
      generateSampleData();
    }
    
    loadData();
  }, []);

  const loadData = () => {
    setHealthMetrics(getHealthMetrics());
    setTodaysActivities(getTodaysActivities());
    setTodaysNutrition(getTodaysNutrition());
    setGoals(getGoals());
  };

  const handleAddMetric = () => {
    if (!newMetricValue) return;
    
    const units: Record<HealthMetric['type'], string> = {
      weight: 'kg',
      steps: 'steps',
      sleep_hours: 'hours',
      water_intake: 'L',
      heart_rate: 'bpm',
      blood_pressure_systolic: 'mmHg',
      blood_pressure_diastolic: 'mmHg',
      calories_burned: 'cal'
    };

    addHealthMetric({
      date: new Date().toISOString().split('T')[0],
      type: selectedMetricType,
      value: parseFloat(newMetricValue),
      unit: units[selectedMetricType]
    });

    setNewMetricValue('');
    setQuickAction({ isOpen: false, type: null });
    loadData();
  };

  const handleAddQuickActivity = (type: ActivityType['type'], duration: number, calories: number) => {
    addActivity({
      date: new Date().toISOString().split('T')[0],
      type,
      duration,
      calories
    });
    setQuickAction({ isOpen: false, type: null });
    loadData();
  };

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, 'MMM dd');
  });

  const weightData = last7Days.map(day => {
    const dayMetrics = healthMetrics.filter(m => 
      m.type === 'weight' && format(new Date(m.date), 'MMM dd') === day
    );
    return {
      day,
      weight: dayMetrics.length > 0 ? dayMetrics[0].value : 0
    };
  });

  const stepsData = last7Days.map(day => {
    const dayMetrics = healthMetrics.filter(m => 
      m.type === 'steps' && format(new Date(m.date), 'MMM dd') === day
    );
    return {
      day,
      steps: dayMetrics.length > 0 ? dayMetrics[0].value : 0
    };
  });

  const nutritionSummary = todaysNutrition.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const macroData = [
    { name: 'Protein', value: nutritionSummary.protein, color: '#10B981' },
    { name: 'Carbs', value: nutritionSummary.carbs, color: '#3B82F6' },
    { name: 'Fat', value: nutritionSummary.fat, color: '#F59E0B' },
  ];

  // Dashboard cards data
  const dashboardCards: DashboardCard[] = [
    {
      title: 'Steps Today',
      value: getLatestMetric('steps')?.value.toLocaleString() || '0',
      unit: 'steps',
      icon: Activity,
      color: 'text-blue-400',
      trend: 5.2
    },
    {
      title: 'Current Weight',
      value: getLatestMetric('weight')?.value.toFixed(1) || '0',
      unit: 'kg',
      icon: Scale,
      color: 'text-green-400',
      trend: -2.1
    },
    {
      title: 'Sleep Last Night',
      value: getLatestMetric('sleep_hours')?.value.toFixed(1) || '0',
      unit: 'hours',
      icon: Moon,
      color: 'text-purple-400',
      trend: 8.3
    },
    {
      title: 'Water Intake',
      value: getLatestMetric('water_intake')?.value.toFixed(1) || '0',
      unit: 'L',
      icon: Droplets,
      color: 'text-cyan-400',
      trend: 12.5
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Health Dashboard
          </h1>
          <p className="text-gray-300">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setQuickAction({ isOpen: true, type: 'metric' })}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Metric</span>
            </button>
            <button
              onClick={() => setQuickAction({ isOpen: true, type: 'activity' })}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Log Activity</span>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <card.icon className={`h-8 w-8 ${card.color}`} />
                <div className="flex items-center space-x-1">
                  {card.trend && card.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${card.trend && card.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {card.trend && Math.abs(card.trend)}%
                  </span>
                </div>
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-1">{card.title}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                <span className="text-gray-400 text-sm">{card.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weight Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Weight Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightData}>
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
                />
                <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Steps Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Daily Steps</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stepsData}>
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
                />
                <Bar dataKey="steps" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Nutrition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Today's Nutrition</h2>
            <div className="mb-4">
              <p className="text-2xl font-bold text-white">{nutritionSummary.calories.toFixed(0)}</p>
              <p className="text-gray-300 text-sm">calories consumed</p>
            </div>
            {macroData.length > 0 && (
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Today's Activities</h2>
            <div className="space-y-4">
              {todaysActivities.length === 0 ? (
                <p className="text-gray-300 text-sm">No activities logged today</p>
              ) : (
                todaysActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium capitalize">{activity.type}</p>
                      <p className="text-gray-300 text-sm">{activity.duration} minutes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-semibold">{activity.calories} cal</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Goals Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Goals Progress</h2>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-gray-300 text-sm">No goals set</p>
              ) : (
                goals.slice(0, 3).map((goal, index) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{goal.title}</p>
                        <span className="text-sm text-gray-300">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Action Modal */}
      {quickAction.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-600"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {quickAction.type === 'metric' ? 'Add Health Metric' : 'Log Activity'}
            </h3>
            
            {quickAction.type === 'metric' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Metric Type
                  </label>
                  <select
                    value={selectedMetricType}
                    onChange={(e) => setSelectedMetricType(e.target.value as HealthMetric['type'])}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="weight">Weight (kg)</option>
                    <option value="steps">Steps</option>
                    <option value="sleep_hours">Sleep Hours</option>
                    <option value="water_intake">Water Intake (L)</option>
                    <option value="heart_rate">Heart Rate (bpm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Enter value"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddMetric}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Metric
                  </button>
                  <button
                    onClick={() => setQuickAction({ isOpen: false, type: null })}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {quickAction.type === 'activity' && (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Quick Activity Logging</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAddQuickActivity('walking', 30, 150)}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                  >
                    30min Walk
                  </button>
                  <button
                    onClick={() => handleAddQuickActivity('running', 30, 300)}
                    className="p-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                  >
                    30min Run
                  </button>
                  <button
                    onClick={() => handleAddQuickActivity('cycling', 45, 400)}
                    className="p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                  >
                    45min Bike
                  </button>
                  <button
                    onClick={() => handleAddQuickActivity('strength', 60, 250)}
                    className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                  >
                    60min Gym
                  </button>
                </div>
                <button
                  onClick={() => setQuickAction({ isOpen: false, type: null })}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}


