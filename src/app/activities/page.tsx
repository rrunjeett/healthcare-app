"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Plus,
  Calendar,
  Clock,
  Flame,
  Activity as ActivityIcon,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import {
  getActivities,
  addActivity,
  type Activity,
} from "@/lib/health-data";

interface ActivityForm {
  type: Activity['type'];
  duration: string;
  calories: string;
  notes: string;
  date: string;
}

const activityTypes: Array<{ value: Activity['type']; label: string; color: string; icon: string }> = [
  { value: 'running', label: 'Running', color: '#EF4444', icon: '🏃‍♂️' },
  { value: 'walking', label: 'Walking', color: '#10B981', icon: '🚶‍♂️' },
  { value: 'cycling', label: 'Cycling', color: '#3B82F6', icon: '🚴‍♂️' },
  { value: 'swimming', label: 'Swimming', color: '#06B6D4', icon: '🏊‍♂️' },
  { value: 'strength', label: 'Strength Training', color: '#8B5CF6', icon: '💪' },
  { value: 'yoga', label: 'Yoga', color: '#F59E0B', icon: '🧘‍♂️' },
  { value: 'other', label: 'Other', color: '#6B7280', icon: '🏋️‍♂️' },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<Activity['type'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<ActivityForm>({
    type: 'walking',
    duration: '',
    calories: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    setActivities(getActivities());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.duration || !form.calories) return;

    addActivity({
      type: form.type,
      duration: parseInt(form.duration),
      calories: parseInt(form.calories),
      notes: form.notes,
      date: form.date,
    });

    setForm({
      type: 'walking',
      duration: '',
      calories: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
    loadActivities();
  };

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      day: format(date, 'MMM dd'),
      date: format(date, 'yyyy-MM-dd'),
    };
  });

  const dailyCaloriesData = last7Days.map(day => {
    const dayActivities = activities.filter(a => a.date === day.date);
    const totalCalories = dayActivities.reduce((sum, a) => sum + a.calories, 0);
    return {
      day: day.day,
      calories: totalCalories,
    };
  });

  const weeklyDurationData = last7Days.map(day => {
    const dayActivities = activities.filter(a => a.date === day.date);
    const totalDuration = dayActivities.reduce((sum, a) => sum + a.duration, 0);
    return {
      day: day.day,
      duration: totalDuration,
    };
  });

  // Activity type distribution
  const typeDistribution = activityTypes.map(type => {
    const typeActivities = activities.filter(a => a.type === type.value);
    const totalDuration = typeActivities.reduce((sum, a) => sum + a.duration, 0);
    return {
      name: type.label,
      value: totalDuration,
      color: type.color,
    };
  }).filter(item => item.value > 0);

  // Filter activities
  const filteredActivities = activities
    .filter(activity => filterType === 'all' || activity.type === filterType)
    .filter(activity => 
      activity.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activityTypes.find(t => t.value === activity.type)?.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate stats
  const totalActivities = activities.length;
  const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const avgCaloriesPerSession = totalActivities > 0 ? totalCalories / totalActivities : 0;

  const thisWeek = activities.filter(a => {
    const activityDate = new Date(a.date);
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return activityDate >= weekStart && activityDate <= weekEnd;
  });

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
                Activities
              </h1>
              <p className="text-gray-300">
                Track your workouts and physical activities
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors mt-4 md:mt-0"
            >
              <Plus className="h-5 w-5" />
              <span>Log Activity</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <ActivityIcon className="h-8 w-8 text-blue-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Total Activities</h3>
            <p className="text-2xl font-bold text-white">{totalActivities}</p>
            <p className="text-sm text-gray-400">{thisWeek.length} this week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Flame className="h-8 w-8 text-orange-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Total Calories</h3>
            <p className="text-2xl font-bold text-white">{totalCalories.toLocaleString()}</p>
            <p className="text-sm text-gray-400">
              {thisWeek.reduce((sum, a) => sum + a.calories, 0)} this week
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-purple-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Total Duration</h3>
            <p className="text-2xl font-bold text-white">{Math.round(totalDuration / 60)}h</p>
            <p className="text-sm text-gray-400">
              {Math.round(thisWeek.reduce((sum, a) => sum + a.duration, 0) / 60)}h this week
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-green-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Avg Calories/Session</h3>
            <p className="text-2xl font-bold text-white">{Math.round(avgCaloriesPerSession)}</p>
            <p className="text-sm text-gray-400">Last 30 days</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Daily Calories Burned</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyCaloriesData}>
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
                <Bar dataKey="calories" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Activity Distribution</h2>
            {typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                                     <Pie
                     data={typeDistribution}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     dataKey="value"
                     label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                   >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} min`, 'Duration']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-250 flex items-center justify-center">
                <p className="text-gray-400">No activity data yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Filters and Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">Activity History</h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as Activity['type'] | 'all')}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Activities</option>
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <ActivityIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No activities found</p>
                <p className="text-gray-500">Start tracking your workouts!</p>
              </div>
            ) : (
              filteredActivities.map((activity, index) => {
                const activityType = activityTypes.find(t => t.value === activity.type);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{activityType?.icon}</div>
                      <div>
                        <h3 className="text-white font-medium">{activityType?.label}</h3>
                        <p className="text-gray-400 text-sm">
                          {format(new Date(activity.date), 'MMM dd, yyyy')}
                        </p>
                        {activity.notes && (
                          <p className="text-gray-300 text-sm mt-1">{activity.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-purple-400" />
                          <span className="text-white">{activity.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Flame className="h-4 w-4 text-orange-400" />
                          <span className="text-white">{activity.calories} cal</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Activity Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-600"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Log New Activity</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Activity Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Activity['type'] })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Enter duration"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Calories Burned
                </label>
                <input
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Enter calories burned"
                  required
                />
              </div>

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
                  Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Add notes about your workout"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Log Activity
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