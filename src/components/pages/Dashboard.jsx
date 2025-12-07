// pages/DashboardOverview.jsx (simplified using common components)
import React from 'react';
import { useGlobalState } from '../../context/GlobalContext';
import { 
  FaRobot, FaTasks, FaPlayCircle, FaExclamationTriangle, FaClock, 
  FaChartLine, FaBolt, FaCheckCircle 
} from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import StatsGrid from '../common/StatsGrid';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import BotStatusIndicator from '../common/BotStatusIndicator';
import Button from '../common/button';
import ProgressBar from '../common/progressBar';

const BotDashboardOverview = () => {
  const { state, actions } = useGlobalState();
  const { bots, tasks, lastUpdate } = state;

  // Calculate metrics
  const metrics = {
    totalBots: bots.length,
    activeTasks: bots.filter(b => b.status === 'busy').length,
    idleBots: bots.filter(b => b.status === 'idle').length,
    errorBots: bots.filter(b => b.status === 'error').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
  };

  // Stats for StatsGrid
  const stats = [
    {
      title: 'Total Bots',
      value: metrics.totalBots,
      icon: <FaRobot size={24} />,
      change: '+12%',
      isPositive: true,
      subtitle: 'Registered in fleet',
      color: 'blue'
    },
    {
      title: 'Active Tasks',
      value: metrics.activeTasks,
      icon: <FaTasks size={24} />,
      change: '-5%',
      isPositive: false,
      subtitle: 'Currently executing',
      color: 'green'
    },
    {
      title: 'Idle Bots',
      value: metrics.idleBots,
      icon: <FaPlayCircle size={24} />,
      change: '+8%',
      isPositive: false,
      subtitle: 'Available for work',
      color: 'yellow'
    },
    {
      title: 'Bots in Error',
      value: metrics.errorBots,
      icon: <FaExclamationTriangle size={24} />,
      change: '-2%',
      isPositive: true,
      subtitle: 'Requiring attention',
      color: 'red'
    },
    {
      title: 'Pending Tasks',
      value: metrics.pendingTasks,
      icon: <FaClock size={24} />,
      change: '+15%',
      isPositive: false,
      subtitle: 'Waiting in queue',
      color: 'purple'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with common component */}
        <PageHeader
          title="Bot Dashboard"
          subtitle="Overview of your bot fleet performance"
          lastUpdated={lastUpdate}
          stats={[
            { label: 'Total Bots', value: metrics.totalBots, color: '#3B82F6' },
            { label: 'Available', value: metrics.idleBots, color: '#10B981' },
            { label: 'Tasks Pending', value: metrics.pendingTasks, color: '#F59E0B' }
          ]}
        >
          <Button
            variant="primary"
            icon={<FaChartLine />}
          >
            Generate Report
          </Button>
          <Button
            variant="outline"
            icon={<FaCheckCircle />}
            onClick={actions.updateBotData}
          >
            Refresh
          </Button>
        </PageHeader>

        {/* Stats Grid with common component */}
        <StatsGrid 
          stats={stats}
          columns={5}
          onCardClick={(stat) => console.log('Card clicked:', stat.title)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bot Status Distribution */}
          <Card
            title="Bot Status Distribution"
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <ProgressBar
                value={Math.round((metrics.activeTasks / metrics.totalBots) * 100)}
                label="Active Bots"
                color="green"
                showLabel={true}
              />
              <ProgressBar
                value={Math.round((metrics.idleBots / metrics.totalBots) * 100)}
                label="Idle Bots"
                color="yellow"
                showLabel={true}
              />
              <ProgressBar
                value={Math.round((metrics.errorBots / metrics.totalBots) * 100)}
                label="Error Bots"
                color="red"
                showLabel={true}
              />
            </div>
          </Card>

          {/* Quick Stats */}
          <Card title="Quick Stats">
            <div className="space-y-4">
              {bots.slice(0, 4).map(bot => (
                <BotStatusIndicator
                  key={bot.id}
                  bot={bot}
                  size="sm"
                  showName={true}
                  showBattery={true}
                  showStatus={true}
                  onClick={() => console.log('Bot clicked:', bot.name)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          className="mt-6"
          actions={
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          }
        >
          <div className="space-y-3">
            {bots.slice(0, 5).map(bot => (
              <div key={bot.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusBadge status={bot.status} size="sm" showIcon />
                  <span className="font-medium">{bot.name}</span>
                  <span className="text-gray-500 text-sm">{bot.currentTask || 'No task'}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(bot.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BotDashboardOverview;