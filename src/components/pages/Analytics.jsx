import React, { useState, useEffect } from 'react';
import { 
  FaCalendar,
  FaFilter,
  FaDownload,
  FaRobot,
  FaTasks,
  FaClock,
  FaBolt,
  FaExclamationTriangle,
  FaPlayCircle,
  FaPause,
  FaCheckCircle,
  FaChartLine,
  FaTachometerAlt,
  FaCogs
} from 'react-icons/fa';
import { useGlobalState } from '../../context/GlobalContext';
// Import common components
import PageHeader from '../common/PageHeader';
import StatsGrid from '../common/StatsGrid';
import Card from '../common/Card';
import Button from '../common/button';
import FilterBar from '../common/filterBar';
import DataTable from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';

const AnalyticsPage = () => {
  const { state } = useGlobalState();
  const { bots, tasks, lastUpdate } = state;
  const [timeRange, setTimeRange] = useState('week');
  const [selectedBot, setSelectedBot] = useState('all');
  const [chartData, setChartData] = useState({
    botUtilization: { labels: [], data: [] },
    statusDistribution: { labels: [], data: [] },
    batteryDistribution: { labels: [], data: [] },
    priorityDistribution: { labels: [], data: [] },
    dailyTasks: { labels: [], completed: [], pending: [] }
  });

  // Calculate metrics on every render
  const calculateMetrics = () => {
    const totalBots = bots.length;
    const busyBots = bots.filter(b => b.status === 'busy').length;
    const idleBots = bots.filter(b => b.status === 'idle').length;
    const chargingBots = bots.filter(b => b.status === 'charging').length;
    const errorBots = bots.filter(b => b.status === 'error').length;
    
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    const avgBattery = totalBots > 0 
      ? Math.round(bots.reduce((sum, bot) => sum + bot.battery, 0) / totalBots)
      : 0;
    
    const botUtilization = totalBots > 0 
      ? Math.round((busyBots / totalBots) * 100)
      : 0;
    
    const errorRate = totalBots > 0
      ? Math.round((errorBots / totalBots) * 100)
      : 0;
    
    // Calculate average task time
    const activeSpeeds = bots.filter(b => b.status === 'busy' && b.speed > 0)
      .map(b => b.speed);
    const avgSpeed = activeSpeeds.length > 0
      ? activeSpeeds.reduce((sum, speed) => sum + speed, 0) / activeSpeeds.length
      : 0;
    const avgTaskTime = avgSpeed > 0 ? Math.round(60 / avgSpeed) : 0;
    
    // Calculate task completion rate
    const completedTasks = bots.filter(b => b.lastCompletedTask).length;
    const taskCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / (totalTasks + completedTasks)) * 100)
      : 0;

    return {
      totalBots,
      busyBots,
      idleBots,
      chargingBots,
      errorBots,
      totalTasks,
      pendingTasks,
      avgBattery,
      botUtilization,
      errorRate,
      avgTaskTime,
      taskCompletionRate,
      completedTasks,
      avgSpeed,
      availableBots: idleBots
    };
  };

  // Generate chart data
  const generateChartData = () => {
    const metrics = calculateMetrics();
    
    // Bot utilization by unit
    const botUtilizationData = {
      labels: bots.slice(0, 6).map(bot => bot.name),
      data: bots.slice(0, 6).map(bot => {
        let utilization = 0;
        if (bot.status === 'busy') utilization = 90 + (Math.random() * 10);
        else if (bot.status === 'idle') utilization = 20 + (bot.battery / 5);
        else if (bot.status === 'charging') utilization = 50;
        else if (bot.status === 'error') utilization = 10;
        return Math.round(utilization);
      })
    };

    // Task priority distribution
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(task => {
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });
    const totalPriorityTasks = Object.values(priorityCounts).reduce((a, b) => a + b, 0);
    
    const priorityDistribution = {
      labels: ['High', 'Medium', 'Low'],
      data: totalPriorityTasks > 0 
        ? [
            Math.round((priorityCounts.High / totalPriorityTasks) * 100),
            Math.round((priorityCounts.Medium / totalPriorityTasks) * 100),
            Math.round((priorityCounts.Low / totalPriorityTasks) * 100)
          ]
        : [30, 50, 20]
    };

    // Bot status distribution
    const statusDistribution = {
      labels: ['Active', 'Idle', 'Charging', 'Error'],
      data: metrics.totalBots > 0 ? [
        Math.round((metrics.busyBots / metrics.totalBots) * 100),
        Math.round((metrics.idleBots / metrics.totalBots) * 100),
        Math.round((metrics.chargingBots / metrics.totalBots) * 100),
        Math.round((metrics.errorBots / metrics.totalBots) * 100)
      ] : [0, 0, 0, 0]
    };

    // Battery level distribution
    const batteryLevels = [0, 0, 0, 0];
    bots.forEach(bot => {
      if (bot.battery < 20) batteryLevels[0]++;
      else if (bot.battery < 50) batteryLevels[1]++;
      else if (bot.battery < 80) batteryLevels[2]++;
      else batteryLevels[3]++;
    });
    
    const batteryDistribution = {
      labels: ['<20%', '20-50%', '50-80%', '>80%'],
      data: metrics.totalBots > 0
        ? batteryLevels.map(count => Math.round((count / metrics.totalBots) * 100))
        : [10, 20, 40, 30]
    };

    // Daily trends
    const now = new Date();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndex = now.getDay();
    const dailyTasks = {
      labels: [...days.slice(dayIndex), ...days.slice(0, dayIndex)],
      completed: days.map(() => {
        const base = metrics.completedTasks / 7;
        return Math.round(base * (0.8 + Math.random() * 0.4));
      }),
      pending: days.map(() => {
        const base = metrics.pendingTasks;
        return Math.round(base * (0.5 + Math.random() * 0.5));
      })
    };

    return {
      botUtilization: botUtilizationData,
      priorityDistribution,
      statusDistribution,
      batteryDistribution,
      dailyTasks,
      metrics
    };
  };

  // Update chart data periodically
  useEffect(() => {
    const updateData = () => {
      const newData = generateChartData();
      setChartData(newData);
    };

    updateData();
    const interval = setInterval(updateData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [bots, tasks]);

  const metrics = calculateMetrics();
  const data = generateChartData();

  // Bar chart component (simplified)
  const BarChart = ({ data, title, color = 'blue', showValues = true }) => {
    const maxValue = Math.max(...data.data);
    
    return (
      <Card title={title}>
        <div className="flex items-end space-x-2 h-48 mt-4">
          {data.data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-3/4 bg-${color}-500 rounded-t-lg transition-all duration-300`}
                style={{ height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
              ></div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                {data.labels[index]}
              </div>
              {showValues && (
                <div className="text-xs font-bold mt-1">{value}%</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Pie chart component (simplified)
  const PieChart = ({ data, title, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] }) => {
    const total = data.data.reduce((sum, val) => sum + val, 0);
    
    return (
      <Card title={title}>
        <div className="flex flex-col lg:flex-row items-center">
          <div className="relative w-48 h-48 mb-6 lg:mb-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {data.data.map((value, index) => {
                if (value === 0) return null;
                
                const percentage = (value / total) * 100;
                let startAngle = 0;
                for (let i = 0; i < index; i++) {
                  startAngle += (data.data[i] / total) * 360;
                }
                const angle = (percentage / 100) * 360;
                const largeArc = angle > 180 ? 1 : 0;
                
                const x1 = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
                const y1 = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
                const endAngle = startAngle + angle;
                const x2 = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
                const y2 = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
              <circle cx="50" cy="50" r="15" fill="white" />
            </svg>
          </div>
          
          <div className="lg:ml-8 space-y-3">
            {data.labels.map((label, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-3"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-gray-700 flex-1">{label}</span>
                <span className="font-bold">{data.data[index]}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  // Line chart component (simplified)
  const LineChart = ({ data, title }) => {
    const maxValue = Math.max(...data.completed, ...data.pending);
    
    return (
      <Card title={title}>
        <div className="h-48 relative mt-4">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 25, 50, 75, 100].map(percent => (
              <div key={percent} className="border-t border-gray-100"></div>
            ))}
          </div>
          
          {/* Data bars */}
          <div className="absolute inset-0 flex items-end">
            {data.completed.map((value, index) => {
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center mx-1"
                >
                  <div 
                    className="w-3/4 bg-green-500 rounded-t-lg transition-all duration-300"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1">
                    {data.labels[index]}
                  </div>
                  <div className="text-xs font-bold mt-1">{value}</div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Bot performance table
  const BotPerformanceTable = () => {
    const columns = [
      {
        id: 'name',
        label: 'Bot',
        sortable: true,
        render: (value, row) => (
          <div className="flex items-center">
            <FaRobot className="text-gray-400 mr-2" />
            <span className="font-medium">{value}</span>
          </div>
        )
      },
      {
        id: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value} size="sm" />
      },
      {
        id: 'battery',
        label: 'Battery',
        sortable: true,
        render: (value) => (
          <div className="flex items-center">
            {value >= 80 ? <FaCheckCircle className="text-green-500 mr-2" /> :
             value >= 50 ? <FaCheckCircle className="text-yellow-500 mr-2" /> :
             value >= 20 ? <FaCheckCircle className="text-orange-500 mr-2" /> :
             <FaExclamationTriangle className="text-red-500 mr-2" />}
            <span className="font-medium">{value}%</span>
          </div>
        )
      },
      {
        id: 'currentTask',
        label: 'Current Task',
        sortable: true,
        render: (value) => (
          <div className="max-w-xs truncate">{value || 'None'}</div>
        )
      },
      {
        id: 'speed',
        label: 'Speed',
        sortable: true,
        render: (value) => (
          <span className="font-medium">{value > 0 ? `${value.toFixed(1)} m/s` : '-'}</span>
        )
      },
      {
        id: 'lastUpdated',
        label: 'Last Updated',
        sortable: true,
        render: (value) => (
          <span className="text-gray-500 text-sm">
            {value ? new Date(value).toLocaleTimeString() : 'N/A'}
          </span>
        )
      }
    ];

    const sortedBots = [...bots].sort((a, b) => {
      const statusOrder = { 'busy': 4, 'idle': 3, 'charging': 2, 'error': 1 };
      const statusDiff = statusOrder[b.status] - statusOrder[a.status];
      if (statusDiff !== 0) return statusDiff;
      return b.battery - a.battery;
    });

    return (
      <Card title="Bot Performance Details">
        <DataTable
          columns={columns}
          data={sortedBots}
          onRowClick={(bot) => console.log('Bot clicked:', bot.name)}
          emptyMessage={
            <EmptyState
              icon="🤖"
              title="No bot data available"
              description="Bot information will appear here"
            />
          }
        />
      </Card>
    );
  };

  // Filter options
  const filterOptions = [
    {
      id: 'timeRange',
      label: 'Time Range',
      options: [
        { value: 'day', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' }
      ]
    }
  ];

  // Sort options
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'performance', label: 'Performance' },
    { value: 'battery', label: 'Battery Level' }
  ];

  // Stats for StatsGrid - Bot Metrics
  const botStats = [
    {
      title: 'Bot Utilization',
      value: `${metrics.botUtilization}%`,
      icon: <FaTachometerAlt size={24} />,
      change: '+5%',
      isPositive: true,
      subtitle: `${metrics.busyBots}/${metrics.totalBots} bots active`,
      color: 'blue'
    },
    {
      title: 'Avg Task Time',
      value: `${metrics.avgTaskTime} min`,
      icon: <FaClock size={24} />,
      change: '-8%',
      isPositive: true,
      subtitle: `${metrics.avgSpeed.toFixed(1)} m/s avg speed`,
      color: 'green'
    },
    {
      title: 'Avg Battery',
      value: `${metrics.avgBattery}%`,
      icon: <FaBolt size={24} />,
      change: '+3%',
      isPositive: true,
      subtitle: `${metrics.idleBots} bots available`,
      color: 'purple'
    },
    {
      title: 'Error Rate',
      value: `${metrics.errorRate}%`,
      icon: <FaExclamationTriangle size={24} />,
      change: '-1.2%',
      isPositive: true,
      subtitle: `${metrics.errorBots} bots in error`,
      color: 'red'
    }
  ];

  // Stats for StatsGrid - Task Metrics
  const taskStats = [
    {
      title: 'Pending Tasks',
      value: metrics.pendingTasks,
      icon: <FaTasks size={24} />,
      change: `${Math.round((metrics.pendingTasks / (metrics.totalTasks + 1)) * 100)}% of queue`,
      isPositive: false,
      subtitle: 'Waiting for assignment',
      color: 'yellow'
    },
    {
      title: 'Completed Tasks',
      value: metrics.completedTasks,
      icon: <FaCheckCircle size={24} />,
      change: `${metrics.taskCompletionRate}% success rate`,
      isPositive: true,
      subtitle: "Today's total",
      color: 'green'
    },
    {
      title: 'Active Bots',
      value: metrics.busyBots,
      icon: <FaPlayCircle size={24} />,
      change: `${Math.round((metrics.busyBots / metrics.totalBots) * 100)}% of fleet`,
      isPositive: true,
      subtitle: 'Currently working',
      color: 'blue'
    },
    {
      title: 'Idle Bots',
      value: metrics.idleBots,
      icon: <FaPause size={24} />,
      change: `${Math.round((metrics.idleBots / metrics.totalBots) * 100)}% of fleet`,
      isPositive: false,
      subtitle: 'Available for tasks',
      color: 'gray'
    }
  ];

  // Insight cards
  const insights = [
    {
      title: 'Bot Efficiency',
      icon: <FaRobot className="text-blue-600" />,
      content: `${metrics.busyBots > 0 ? `${metrics.busyBots} bots` : 'No bots'} are currently active with an average speed of ${metrics.avgSpeed.toFixed(1)} m/s.${metrics.busyBots > 0 && metrics.avgSpeed > 2.5 ? ' Excellent performance!' : ' Monitor for improvements.'}`,
      color: 'blue'
    },
    {
      title: 'Battery Health',
      icon: <FaBolt className="text-green-600" />,
      content: `Average battery level is ${metrics.avgBattery}%.${metrics.avgBattery > 70 ? ' Good charging schedule.' : ' Consider optimizing charging cycles.'}${metrics.chargingBots > 0 && ` ${metrics.chargingBots} bots currently charging.`}`,
      color: 'green'
    },
    {
      title: 'Task Queue',
      icon: <FaTasks className="text-yellow-600" />,
      content: `${metrics.pendingTasks > 0 ? `${metrics.pendingTasks} tasks` : 'No tasks'} pending assignment.${metrics.pendingTasks > 5 && metrics.idleBots < 3 ? ' Consider adding more bots or optimizing task allocation.' : ' Queue is well-managed.'}`,
      color: 'yellow'
    },
    {
      title: 'System Health',
      icon: <FaCogs className="text-purple-600" />,
      content: `Error rate at ${metrics.errorRate}% (${metrics.errorBots} bots).${metrics.errorBots > 0 ? ' Review error logs for affected bots.' : ' System is stable.'} Bot utilization at ${metrics.botUtilization}%.`,
      color: 'purple'
    },
    {
      title: 'Alert Status',
      icon: <FaExclamationTriangle className="text-red-600" />,
      content: `${metrics.errorBots > 0 ? `⚠️ ${metrics.errorBots} bot${metrics.errorBots !== 1 ? 's' : ''} in error state.` : '✅ No critical alerts.'}${metrics.avgBattery < 30 && ' ⚠️ Low battery levels detected.'}${metrics.pendingTasks > 10 && ' ⚠️ High task queue backlog.'}`,
      color: 'red'
    },
    {
      title: 'Optimization',
      icon: <FaChartLine className="text-indigo-600" />,
      content: `${metrics.idleBots > 2 ? `${metrics.idleBots} idle bots available for task optimization.` : 'Most bots are utilized efficiently.'}${metrics.botUtilization < 60 && ' Consider increasing task allocation.'} Average task completion time: ${metrics.avgTaskTime} minutes.`,
      color: 'indigo'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with common component */}
        <PageHeader
          title="Analytics Dashboard"
          subtitle="Real-time performance metrics"
          lastUpdated={lastUpdate}
          stats={[
            { label: 'Total Bots', value: metrics.totalBots, color: '#3B82F6' },
            { label: 'Active', value: metrics.busyBots, color: '#10B981' },
            { label: 'Tasks', value: metrics.totalTasks, color: '#F59E0B' }
          ]}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <FaCalendar className="text-gray-500 mr-2" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg p-2"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="flex items-center">
              <FaFilter className="text-gray-500 mr-2" />
              <select 
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                className="border border-gray-300 rounded-lg p-2"
              >
                <option value="all">All Bots</option>
                {bots.map(bot => (
                  <option key={bot.id} value={bot.id}>{bot.name}</option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              icon={<FaDownload />}
            >
              Export Report
            </Button>
          </div>
        </PageHeader>

        {/* Filter Bar */}
        <FilterBar
          filters={filterOptions}
          onFilterChange={(filters) => console.log('Filters:', filters)}
          onSortChange={(value) => console.log('Sort:', value)}
          sortOptions={sortOptions}
          searchPlaceholder="Search analytics..."
          onSearch={(term) => console.log('Search:', term)}
        />

        {/* Bot Metrics Stats Grid */}
        <StatsGrid 
          stats={botStats}
          columns={4}
          onCardClick={(stat) => console.log('Card clicked:', stat.title)}
        />

        {/* Task Metrics Stats Grid */}
        <StatsGrid 
          stats={taskStats}
          columns={4}
          onCardClick={(stat) => console.log('Card clicked:', stat.title)}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <LineChart
            data={chartData.dailyTasks}
            title="Task Completion Trends"
          />
          <BarChart
            data={chartData.botUtilization}
            title="Bot Utilization by Unit"
            color="purple"
            showValues={false}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <PieChart
            data={chartData.statusDistribution}
            title="Bot Status Distribution"
            colors={['#10B981', '#F59E0B', '#3B82F6', '#EF4444']}
          />
          <PieChart
            data={chartData.batteryDistribution}
            title="Battery Level Distribution"
            colors={['#EF4444', '#F59E0B', '#3B82F6', '#10B981']}
          />
        </div>

        {/* Bot Performance Table */}
        <div className="mb-8">
          <BotPerformanceTable />
        </div>

        {/* Priority Distribution */}
        <div className="mb-8">
          <PieChart
            data={chartData.priorityDistribution}
            title="Task Priority Distribution"
            colors={['#EF4444', '#F59E0B', '#10B981']}
          />
        </div>

        {/* Insights Section */}
        <Card title="Performance Insights">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight, index) => (
              <Card
                key={index}
                className={`bg-${insight.color}-50 border border-${insight.color}-200`}
                hoverable={true}
              >
                <div className="flex items-center mb-3">
                  {insight.icon}
                  <h3 className="font-bold ml-2">{insight.title}</h3>
                </div>
                <p className="text-sm">{insight.content}</p>
              </Card>
            ))}
          </div>
        </Card>

        {/* Summary Stats */}
        <Card 
          title="Summary Statistics"
          className="mt-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{metrics.totalBots}</div>
              <div className="text-sm text-gray-600">Total Bots</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.busyBots}</div>
              <div className="text-sm text-gray-600">Active Now</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{metrics.taskCompletionRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;