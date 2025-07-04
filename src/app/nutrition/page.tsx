"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
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
  LineChart,
  Line,
} from "recharts";
import {
  Plus,
  Utensils,
  Apple,
  Coffee,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";
import {
  getNutritionEntries,
  addNutritionEntry,
  getTodaysNutrition,
  type NutritionEntry,
} from "@/lib/health-data";

interface NutritionForm {
  meal: NutritionEntry['meal'];
  food: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  date: string;
}

const mealTypes: Array<{ value: NutritionEntry['meal']; label: string; color: string; icon: string }> = [
  { value: 'breakfast', label: 'Breakfast', color: '#F59E0B', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', color: '#10B981', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', color: '#3B82F6', icon: '🌙' },
  { value: 'snack', label: 'Snack', color: '#8B5CF6', icon: '🍎' },
];

const commonFoods = [
  { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0 },
  { name: 'Brown Rice (1 cup)', calories: 220, protein: 5, carbs: 45, fat: 2 },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fat: 10 },
];

export default function NutritionPage() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [todaysEntries, setTodaysEntries] = useState<NutritionEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterMeal, setFilterMeal] = useState<NutritionEntry['meal'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<NutritionForm>({
    meal: 'breakfast',
    food: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEntries(getNutritionEntries());
    setTodaysEntries(getTodaysNutrition());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.food || !form.calories) return;

    addNutritionEntry({
      meal: form.meal,
      food: form.food,
      calories: parseFloat(form.calories),
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
      date: form.date,
    });

    setForm({
      meal: 'breakfast',
      food: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
    loadData();
  };

  const selectCommonFood = (food: typeof commonFoods[0]) => {
    setForm({
      ...form,
      food: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
    });
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
    const dayEntries = entries.filter(e => e.date === day.date);
    const totalCalories = dayEntries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = dayEntries.reduce((sum, e) => sum + e.protein, 0);
    const totalCarbs = dayEntries.reduce((sum, e) => sum + e.carbs, 0);
    const totalFat = dayEntries.reduce((sum, e) => sum + e.fat, 0);
    return {
      day: day.day,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    };
  });

  // Today's macro distribution
  const todaysMacros = todaysEntries.reduce(
    (acc, entry) => ({
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );

  const macroData = [
    { name: 'Protein', value: todaysMacros.protein, color: '#10B981', calories: todaysMacros.protein * 4 },
    { name: 'Carbs', value: todaysMacros.carbs, color: '#3B82F6', calories: todaysMacros.carbs * 4 },
    { name: 'Fat', value: todaysMacros.fat, color: '#F59E0B', calories: todaysMacros.fat * 9 },
  ];

  // Meal distribution for today
  const mealDistribution = mealTypes.map(meal => {
    const mealEntries = todaysEntries.filter(e => e.meal === meal.value);
    const totalCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);
    return {
      name: meal.label,
      value: totalCalories,
      color: meal.color,
    };
  }).filter(item => item.value > 0);

  // Filter entries
  const filteredEntries = entries
    .filter(entry => filterMeal === 'all' || entry.meal === filterMeal)
    .filter(entry => 
      entry.food.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate stats
  const totalCalories = todaysEntries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = todaysEntries.reduce((sum, e) => sum + e.protein, 0);
  const totalCarbs = todaysEntries.reduce((sum, e) => sum + e.carbs, 0);
  const totalFat = todaysEntries.reduce((sum, e) => sum + e.fat, 0);

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
                Nutrition
              </h1>
              <p className="text-gray-300">
                Track your meals and monitor your nutrition intake
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors mt-4 md:mt-0"
            >
              <Plus className="h-5 w-5" />
              <span>Log Food</span>
            </button>
          </div>
        </motion.div>

        {/* Today's Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Utensils className="h-8 w-8 text-orange-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Calories Today</h3>
            <p className="text-2xl font-bold text-white">{Math.round(totalCalories)}</p>
            <p className="text-sm text-gray-400">Goal: 2000</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Apple className="h-8 w-8 text-green-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Protein</h3>
            <p className="text-2xl font-bold text-white">{Math.round(totalProtein)}g</p>
            <p className="text-sm text-gray-400">Goal: 120g</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Coffee className="h-8 w-8 text-blue-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Carbs</h3>
            <p className="text-2xl font-bold text-white">{Math.round(totalCarbs)}g</p>
            <p className="text-sm text-gray-400">Goal: 250g</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Utensils className="h-8 w-8 text-yellow-400" />
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-1">Fat</h3>
            <p className="text-2xl font-bold text-white">{Math.round(totalFat)}g</p>
            <p className="text-sm text-gray-400">Goal: 67g</p>
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
            <h2 className="text-xl font-semibold text-white mb-4">Daily Calories</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyCaloriesData}>
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
                <Line type="monotone" dataKey="calories" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Today's Macros</h2>
            {macroData.some(m => m.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">No nutrition data for today</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Meal Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Weekly Macros</h2>
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
                <Bar dataKey="protein" fill="#10B981" name="Protein" />
                <Bar dataKey="carbs" fill="#3B82F6" name="Carbs" />
                <Bar dataKey="fat" fill="#F59E0B" name="Fat" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Today's Meals</h2>
            {mealDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mealDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {mealDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cal`, 'Calories']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">No meals logged today</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Food Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">Food Log</h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <select
                value={filterMeal}
                onChange={(e) => setFilterMeal(e.target.value as NutritionEntry['meal'] | 'all')}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Meals</option>
                {mealTypes.map(meal => (
                  <option key={meal.value} value={meal.value}>{meal.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No food entries found</p>
                <p className="text-gray-500">Start logging your meals!</p>
              </div>
            ) : (
              filteredEntries.slice(0, 10).map((entry, index) => {
                const mealType = mealTypes.find(m => m.value === entry.meal);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{mealType?.icon}</div>
                      <div>
                        <h3 className="text-white font-medium">{entry.food}</h3>
                        <p className="text-gray-400 text-sm">
                          {mealType?.label} • {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="text-white font-semibold">{entry.calories} cal</div>
                        <div className="flex space-x-4 text-xs">
                          <span className="text-green-400">P: {entry.protein}g</span>
                          <span className="text-blue-400">C: {entry.carbs}g</span>
                          <span className="text-yellow-400">F: {entry.fat}g</span>
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

      {/* Add Food Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-slate-600 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Log Food Entry</h3>
            
            {/* Common Foods */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Add (Common Foods)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonFoods.map((food, index) => (
                  <button
                    key={index}
                    onClick={() => selectCommonFood(food)}
                    className="p-2 text-left bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm text-white"
                  >
                    {food.name}
                    <div className="text-xs text-gray-400">{food.calories} cal</div>
                  </button>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meal
                  </label>
                  <select
                    value={form.meal}
                    onChange={(e) => setForm({ ...form, meal: e.target.value as NutritionEntry['meal'] })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    {mealTypes.map(meal => (
                      <option key={meal.value} value={meal.value}>
                        {meal.icon} {meal.label}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Food Name
                </label>
                <input
                  type="text"
                  value={form.food}
                  onChange={(e) => setForm({ ...form, food: e.target.value })}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Enter food name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Cal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.protein}
                    onChange={(e) => setForm({ ...form, protein: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.carbs}
                    onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.fat}
                    onChange={(e) => setForm({ ...form, fat: e.target.value })}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Log Food
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