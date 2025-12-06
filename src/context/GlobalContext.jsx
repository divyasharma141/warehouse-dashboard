// context/GlobalState.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create context
const GlobalStateContext = createContext();

// Mock data
const mockBots = [
  { id: 1, name: 'Alpha', battery: 85, status: 'idle', currentTask: 'None', speed: 0 },
  { id: 2, name: 'Beta', battery: 45, status: 'charging', currentTask: 'None', speed: 0 },
  { id: 3, name: 'Gamma', battery: 92, status: 'busy', currentTask: 'Package Delivery', speed: 3.5 },
  { id: 4, name: 'Delta', battery: 23, status: 'error', currentTask: 'System Error', speed: 0 },
  { id: 5, name: 'Epsilon', battery: 78, status: 'busy', currentTask: 'Inventory Scan', speed: 2.1 },
  { id: 6, name: 'Zeta', battery: 65, status: 'idle', currentTask: 'None', speed: 0 },
  { id: 7, name: 'Eta', battery: 88, status: 'busy', currentTask: 'Data Processing', speed: 4.2},
  { id: 8, name: 'Theta', battery: 34, status: 'charging', currentTask: 'None', speed: 0 },
  { id: 9, name: 'Iota', battery: 91, status: 'idle', currentTask: 'None', speed: 0 },
  { id: 10, name: 'Kappa', battery: 56, status: 'busy', currentTask: 'Route Optimization', speed: 1.8 },

  
];


const mockTasks = [
  { id: 1, pickup: 'Warehouse A', drop: 'Customer X', priority: 'High', status: 'pending', comments: 'Fragile items' },
  { id: 2, pickup: 'Storage B', drop: 'Retail Store', priority: 'Medium', status: 'pending', comments: 'Heavy load' },
  { id: 3, pickup: 'Factory C', drop: 'Distribution Center', priority: 'Low', status: 'pending', comments: 'Regular delivery' },
];

export const GlobalStateProvider = ({ children }) => {
  const [bots, setBots] = useState(mockBots);
  const [tasks, setTasks] = useState(mockTasks);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

 
  const updateBotData = useCallback(() => {
    setBots(prevBots => 
      prevBots.map(bot => {
        let newBattery = bot.battery;
        let newStatus = bot.status;
        let newSpeed = bot.speed;
        let newTask = bot.currentTask;

        if (bot.status === 'charging') {
          newBattery = Math.min(100, bot.battery + 5);
          if (newBattery >= 95) {
            newStatus = 'idle';
            newTask = 'None';
          }
        } else if (bot.status === 'busy') {
          newBattery = Math.max(0, bot.battery - 2);
          if (newBattery <= 15) {
            newStatus = 'charging';
            newTask = 'None';
            newSpeed = 0;
          }
        } else if (bot.status === 'idle') {
          newBattery = Math.max(0, bot.battery - 1);
          if (Math.random() > 0.7 && bot.battery > 30) {
            newStatus = 'busy';
            newTask = ['Package Delivery', 'Inventory Scan'][Math.floor(Math.random() * 2)];
            newSpeed = Math.random() * 3 + 1;
          }
        }

        return {
          ...bot,
          battery: newBattery,
          status: newStatus,
          currentTask: newTask,
          speed: newSpeed,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
    setLastUpdate(new Date().toISOString());
  }, []);

  useEffect(() => {
    // Add welcome notification
    setNotifications(prev => [{
      id: Date.now(),
      type: 'info',
      message: 'System initialized successfully',
      timestamp: new Date().toISOString()
    }, ...prev]);

    const interval = setInterval(updateBotData, 10000);

    return () => clearInterval(interval);
  }, [updateBotData]);

  // Auto-remove tasks every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        if (prevTasks.length === 0) return prevTasks;
        
        const pendingIndex = prevTasks.findIndex(task => task.status === 'pending');
        if (pendingIndex === -1) return prevTasks;
        
        // Remove the task
        const updatedTasks = [...prevTasks];
        updatedTasks.splice(pendingIndex, 1);
        
        // Add notification
        setNotifications(prev => [{
          id: Date.now(),
          type: 'success',
          message: 'Task completed automatically',
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
        
        return updatedTasks;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Actions
  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `Task "${task.pickup} → ${task.drop}" created`,
      timestamp: new Date().toISOString()
    }, ...prev.slice(0, 9)]);
  }, []);

  const updateBot = useCallback((botId, data) => {
    setBots(prevBots => 
      prevBots.map(bot => 
        bot.id === botId ? { ...bot, ...data } : bot
      )
    );
  }, []);

  const removeTask = useCallback((taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const state = {
    bots,
    tasks,
    notifications,
    isLoading,
    lastUpdate,
    analytics: {
      totalBots: bots.length,
      activeTasks: bots.filter(b => b.status === 'busy').length,
      idleBots: bots.filter(b => b.status === 'idle').length,
      errorBots: bots.filter(b => b.status === 'error').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
    }
  };

  // Prepare actions object
  const actions = {
    addTask,
    updateBot,
    removeTask,
    clearNotification,
    updateBotData, // Manual update trigger
  };

  return (
    <GlobalStateContext.Provider value={{ state, actions }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use global state
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
};