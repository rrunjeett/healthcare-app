import { v4 as uuidv4 } from 'uuid';

export interface HealthMetric {
  id: string;
  date: string;
  value: number;
  type: 'weight' | 'blood_pressure_systolic' | 'blood_pressure_diastolic' | 'heart_rate' | 'steps' | 'calories_burned' | 'sleep_hours' | 'water_intake';
  unit: string;
}

export interface NutritionEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Activity {
  id: string;
  date: string;
  type: 'running' | 'walking' | 'cycling' | 'swimming' | 'strength' | 'yoga' | 'other';
  duration: number; // in minutes
  calories: number;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'weight' | 'steps' | 'exercise' | 'nutrition' | 'sleep' | 'water';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  createdAt: string;
}

// Local storage keys
const HEALTH_METRICS_KEY = 'health-metrics';
const NUTRITION_ENTRIES_KEY = 'nutrition-entries';
const ACTIVITIES_KEY = 'activities';
const GOALS_KEY = 'goals';

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Health Metrics functions
export function getHealthMetrics(): HealthMetric[] {
  return getFromStorage<HealthMetric>(HEALTH_METRICS_KEY);
}

export function addHealthMetric(metric: Omit<HealthMetric, 'id'>): HealthMetric {
  const newMetric: HealthMetric = {
    ...metric,
    id: uuidv4(),
  };
  const metrics = getHealthMetrics();
  metrics.push(newMetric);
  saveToStorage(HEALTH_METRICS_KEY, metrics);
  return newMetric;
}

export function getLatestMetric(type: HealthMetric['type']): HealthMetric | null {
  const metrics = getHealthMetrics();
  const filtered = metrics.filter(m => m.type === type);
  return filtered.length > 0 ? filtered[filtered.length - 1] : null;
}

// Nutrition functions
export function getNutritionEntries(): NutritionEntry[] {
  return getFromStorage<NutritionEntry>(NUTRITION_ENTRIES_KEY);
}

export function addNutritionEntry(entry: Omit<NutritionEntry, 'id'>): NutritionEntry {
  const newEntry: NutritionEntry = {
    ...entry,
    id: uuidv4(),
  };
  const entries = getNutritionEntries();
  entries.push(newEntry);
  saveToStorage(NUTRITION_ENTRIES_KEY, entries);
  return newEntry;
}

export function getTodaysNutrition(): NutritionEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return getNutritionEntries().filter(entry => entry.date === today);
}

// Activities functions
export function getActivities(): Activity[] {
  return getFromStorage<Activity>(ACTIVITIES_KEY);
}

export function addActivity(activity: Omit<Activity, 'id'>): Activity {
  const newActivity: Activity = {
    ...activity,
    id: uuidv4(),
  };
  const activities = getActivities();
  activities.push(newActivity);
  saveToStorage(ACTIVITIES_KEY, activities);
  return newActivity;
}

export function getTodaysActivities(): Activity[] {
  const today = new Date().toISOString().split('T')[0];
  return getActivities().filter(activity => activity.date === today);
}

// Goals functions
export function getGoals(): Goal[] {
  return getFromStorage<Goal>(GOALS_KEY);
}

export function addGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Goal {
  const newGoal: Goal = {
    ...goal,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  const goals = getGoals();
  goals.push(newGoal);
  saveToStorage(GOALS_KEY, goals);
  return newGoal;
}

export function updateGoal(id: string, updates: Partial<Goal>): Goal | null {
  const goals = getGoals();
  const index = goals.findIndex(goal => goal.id === id);
  if (index === -1) return null;
  
  goals[index] = { ...goals[index], ...updates };
  saveToStorage(GOALS_KEY, goals);
  return goals[index];
}

export function deleteGoal(id: string): boolean {
  const goals = getGoals();
  const filteredGoals = goals.filter(goal => goal.id !== id);
  if (filteredGoals.length === goals.length) return false;
  
  saveToStorage(GOALS_KEY, filteredGoals);
  return true;
}

// Sample data generation for demo
export function generateSampleData(): void {
  const today = new Date();
  const sampleMetrics: HealthMetric[] = [];
  const sampleActivities: Activity[] = [];
  const sampleNutrition: NutritionEntry[] = [];

  // Generate sample data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Health metrics
    sampleMetrics.push({
      id: uuidv4(),
      date: dateStr,
      type: 'weight',
      value: 70 + Math.random() * 5,
      unit: 'kg'
    });

    sampleMetrics.push({
      id: uuidv4(),
      date: dateStr,
      type: 'steps',
      value: 8000 + Math.random() * 4000,
      unit: 'steps'
    });

    sampleMetrics.push({
      id: uuidv4(),
      date: dateStr,
      type: 'sleep_hours',
      value: 6 + Math.random() * 3,
      unit: 'hours'
    });

    // Activities
    if (Math.random() > 0.3) {
      sampleActivities.push({
        id: uuidv4(),
        date: dateStr,
        type: ['running', 'walking', 'cycling', 'strength'][Math.floor(Math.random() * 4)] as Activity['type'],
        duration: 30 + Math.random() * 60,
        calories: 200 + Math.random() * 300
      });
    }

    // Nutrition
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      sampleNutrition.push({
        id: uuidv4(),
        date: dateStr,
        meal: meal as NutritionEntry['meal'],
        food: ['Oatmeal', 'Chicken Salad', 'Grilled Salmon', 'Pasta', 'Smoothie'][Math.floor(Math.random() * 5)],
        calories: 300 + Math.random() * 400,
        protein: 20 + Math.random() * 30,
        carbs: 30 + Math.random() * 50,
        fat: 10 + Math.random() * 20
      });
    });
  }

  // Sample goals
  const sampleGoals: Goal[] = [
    {
      id: uuidv4(),
      title: 'Lose 5kg',
      type: 'weight',
      target: 65,
      current: 70,
      unit: 'kg',
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Walk 10,000 steps daily',
      type: 'steps',
      target: 10000,
      current: 8500,
      unit: 'steps',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
  ];

  saveToStorage(HEALTH_METRICS_KEY, sampleMetrics);
  saveToStorage(ACTIVITIES_KEY, sampleActivities);
  saveToStorage(NUTRITION_ENTRIES_KEY, sampleNutrition);
  saveToStorage(GOALS_KEY, sampleGoals);
}