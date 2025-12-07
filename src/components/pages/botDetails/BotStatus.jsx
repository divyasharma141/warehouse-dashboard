import React, { useEffect, useState } from 'react';
import { useGlobalState } from '../../../context/GlobalContext';
import BotCard from './BotCard';
// Import common components
import PageHeader from '../../common/PageHeader';
import StatsGrid from '../../common/StatsGrid';
import Card from '../../common/Card';
import FilterBar from '../../common/filterBar';
import EmptyState from '../../common/EmptyState';
import Button from '../../common/button';
import { 
  FaPause, 
  FaBolt, 
  FaSync, 
  FaRobot,
  FaPlayCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

const BotStatusPage = () => {
  const { state, actions } = useGlobalState();
  const { bots, lastUpdate } = state;
  const [sortBy, setSortBy] = useState('status');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const interval = setInterval(() => {
      actions.updateBotData();
    }, 10000); // Auto-refresh every 10 seconds

    return () => clearInterval(interval);
  }, [actions]);

  // Filter and sort bots
  const filteredBots = bots.filter(bot => {
    if (filterStatus === 'all') return true;
    return bot.status === filterStatus;
  });

  const sortedBots = [...filteredBots].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'battery':
        return b.battery - a.battery;
      case 'status':
        const statusOrder = { 'busy': 0, 'idle': 1, 'charging': 2, 'error': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  // Calculate statistics
  const activeBots = bots.filter(bot => bot.status === 'busy');
  const idleBots = bots.filter(bot => bot.status === 'idle');
  const chargingBots = bots.filter(bot => bot.status === 'charging');
  const errorBots = bots.filter(bot => bot.status === 'error');

  const totalBots = bots.length;
  const avgBattery = totalBots > 0 
    ? Math.round(bots.reduce((sum, bot) => sum + bot.battery, 0) / totalBots)
    : 0;

  const lowBatteryBots = bots.filter(bot => bot.battery < 30).length;

  const handleSetAllIdle = () => {
    bots.forEach(bot => {
      if (bot.status !== 'charging' && bot.status !== 'error') {
        actions.updateBot(bot.id, { 
          status: 'idle', 
          currentTask: 'None', 
          speed: 0 
        });
      }
    });
  };

  const handleChargeAll = () => {
    bots.forEach(bot => {
      if (bot.status !== 'error') {
        actions.updateBot(bot.id, { 
          status: 'charging', 
          currentTask: 'None', 
          speed: 0 
        });
      }
    });
  };

  // Stats for StatsGrid
  const stats = [
    {
      title: 'Total Bots',
      value: totalBots,
      icon: <FaRobot size={24} />,
      subtitle: 'In fleet',
      color: 'blue'
    },
    {
      title: 'Active',
      value: activeBots.length,
      icon: <FaPlayCircle size={24} />,
      subtitle: `${totalBots > 0 ? Math.round((activeBots.length / totalBots) * 100) : 0}% of fleet`,
      color: 'green'
    },
    {
      title: 'Idle',
      value: idleBots.length,
      icon: <FaPause size={24} />,
      subtitle: 'Available for tasks',
      color: 'yellow'
    },
    {
      title: 'Charging',
      value: chargingBots.length,
      icon: <FaBolt size={24} />,
      subtitle: `Avg battery: ${avgBattery}%`,
      color: 'blue'
    },
    {
      title: 'Error',
      value: errorBots.length,
      icon: <FaExclamationTriangle size={24} />,
      subtitle: `${lowBatteryBots} with low battery`,
      color: 'red'
    }
  ];

  // Filter options
  const filterOptions = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'busy', label: 'Active' },
        { value: 'idle', label: 'Idle' },
        { value: 'charging', label: 'Charging' },
        { value: 'error', label: 'Error' }
      ]
    }
  ];

  // Sort options
  const sortOptions = [
    { value: 'status', label: 'Status' },
    { value: 'name', label: 'Name' },
    { value: 'battery', label: 'Battery' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with common component */}
        <PageHeader
          title="Bot Fleet Status"
          subtitle="Real-time monitoring of all bots in your fleet"
          lastUpdated={lastUpdate}
          stats={[
            { label: 'Total', value: totalBots, color: '#3B82F6' },
            { label: 'Active', value: activeBots.length, color: '#10B981' },
            { label: 'Available', value: idleBots.length, color: '#F59E0B' }
          ]}
        >
          <Button
            variant="warning"
            icon={<FaPause />}
            onClick={handleSetAllIdle}
          >
            Set All Idle
          </Button>
          <Button
            variant="primary"
            icon={<FaBolt />}
            onClick={handleChargeAll}
          >
            Charge All
          </Button>
          <Button
            variant="success"
            icon={<FaSync />}
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

        {/* Filters and Controls */}
        <FilterBar
          filters={filterOptions}
          onFilterChange={(filters) => setFilterStatus(filters.status || 'all')}
          onSortChange={(value) => setSortBy(value)}
          sortOptions={sortOptions}
          defaultSort="status"
          searchPlaceholder="Search bots..."
          onSearch={(term) => console.log('Search:', term)}
        />

        {/* Bot Grid */}
        {sortedBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {sortedBots.map(bot => (
              <BotCard 
                key={bot.id} 
                bot={bot}
                onUpdate={() => actions.updateBot(bot.id, { 
                  status: 'idle', 
                  currentTask: 'None', 
                  speed: 0 
                })}
                onCharge={() => actions.updateBot(bot.id, { 
                  status: 'charging', 
                  currentTask: 'None', 
                  speed: 0 
                })}
                onAssignTask={() => {
                  if (state.tasks.length > 0) {
                    const task = state.tasks[0];
                    actions.updateBot(bot.id, { 
                      status: 'busy', 
                      currentTask: `${task.pickup} → ${task.drop}`, 
                      speed: Math.random() * 3 + 1 
                    });
                    actions.removeTask(task.id);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <EmptyState
              icon="🤖"
              title="No Bots Match Your Filters"
              description="Try changing your filter settings"
              actionLabel="Show All Bots"
              onAction={() => setFilterStatus('all')}
            />
          </Card>
        )}

        {/* Status Legend */}
        <Card 
          title="Status Legend"
          className="mt-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <div className="font-medium">Active (Busy)</div>
                <div className="text-sm text-gray-500">Performing tasks</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <div className="font-medium">Idle (Available)</div>
                <div className="text-sm text-gray-500">Ready for tasks</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <div className="font-medium">Charging</div>
                <div className="text-sm text-gray-500">At charging station</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <div>
                <div className="font-medium">Error/Issue</div>
                <div className="text-sm text-gray-500">Requires attention</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BotStatusPage;