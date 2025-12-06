import React from 'react';
import { 
  FaBolt, 
  FaRunning, 
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaExclamationTriangle,
  FaPause,
  FaPlay,
  FaTasks,
  FaWifi,
  FaStop
} from 'react-icons/fa';

import Card from '../../common/Card';
import Button from '../../common/button';
import ProgressBar from '../../common/progressBar';
import StatusBadge from '../../common/StatusBadge';

const BotCard = ({ bot, onUpdate, onCharge, onAssignTask }) => {
  // Simple status configuration
  const getStatusConfig = (status) => {
    const configs = {
      busy: {
        label: 'Active',
        color: 'green',
        icon: <FaRunning className="text-green-600" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      },
      idle: {
        label: 'Idle',
        color: 'yellow',
        icon: <FaPause className="text-yellow-600" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300'
      },
      charging: {
        label: 'Charging',
        color: 'blue',
        icon: <FaBolt className="text-blue-600" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
      },
      error: {
        label: 'Error',
        color: 'red',
        icon: <FaExclamationTriangle className="text-red-600" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
      }
    };
    
    return configs[status] || configs.idle;
  };

  // Simple battery icon selector
  const getBatteryIcon = (percentage) => {
    if (percentage >= 75) return <FaBatteryFull className="text-green-500" />;
    if (percentage >= 50) return <FaBatteryFull className="text-green-400" />;
    if (percentage >= 25) return <FaBatteryHalf className="text-yellow-500" />;
    return <FaBatteryQuarter className="text-red-500" />;
  };

  // Get battery color
  const getBatteryColor = (percentage) => {
    if (percentage >= 75) return 'green';
    if (percentage >= 50) return 'green';
    if (percentage >= 25) return 'yellow';
    return 'red';
  };

  // Simple time formatting
  const formatTime = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  // Calculate simple health score
  const getHealthScore = () => {
    let score = bot.battery; // Start with battery percentage
    
    // Adjust based on status
    if (bot.status === 'error') score -= 30;
    if (bot.status === 'charging' && bot.battery < 20) score -= 10;
    if (bot.status === 'busy' && bot.battery < 30) score -= 15;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  };

  const status = getStatusConfig(bot.status);
  const healthScore = getHealthScore();
  const batteryIcon = getBatteryIcon(bot.battery);
  const batteryColor = getBatteryColor(bot.battery);
  const lastUpdated = formatTime(bot.lastUpdated);

  return (
    <Card
      className={`border ${status.borderColor} hover:shadow-md transition-shadow`}
      hoverable={true}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${status.bgColor}`}>
            {status.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{bot.name}</h3>
            <p className="text-sm text-gray-500">ID: {bot.id}</p>
          </div>
        </div>
        <StatusBadge 
          status={bot.status} 
          size="sm" 
          showIcon={false}
        />
      </div>

      {/* Health Bar */}
      <div className="mb-4">
        <ProgressBar
          value={Math.round(healthScore)}
          label="Health"
          color={
            healthScore >= 70 ? 'green' :
            healthScore >= 40 ? 'yellow' : 'red'
          }
          size="md"
          showValue={true}
        />
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        {/* Battery */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {batteryIcon}
            <span className="text-sm text-gray-600">Battery</span>
          </div>
          <span className={`text-sm font-bold text-${batteryColor}-600`}>
            {bot.battery}%
          </span>
        </div>

        {/* Task */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaTasks className="text-gray-400" />
            <span className="text-sm text-gray-600">Task</span>
          </div>
          <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {bot.currentTask || 'None'}
          </span>
        </div>

        {/* Speed (if active) */}
        {bot.status === 'busy' && bot.speed > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaRunning className="text-green-400" />
              <span className="text-sm text-gray-600">Speed</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {bot.speed.toFixed(1)} m/s
            </span>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 mb-4">
        Updated: {lastUpdated}
        {bot.status === 'busy' && (
          <span className="ml-2 inline-flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
            Active
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {/* Set Idle/Stop */}
        {(bot.status === 'busy' || bot.status === 'error') && (
          <Button
            variant="secondary"
            size="sm"
            fullWidth={true}
            icon={<FaStop size={12} />}
            onClick={onUpdate}
          >
            {bot.status === 'error' ? 'Reset' : 'Stop'}
          </Button>
        )}

        {/* Assign Task */}
        {bot.status === 'idle' && bot.battery > 20 && (
          <Button
            variant="success"
            size="sm"
            fullWidth={true}
            icon={<FaPlay size={12} />}
            onClick={onAssignTask}
          >
            Start Task
          </Button>
        )}

        {/* Charge */}
        {(bot.status === 'idle' || bot.status === 'busy') && bot.battery < 80 && (
          <Button
            variant="primary"
            size="sm"
            fullWidth={true}
            icon={<FaBolt size={12} />}
            onClick={onCharge}
          >
            Charge
          </Button>
        )}

        {/* Activate from charging */}
        {bot.status === 'charging' && bot.battery >= 90 && (
          <Button
            variant="success"
            size="sm"
            fullWidth={true}
            icon={<FaPlay size={12} />}
            onClick={onUpdate}
          >
            Activate
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BotCard;