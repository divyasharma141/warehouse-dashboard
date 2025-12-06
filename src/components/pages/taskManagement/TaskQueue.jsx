import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPlus, 
  FaMapMarkerAlt, 
  FaPaperPlane,
  FaRobot,
  FaHourglassHalf,
  FaPlayCircle,
  FaClock,
  FaCheckCircle,
  FaSync,
  FaHistory,
  FaCheck,
  FaExclamationTriangle,
  FaRobot as FaRobotIcon
} from 'react-icons/fa';
import { useGlobalState } from '../../../context/GlobalContext';
// Import common components
import PageHeader from '../../common/PageHeader';
import Button from '../../common/button';
import Card from '../../common/Card';
import StatsGrid from '../../common/StatsGrid';
import FilterBar from '../../common/filterBar';
import DataTable from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import EmptyState from '../../common/EmptyState';
import KPICard from '../../common/KPICard';

const TaskManagementPage = () => {
  const { state, actions } = useGlobalState();
  const { tasks, bots, lastUpdate } = state;
  
  const [isAutoAssign, setIsAutoAssign] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [newTask, setNewTask] = useState({
    pickup: '',
    drop: '',
    priority: 'Medium',
    comments: '',
    assignedBot: 'auto',
    estimatedTime: '30'
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  
  const intervalRef = useRef(null);
  const autoAssignRef = useRef(isAutoAssign);

  // Keep ref in sync with state
  useEffect(() => {
    autoAssignRef.current = isAutoAssign;
  }, [isAutoAssign]);

  // Auto-assignment logic
  useEffect(() => {
    if (isAutoAssign && tasks.length > 0) {
      intervalRef.current = setInterval(() => {
        autoAssignTask();
      }, 3000); // Every 3 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [isAutoAssign, tasks.length]);

  // Auto-assign task to available bot
  const autoAssignTask = () => {
    if (!autoAssignRef.current || tasks.length === 0) return;

    // Get all pending tasks
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    if (pendingTasks.length === 0) return;

    // Get available bots (idle with >30% battery)
    const availableBots = bots.filter(bot => 
      bot.status === 'idle' && bot.battery > 30
    );

    if (availableBots.length === 0) {
      // No available bots - wait for next cycle
      addToHistory('No available bots for assignment', 'warning');
      return;
    }

    // Sort tasks by priority (High > Medium > Low) and creation time
    const sortedTasks = [...pendingTasks].sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    const taskToAssign = sortedTasks[0];
    const botToUse = availableBots[0]; // Simple round-robin selection

    // Assign task to bot
    assignTaskToBot(taskToAssign.id, botToUse.id);
  };

  // Manual task assignment
  const assignTaskToBot = (taskId, botId) => {
    const task = tasks.find(t => t.id === taskId);
    const bot = bots.find(b => b.id === botId);

    if (!task || !bot) return;

    // Remove task from queue
    actions.removeTask(taskId);
    
    // Update bot status
    actions.updateBot(botId, {
      status: 'busy',
      currentTask: `${task.pickup} → ${task.drop}`,
      speed: Math.random() * 3 + 1,
      lastCompletedTask: `${task.pickup} → ${task.drop}`,
      taskAssignedAt: new Date().toISOString()
    });

    // Add to history
    addToHistory(`Task ${taskId} assigned to ${bot.name}`, 'success');
  };

  const addToHistory = (message, type = 'info') => {
    const historyItem = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      botsAvailable: bots.filter(b => b.status === 'idle' && b.battery > 30).length,
      tasksPending: tasks.filter(t => t.status === 'pending').length
    };
    
    setAssignmentHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Handle new task creation
  const handleAddTask = () => {
    if (!newTask.pickup || !newTask.drop) {
      alert('Please fill in both pickup and drop locations');
      return;
    }

    const task = {
      pickup: newTask.pickup,
      drop: newTask.drop,
      priority: newTask.priority,
      comments: newTask.comments,
      estimatedTime: parseInt(newTask.estimatedTime),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    actions.addTask(task);

    // If manual bot assignment selected
    if (newTask.assignedBot !== 'auto' && newTask.assignedBot !== '') {
      const botId = parseInt(newTask.assignedBot);
      const bot = bots.find(b => b.id === botId);
      if (bot && bot.status === 'idle' && bot.battery > 30) {
        assignTaskToBot(task.id, botId);
      }
    }

    // Reset form
    setNewTask({
      pickup: '',
      drop: '',
      priority: 'Medium',
      comments: '',
      assignedBot: 'auto',
      estimatedTime: '30'
    });
    
    setShowAddTask(false);
  };

  // Get statistics
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const availableBots = bots.filter(b => b.status === 'idle' && b.battery > 30);
  const busyBots = bots.filter(b => b.status === 'busy');
  const chargingBots = bots.filter(b => b.status === 'charging');
  const errorBots = bots.filter(b => b.status === 'error');
  
  const completedTasks = bots.filter(b => b.lastCompletedTask).length;
  const totalTasksProcessed = completedTasks + busyBots.length;

  // Table columns
  const columns = [
    {
      id: 'id',
      label: 'Task ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">TASK-{value.toString().slice(-4)}</span>
      )
    },
    {
      id: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => <StatusBadge status={value.toLowerCase()} showIcon />
    },
    {
      id: 'pickup',
      label: 'Pickup',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <FaMapMarkerAlt className="text-red-500 mr-2" />
          <span>{value}</span>
        </div>
      )
    },
    {
      id: 'drop',
      label: 'Drop',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <FaMapMarkerAlt className="text-green-500 mr-2" />
          <span>{value}</span>
        </div>
      )
    },
    {
      id: 'estimatedTime',
      label: 'Est. Time',
      sortable: true,
      render: (value) => `${value || 30} min`
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} showIcon />
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          {availableBots.length > 0 && (
            <Button 
              variant="success" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleManualAssign(row.id);
              }}
            >
              <FaPlayCircle className="mr-1" size={12} />
              Assign
            </Button>
          )}
          <Button 
            variant="danger" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              actions.removeTask(row.id);
            }}
          >
            <FaClock className="mr-1" size={12} />
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Filter options
  const filterOptions = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]
    }
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'priority', label: 'Priority' }
  ];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleManualAssign = (taskId) => {
    if (availableBots.length === 0) {
      alert('No available bots at the moment');
      return;
    }
    assignTaskToBot(taskId, availableBots[0].id);
  };

  // Simulate bot becoming available (for testing)
  const simulateBotAvailable = () => {
    const busyBot = busyBots.find(bot => bot.battery > 20);
    if (busyBot) {
      actions.updateBot(busyBot.id, {
        status: 'idle',
        currentTask: 'None',
        speed: 0
      });
      addToHistory(`Manually freed ${busyBot.name} for new tasks`, 'info');
    }
  };

  // Stats for StatsGrid
  const stats = [
    {
      title: 'Pending Tasks',
      value: pendingTasks.length,
      icon: <FaHourglassHalf size={24} />,
      subtitle: 'Waiting for assignment',
      color: 'blue'
    },
    {
      title: 'Available Bots',
      value: availableBots.length,
      icon: <FaRobot size={24} />,
      subtitle: 'Ready for tasks',
      color: 'green'
    },
    {
      title: 'Bots Working',
      value: busyBots.length,
      icon: <FaPlayCircle size={24} />,
      subtitle: 'Currently active',
      color: 'yellow'
    },
    {
      title: 'Next Assign',
      value: isAutoAssign ? '3s' : 'Paused',
      icon: <FaClock size={24} />,
      subtitle: 'Auto-assign interval',
      color: 'red'
    },
    {
      title: 'Processed',
      value: totalTasksProcessed,
      icon: <FaCheckCircle size={24} />,
      subtitle: 'Total tasks completed',
      color: 'purple'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with common component */}
        <PageHeader
          title="Task Management Hub"
          subtitle={`${pendingTasks.length} pending tasks • ${availableBots.length} bots available • Auto-assign: ${isAutoAssign ? 'ON (3s)' : 'OFF'}`}
          lastUpdated={lastUpdate}
          stats={[
            { label: 'Pending', value: pendingTasks.length, color: '#3B82F6' },
            { label: 'Available', value: availableBots.length, color: '#10B981' },
            { label: 'Working', value: busyBots.length, color: '#F59E0B' }
          ]}
        >
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={() => setShowAddTask(!showAddTask)}
          >
            {showAddTask ? 'Hide Form' : 'New Task'}
          </Button>
          <Button
            variant="success"
            icon={<FaSync />}
            onClick={simulateBotAvailable}
            disabled={busyBots.length === 0}
          >
            Free Bot
          </Button>
          <Button
            variant={isAutoAssign ? 'danger' : 'success'}
            icon={isAutoAssign ? <FaClock /> : <FaClock />}
            onClick={() => setIsAutoAssign(!isAutoAssign)}
          >
            Auto-Assign: {isAutoAssign ? 'ON' : 'OFF'}
          </Button>
        </PageHeader>

        {/* Add Task Form */}
        {showAddTask && (
          <Card title="Create New Task" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={newTask.pickup}
                  onChange={(e) => setNewTask({...newTask, pickup: e.target.value})}
                  placeholder="e.g., Warehouse A"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop Location
                </label>
                <input
                  type="text"
                  value={newTask.drop}
                  onChange={(e) => setNewTask({...newTask, drop: e.target.value})}
                  placeholder="e.g., Customer X"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Est. Time (minutes)
                </label>
                <input
                  type="number"
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                  min="5"
                  max="240"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Bot
                </label>
                <select
                  value={newTask.assignedBot}
                  onChange={(e) => setNewTask({...newTask, assignedBot: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="auto">🤖 Auto-assign (Recommended)</option>
                  <option value="" disabled>--- Available Bots ---</option>
                  {availableBots.map(bot => (
                    <option key={bot.id} value={bot.id}>
                      {bot.name} - {bot.battery}% battery
                    </option>
                  ))}
                  {availableBots.length === 0 && (
                    <option value="" disabled>No available bots</option>
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  value={newTask.comments}
                  onChange={(e) => setNewTask({...newTask, comments: e.target.value})}
                  placeholder="Special instructions..."
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<FaPaperPlane />}
                onClick={handleAddTask}
              >
                Create Task
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Grid with common component */}
        <StatsGrid 
          stats={stats}
          columns={5}
          onCardClick={(stat) => console.log('Card clicked:', stat.title)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Queue */}
          <div className="lg:col-span-2">
            <Card 
              title={`Task Queue (${tasks.length})`}
              subtitle="Auto-assigns every 3 seconds"
              actions={
                <div className="flex space-x-2">
                  <FilterBar
                    filters={filterOptions}
                    onFilterChange={setFilters}
                    onSortChange={(value) => setSortBy(value)}
                    sortOptions={sortOptions}
                    searchPlaceholder="Search tasks..."
                    onSearch={(term) => console.log('Search:', term)}
                  />
                </div>
              }
            >
              <DataTable
                columns={columns}
                data={tasks}
                onSort={(columnId) => {
                  setSortBy(columnId);
                }}
                sortColumn={sortBy}
                sortDirection="desc"
                onRowClick={(row) => console.log('Row clicked:', row)}
                emptyMessage={
                  <EmptyState
                    icon="📋"
                    title="No tasks in queue"
                    description="Add your first task to get started"
                    actionLabel="Add New Task"
                    onAction={() => setShowAddTask(true)}
                    actionIcon={<FaPlus />}
                  />
                }
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bot Status */}
            <Card title="Bot Fleet Status">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <KPICard
                    title="Available"
                    value={availableBots.length}
                    color="green"
                    subtitle="Ready for tasks"
                  />
                  <KPICard
                    title="Working"
                    value={busyBots.length}
                    color="yellow"
                    subtitle="Currently active"
                  />
                  <KPICard
                    title="Charging"
                    value={chargingBots.length}
                    color="blue"
                    subtitle="At charging station"
                  />
                  <KPICard
                    title="Error"
                    value={errorBots.length}
                    color="red"
                    subtitle="Requiring attention"
                  />
                </div>

                {/* Available Bots */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Available Bots</h4>
                  {availableBots.length === 0 ? (
                    <p className="text-sm text-gray-500">No bots available</p>
                  ) : (
                    <div className="space-y-2">
                      {availableBots.slice(0, 3).map(bot => (
                        <div key={bot.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="font-medium text-sm">{bot.name}</span>
                          <span className="text-xs text-gray-600">{bot.battery}% battery</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Working Bots */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Currently Working</h4>
                  {busyBots.length === 0 ? (
                    <p className="text-sm text-gray-500">No bots working</p>
                  ) : (
                    <div className="space-y-2">
                      {busyBots.slice(0, 3).map(bot => (
                        <div key={bot.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div>
                            <span className="font-medium text-sm block">{bot.name}</span>
                            <span className="text-xs text-gray-600 truncate max-w-[120px]">
                              {bot.currentTask}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">{bot.speed.toFixed(1)} m/s</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Assignment History */}
            <Card title="Assignment History" icon={<FaHistory />}>
              {assignmentHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No assignments yet</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {assignmentHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-lg text-sm ${
                        item.type === 'success' ? 'bg-green-50 border border-green-200' :
                        item.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className={`font-medium ${
                          item.type === 'success' ? 'text-green-700' :
                          item.type === 'warning' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {item.message}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Bots: {item.botsAvailable} • Tasks: {item.tasksPending}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Assignment Logic Info */}
            <Card
              title="Assignment Logic"
              className="bg-blue-50 border border-blue-200"
            >
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-2" />
                  <span>Checks for idle bots with &gt;30% battery</span>
                </li>
                <li className="flex items-start">
                  <FaClock className="text-blue-500 mt-1 mr-2" />
                  <span>Runs every 3 seconds when enabled</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-500 mt-1 mr-2" />
                  <span>Prioritizes High priority tasks first</span>
                </li>
                <li className="flex items-start">
                  <FaRobotIcon className="text-purple-500 mt-1 mr-2" />
                  <span>FIFO for tasks with same priority</span>
                </li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Current Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    availableBots.length > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {availableBots.length > 0 
                      ? `${availableBots.length} bot${availableBots.length !== 1 ? 's' : ''} ready` 
                      : 'All bots busy'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Explanation of "All Bots Active" Scenario */}
        <Card 
          title="⚡ What Happens When All 10 Bots Are Active?"
          className="mt-8 bg-yellow-50 border border-yellow-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Current Scenario:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>{busyBots.length} bots</strong> are currently active/working</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>{pendingTasks.length} tasks</strong> are waiting in queue</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Auto-assignment checks every <strong>3 seconds</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Bots need <strong>&gt;30% battery</strong> to accept new tasks</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Queue Behavior:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>When all bots are busy, tasks wait in queue</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>As bots complete tasks, they become available</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Auto-assignment immediately assigns to next available bot</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Priority tasks are assigned first when bots free up</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-700">
              💡 <strong>Try it:</strong> Click "Free Bot" to manually make a bot available, or wait for auto-completion in 3-second intervals.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TaskManagementPage;