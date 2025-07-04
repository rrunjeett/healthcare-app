"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Plus,
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Flag,
} from "lucide-react";
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  type Goal,
} from "@/lib/health-data";

interface GoalForm {
  title: string;
  type: Goal['type'];
  target: string;
  unit: string;
  deadline: string;
}

const goalTypes: Array<{
  value: Goal['type'];
  label: string;
  defaultUnit: string;
  color: string;
  icon: string;
  description: string;
}> = [
  {
    value: 'weight',
    label: 'Weight Loss/Gain',
    defaultUnit: 'kg',
    color: '#10B981',
    icon: '⚖️',
    description: 'Target body weight'
  },
  {
    value: 'steps',
    label: 'Daily Steps',
    defaultUnit: 'steps',
    color: '#3B82F6',
    icon: '👟',
    description: 'Steps per day target'
  },
  {
    value: 'exercise',
    label: 'Exercise Frequency',
    defaultUnit: 'sessions/week',
    color: '#EF4444',
    icon: '💪',
    description: 'Workout sessions per week'
  },
  {
    value: 'nutrition',
    label: 'Nutrition Goal',
    defaultUnit: 'calories',
    color: '#F59E0B',
    icon: '🍎',
    description: 'Daily calorie or macro target'
  },
  {
    value: 'sleep',
    label: 'Sleep Quality',
    defaultUnit: 'hours',
    color: '#8B5CF6',
    icon: '😴',
    description: 'Daily sleep duration'
  },
  {
    value: 'water',
    label: 'Water Intake',
    defaultUnit: 'L',
    color: '#06B6D4',
    icon: '💧',
    description: 'Daily water consumption'
  },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<GoalForm>({
    title: '',
    type: 'weight',
    target: '',
    unit: 'kg',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    setGoals(getGoals());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.target) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: form.title,
        target: parseFloat(form.target),
        deadline: form.deadline,
      });
    } else {
      addGoal({
        title: form.title,
        type: form.type,
        target: parseFloat(form.target),
        current: 0,
        unit: form.unit,
        deadline: form.deadline,
      });
    }

    resetForm();
    loadGoals();
  };

  const resetForm = () => {
    setForm({
      title: '',
      type: 'weight',
      target: '',
      unit: 'kg',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      type: goal.type,
      target: goal.target.toString(),
      unit: goal.unit,
      deadline: goal.deadline,
    });
    setShowForm(true);
  };

  const handleDelete = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
      loadGoals();
    }
  };

  const handleUpdateProgress = (goalId: string, newCurrent: number) => {
    updateGoal(goalId, { current: newCurrent });
    loadGoals();
  };

  // Calculate goal statistics
  const goalStats = {
    total: goals.length,
    completed: goals.filter(g => g.current >= g.target).length,
    inProgress: goals.filter(g => g.current < g.target && new Date(g.deadline) >= new Date()).length,
    overdue: goals.filter(g => g.current < g.target && new Date(g.deadline) < new Date()).length,
  };

  // Progress distribution
  const progressDistribution = [
    { name: 'Completed', value: goalStats.completed, color: '#10B981' },
    { name: 'In Progress', value: goalStats.inProgress, color: '#3B82F6' },
    { name: 'Overdue', value: goalStats.overdue, color: '#EF4444' },
  ].filter(item => item.value > 0);

  // Goals by type
  const goalsByType = goalTypes.map(type => ({
    name: type.label,
    value: goals.filter(g => g.type === type.value).length,
    color: type.color,
  })).filter(item => item.value > 0);

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
                Health Goals
              </h1>
              <p className="text-gray-300">
                Set, track, and achieve your health and fitness goals
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors mt-4 md:mt-0"
            >
              <Plus className="h-5 w-5" />
              <span>New Goal</span>
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
              <Target className="h-8 w-8 text-blue-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Total Goals</h3>
            <p className="text-2xl font-bold text-white">{goalStats.total}</p>
            <p className="text-sm text-gray-400">All time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Completed</h3>
            <p className="text-2xl font-bold text-white">{goalStats.completed}</p>
            <p className="text-sm text-gray-400">
              {goalStats.total > 0 ? Math.round((goalStats.completed / goalStats.total) * 100) : 0}% success rate
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-green-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">In Progress</h3>
            <p className="text-2xl font-bold text-white">{goalStats.inProgress}</p>
            <p className="text-sm text-gray-400">Active goals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Flag className="h-8 w-8 text-red-400" />
              <Calendar className="h-4 w-4 text-red-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Overdue</h3>
            <p className="text-2xl font-bold text-white">{goalStats.overdue}</p>
            <p className="text-sm text-gray-400">Need attention</p>
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
            <h2 className="text-xl font-semibold text-white mb-4">Goal Progress</h2>
            {progressDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={progressDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {progressDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Goals']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">No goals set yet</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Goals by Category</h2>
            {goalsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={goalsByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">No goals data available</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Goals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Your Goals</h2>
          
          <div className="space-y-6">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-xl mb-2">No goals set yet</p>
                <p className="text-gray-500 mb-6">Start by creating your first health goal!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              goals.map((goal, index) => {
                const goalType = goalTypes.find(t => t.value === goal.type);
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                const isCompleted = goal.current >= goal.target;
                const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted;
                const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
                
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 rounded-xl border transition-all duration-200 ${
                      isCompleted 
                        ? 'bg-green-900/20 border-green-500/30' 
                        : isOverdue
                        ? 'bg-red-900/20 border-red-500/30'
                        : 'bg-slate-800/50 border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{goalType?.icon}</div>
                        <div>
                          <h3 className="text-white text-lg font-semibold">{goal.title}</h3>
                          <p className="text-gray-400 text-sm">{goalType?.label}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-300">
                              Target: {goal.target} {goal.unit}
                            </span>
                            <span className="text-gray-300">
                              Deadline: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                            </span>
                            {!isCompleted && (
                              <span className={`${
                                isOverdue ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-gray-400'
                              }`}>
                                {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        )}
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Progress</span>
                        <span className="text-sm font-semibold text-white">
                          {goal.current} / {goal.target} {goal.unit} ({progress.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : isOverdue
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Quick Update */}
                    {!isCompleted && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Update progress:</span>
                        <input
                          type="number"
                          className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm w-20"
                          placeholder={goal.current.toString()}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(value)) {
                                handleUpdateProgress(goal.id, value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <span className="text-sm text-gray-400">{goal.unit}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-600"
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Lose 10kg by summer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => {
                    const type = e.target.value as Goal['type'];
                    const goalType = goalTypes.find(t => t.value === type);
                    setForm({ 
                      ...form, 
                      type,
                      unit: goalType?.defaultUnit || ''
                    });
                  }}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  disabled={!!editingGoal}
                >
                  {goalTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {goalTypes.find(t => t.value === form.type)?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Target"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Unit"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
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