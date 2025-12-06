// services/mockDataService.js

// Mock bot data
const initialBots = [
  { id: 1, name: 'Alpha', battery: 85, status: 'idle', currentTask: 'None', speed: 0, lastUpdated: new Date() },
  { id: 2, name: 'Beta', battery: 45, status: 'charging', currentTask: 'None', speed: 0, lastUpdated: new Date() },
  { id: 3, name: 'Gamma', battery: 92, status: 'busy', currentTask: 'Package Delivery', speed: 3.5, lastUpdated: new Date() },
  { id: 4, name: 'Delta', battery: 23, status: 'error', currentTask: 'System Error', speed: 0, lastUpdated: new Date() },
  { id: 5, name: 'Epsilon', battery: 78, status: 'busy', currentTask: 'Inventory Scan', speed: 2.1, lastUpdated: new Date() },
  { id: 6, name: 'Zeta', battery: 65, status: 'idle', currentTask: 'None', speed: 0, lastUpdated: new Date() },
  { id: 7, name: 'Eta', battery: 88, status: 'busy', currentTask: 'Data Processing', speed: 4.2, lastUpdated: new Date() },
  { id: 8, name: 'Theta', battery: 34, status: 'charging', currentTask: 'None', speed: 0, lastUpdated: new Date() },
  { id: 9, name: 'Iota', battery: 91, status: 'idle', currentTask: 'None', speed: 0, lastUpdated: new Date() },
  { id: 10, name: 'Kappa', battery: 56, status: 'busy', currentTask: 'Route Optimization', speed: 1.8, lastUpdated: new Date() },
];

// Mock task data
const initialTasks = [
  { id: 1, pickup: 'Warehouse A', drop: 'Customer X', priority: 'High', status: 'pending', comments: 'Fragile items', createdAt: new Date() },
  { id: 2, pickup: 'Storage B', drop: 'Retail Store', priority: 'Medium', status: 'in-progress', comments: 'Heavy load', createdAt: new Date() },
  { id: 3, pickup: 'Factory C', drop: 'Distribution Center', priority: 'Low', status: 'completed', comments: 'Regular delivery', createdAt: new Date() },
];

// Status colors mapping
export const statusColors = {
  idle: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  busy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  charging: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

// Priority colors mapping
export const priorityColors = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
};

// Simulate bot data update
export const updateBotData = (bots) => {
  return bots.map(bot => {
    const randomChange = Math.random();
    
    let newBattery = bot.battery;
    let newStatus = bot.status;
    let newSpeed = bot.speed;
    let newTask = bot.currentTask;
    
    // Update battery
    if (bot.status === 'charging') {
      newBattery = Math.min(100, bot.battery + Math.floor(Math.random() * 10) + 5);
      if (newBattery >= 95) {
        newStatus = 'idle';
        newTask = 'None';
      }
    } else if (bot.status === 'busy') {
      newBattery = Math.max(0, bot.battery - Math.floor(Math.random() * 5) - 1);
      if (newBattery <= 15) {
        newStatus = 'charging';
        newTask = 'None';
        newSpeed = 0;
      }
    } else if (bot.status === 'idle') {
      newBattery = Math.max(0, bot.battery - Math.floor(Math.random() * 2));
    }
    
    // Random status changes
    if (randomChange < 0.1) { // 10% chance of status change
      if (bot.status === 'idle' && bot.battery > 20) {
        newStatus = 'busy';
        newTask = ['Package Delivery', 'Inventory Scan', 'Data Processing', 'Route Optimization'][Math.floor(Math.random() * 4)];
        newSpeed = Math.random() * 5 + 1;
      } else if (bot.status === 'busy' && randomChange < 0.05) {
        newStatus = 'error';
        newTask = 'System Error';
        newSpeed = 0;
      }
    }
    
    // Fix battery if too low
    if (newBattery <= 10 && newStatus !== 'charging') {
      newStatus = 'charging';
      newTask = 'None';
      newSpeed = 0;
    }
    
    return {
      ...bot,
      battery: newBattery,
      status: newStatus,
      currentTask: newTask,
      speed: newSpeed,
      lastUpdated: new Date(),
    };
  });
};

// Get initial data
export const getInitialBots = () => JSON.parse(JSON.stringify(initialBots));
export const getInitialTasks = () => JSON.parse(JSON.stringify(initialTasks));