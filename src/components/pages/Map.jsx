import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUpload, 
  FaPlay, 
  FaPause, 
  FaSync, 
  FaMapMarkedAlt,
  FaDownload,
  FaBolt,
  FaExclamationTriangle,
  FaTasks,
  FaRunning,
  FaRobot as FaRobotIcon
} from 'react-icons/fa';
import { useGlobalState } from '../../context/GlobalContext';
// Import common components
import PageHeader from '../common/PageHeader';
import Card from '../common/Card';
import StatsGrid from '../common/StatsGrid';
import StatusBadge from '../common/StatusBadge';
import BotStatusIndicator from '../common/BotStatusIndicator';
import Button from '../common/button';
import KPICard from '../common/KPICard';

const MapPage = () => {
  const { state } = useGlobalState();
  const { bots, lastUpdate } = state;
  
  const [svgFile, setSvgFile] = useState(null);
  const [svgContent, setSvgContent] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [botPositions, setBotPositions] = useState({});
  const [selectedBot, setSelectedBot] = useState(null);
  const containerRef = useRef(null);

  // Initialize bot positions based on their status
  useEffect(() => {
    const initialPositions = {};
    bots.forEach(bot => {
      // Start position based on bot ID (for consistency)
      const baseX = 20 + ((bot.id - 1) % 3) * 30;
      const baseY = 20 + Math.floor((bot.id - 1) / 3) * 20;
      
      // Add some random variation
      initialPositions[bot.id] = {
        x: baseX + Math.random() * 10,
        y: baseY + Math.random() * 10,
        direction: Math.random() * 360,
        // Speed based on bot status
        speed: bot.status === 'busy' ? (0.5 + Math.random() * 0.5) : 
               bot.status === 'idle' ? (0.1 + Math.random() * 0.2) :
               bot.status === 'charging' ? 0.05 :
               bot.status === 'error' ? 0 : 0.3,
        // Movement pattern based on status
        movementPattern: bot.status === 'busy' ? 'active' : 
                        bot.status === 'charging' ? 'stationary' : 
                        bot.status === 'error' ? 'error' : 'wandering'
      };
    });
    setBotPositions(initialPositions);
  }, [bots]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      setSvgFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSvgContent(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload an SVG file');
    }
  };

  // Bot movement simulation based on real bot status
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBotPositions(prevPositions => {
        const newPositions = { ...prevPositions };
        
        bots.forEach(bot => {
          if (!newPositions[bot.id]) return;
          
          const position = newPositions[bot.id];
          let newX = position.x;
          let newY = position.y;
          let newDirection = position.direction;
          let newSpeed = position.speed;

          // Update speed based on bot status
          if (bot.status === 'busy' && bot.speed > 0) {
            newSpeed = 0.5 + (bot.speed * 0.2); // Scale speed for map
          } else if (bot.status === 'charging') {
            newSpeed = 0.05; // Very slow when charging
          } else if (bot.status === 'error') {
            newSpeed = 0; // No movement when in error
          } else if (bot.status === 'idle') {
            newSpeed = 0.1 + Math.random() * 0.2;
          }

          // Movement behavior based on status
          switch (bot.status) {
            case 'busy':
              // Active bots move purposefully
              if (Math.random() < 0.3) {
                newDirection += (Math.random() - 0.5) * 60;
              }
              break;
              
            case 'idle':
              // Idle bots wander randomly
              newDirection += (Math.random() - 0.5) * 90;
              break;
              
            case 'charging':
              // Charging bots stay near charging stations (bottom area)
              if (newY > 70) {
                newDirection = 270 + (Math.random() - 0.5) * 60; // Point upward
              }
              break;
              
            case 'error':
              // Error bots don't move
              newSpeed = 0;
              break;
          }

          // Calculate new position
          const dx = Math.cos(newDirection * Math.PI / 180) * newSpeed * simulationSpeed;
          const dy = Math.sin(newDirection * Math.PI / 180) * newSpeed * simulationSpeed;
          
          newX += dx;
          newY += dy;

          // Boundary checks (keep within 5-95%)
          if (newX < 5) {
            newX = 5;
            newDirection = 180 - newDirection;
          } else if (newX > 95) {
            newX = 95;
            newDirection = 180 - newDirection;
          }
          
          if (newY < 5) {
            newY = 5;
            newDirection = -newDirection;
          } else if (newY > 95) {
            newY = 95;
            newDirection = -newDirection;
          }

          // Special zones based on bot status
          if (bot.status === 'charging' && newY < 70 && Math.random() < 0.1) {
            // Move toward charging area
            newDirection = 270 + (Math.random() - 0.5) * 30;
          }

          newPositions[bot.id] = {
            x: newX,
            y: newY,
            direction: newDirection,
            speed: newSpeed,
            movementPattern: position.movementPattern
          };
        });

        return newPositions;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed, bots]);

  // Reset bot positions
  const resetBots = () => {
    const newPositions = {};
    bots.forEach(bot => {
      const baseX = 20 + ((bot.id - 1) % 3) * 30;
      const baseY = 20 + Math.floor((bot.id - 1) / 3) * 20;
      
      newPositions[bot.id] = {
        x: baseX + Math.random() * 10,
        y: baseY + Math.random() * 10,
        direction: Math.random() * 360,
        speed: bot.status === 'busy' ? (0.5 + Math.random() * 0.5) : 0.1,
        movementPattern: 'wandering'
      };
    });
    setBotPositions(newPositions);
  };

  // Get bot status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'busy': return '#10B981'; // Green
      case 'idle': return '#F59E0B'; // Yellow
      case 'charging': return '#3B82F6'; // Blue
      case 'error': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'busy': return <FaRunning />;
      case 'idle': return <FaRobotIcon />;
      case 'charging': return <FaBolt />;
      case 'error': return <FaExclamationTriangle />;
      default: return <FaRobotIcon />;
    }
  };

  // Get bot size based on battery level
  const getBotSize = (battery) => {
    if (battery >= 80) return 'w-12 h-12';
    if (battery >= 60) return 'w-11 h-11';
    if (battery >= 40) return 'w-10 h-10';
    if (battery >= 20) return 'w-9 h-9';
    return 'w-8 h-8';
  };

  // Get bot opacity based on battery level
  const getBotOpacity = (battery) => {
    if (battery >= 80) return 'opacity-100';
    if (battery >= 60) return 'opacity-90';
    if (battery >= 40) return 'opacity-80';
    if (battery >= 20) return 'opacity-70';
    return 'opacity-60';
  };

  // Download sample warehouse SVG
  const downloadSampleSVG = () => {
    const sampleSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Warehouse Background -->
  <rect width="800" height="600" fill="#f8fafc"/>
  
  <!-- Warehouse Structure -->
  <rect x="50" y="50" width="700" height="500" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
  
  <!-- Storage Areas -->
  <rect x="100" y="100" width="200" height="150" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <text x="200" y="180" text-anchor="middle" fill="#475569" font-family="Arial" font-size="14">Storage A</text>
  
  <rect x="350" y="100" width="200" height="150" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <text x="450" y="180" text-anchor="middle" fill="#475569" font-family="Arial" font-size="14">Storage B</text>
  
  <rect x="600" y="100" width="100" height="150" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <text x="650" y="180" text-anchor="middle" fill="#475569" font-family="Arial" font-size="14">Storage C</text>
  
  <!-- Processing Areas -->
  <rect x="100" y="300" width="250" height="150" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
  <text x="225" y="380" text-anchor="middle" fill="#166534" font-family="Arial" font-size="14">Processing</text>
  
  <rect x="400" y="300" width="200" height="150" fill="#fef3c7" stroke="#fde68a" stroke-width="1"/>
  <text x="500" y="380" text-anchor="middle" fill="#92400e" font-family="Arial" font-size="14">Packaging</text>
  
  <!-- Charging Stations -->
  <rect x="650" y="300" width="100" height="100" fill="#dbeafe" stroke="#93c5fd" stroke-width="1"/>
  <text x="700" y="355" text-anchor="middle" fill="#1e40af" font-family="Arial" font-size="14" font-weight="bold">⚡</text>
  <text x="700" y="380" text-anchor="middle" fill="#1e40af" font-family="Arial" font-size="12">Charging</text>
  
  <!-- Loading Docks -->
  <rect x="50" y="200" width="40" height="100" fill="#94a3b8"/>
  <text x="70" y="255" text-anchor="middle" fill="white" font-family="Arial" font-size="12">Dock 1</text>
  
  <rect x="50" y="350" width="40" height="100" fill="#94a3b8"/>
  <text x="70" y="405" text-anchor="middle" fill="white" font-family="Arial" font-size="12">Dock 2</text>
  
  <!-- Aisles -->
  <rect x="310" y="100" width="40" height="400" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="330" y="300" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="12" transform="rotate(90,330,300)">Main Aisle</text>
  
  <rect x="560" y="100" width="40" height="400" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  
  <!-- Legend -->
  <rect x="620" y="20" width="160" height="200" fill="white" stroke="#cbd5e1" stroke-width="1" rx="8"/>
  <text x="700" y="45" text-anchor="middle" fill="#334155" font-family="Arial" font-size="16" font-weight="bold">LEGEND</text>
  
  <circle cx="640" cy="75" r="6" fill="#10B981"/>
  <text x="660" y="79" fill="#334155" font-family="Arial" font-size="12">Active (Busy)</text>
  
  <circle cx="640" cy="105" r="6" fill="#F59E0B"/>
  <text x="660" y="109" fill="#334155" font-family="Arial" font-size="12">Idle</text>
  
  <circle cx="640" cy="135" r="6" fill="#3B82F6"/>
  <text x="660" y="139" fill="#334155" font-family="Arial" font-size="12">Charging</text>
  
  <circle cx="640" cy="165" r="6" fill="#EF4444"/>
  <text x="660" y="169" fill="#334155" font-family="Arial" font-size="12">Error</text>
  
  <rect x="634" cy="185" width="12" height="12" fill="#e2e8f0"/>
  <text x="660" y="194" fill="#334155" font-family="Arial" font-size="12">Storage Area</text>
  
  <rect x="634" cy="215" width="12" height="12" fill="#dcfce7"/>
  <text x="660" y="224" fill="#334155" font-family="Arial" font-size="12">Work Area</text>
</svg>`;

    const blob = new Blob([sampleSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'warehouse-map.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Statistics
  const activeBots = bots.filter(b => b.status === 'busy').length;
  const idleBots = bots.filter(b => b.status === 'idle').length;
  const chargingBots = bots.filter(b => b.status === 'charging').length;
  const errorBots = bots.filter(b => b.status === 'error').length;
  const avgBattery = Math.round(bots.reduce((sum, b) => sum + b.battery, 0) / bots.length);

  // Stats for header
  const headerStats = [
    { label: 'Total Bots', value: bots.length, color: '#3B82F6' },
    { label: 'Active', value: activeBots, color: '#10B981' },
    { label: 'Avg Battery', value: `${avgBattery}%`, color: '#F59E0B' }
  ];

  // Stats grid data
  const stats = [
    {
      title: 'Active Bots',
      value: activeBots,
      icon: <FaRunning size={20} />,
      subtitle: 'Currently working',
      color: 'green'
    },
    {
      title: 'Idle Bots',
      value: idleBots,
      icon: <FaRobotIcon size={20} />,
      subtitle: 'Available for tasks',
      color: 'yellow'
    },
    {
      title: 'Charging',
      value: chargingBots,
      icon: <FaBolt size={20} />,
      subtitle: 'At charging stations',
      color: 'blue'
    },
    {
      title: 'Error',
      value: errorBots,
      icon: <FaExclamationTriangle size={20} />,
      subtitle: 'Requiring attention',
      color: 'red'
    }
  ];

  // Custom MapBot Component
  const MapBot = ({ bot, position, isSelected, onClick }) => {
    const statusColor = getStatusColor(bot.status);
    
    return (
      <div
        className={`absolute transition-all duration-300 ${getBotOpacity(bot.battery)} ${
          isSelected ? 'z-50' : 'z-10'
        }`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={onClick}
      >
        <div className="relative">
          {/* Bot Circle */}
          <div 
            className={`${getBotSize(bot.battery)} rounded-full flex items-center justify-center shadow-lg transform hover:scale-125 transition-all duration-200 ${
              isSelected ? 'ring-4 ring-offset-2' : ''
            }`}
            style={{ 
              backgroundColor: statusColor,
              border: `3px solid ${bot.battery < 20 ? '#EF4444' : '#FFFFFF'}`,
              boxShadow: isSelected ? `0 0 20px ${statusColor}80` : undefined
            }}
          >
            <div className="text-white">
              {getStatusIcon(bot.status)}
            </div>
          </div>
          
          {/* Battery Indicator */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full"
              style={{ 
                width: `${bot.battery}%`,
                backgroundColor: bot.battery > 50 ? '#10B981' : 
                              bot.battery > 20 ? '#F59E0B' : '#EF4444'
              }}
            ></div>
          </div>
          
          {/* Bot Info Popup */}
          {isSelected && (
            <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-3 rounded-lg shadow-xl min-w-[200px] z-50">
              <div className="font-bold text-center mb-2">{bot.name}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium" style={{ color: statusColor }}>
                    <StatusBadge status={bot.status} size="sm" showIcon />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Battery:</span>
                  <span className="font-medium">{bot.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Task:</span>
                  <span className="font-medium truncate max-w-[120px]">
                    {bot.currentTask || 'None'}
                  </span>
                </div>
                {bot.speed > 0 && (
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-medium">{bot.speed.toFixed(1)} m/s</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span className="font-medium">
                    {position.x.toFixed(1)}%, {position.y.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Direction Indicator */}
          <div 
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent"
            style={{ 
              borderTopColor: statusColor,
              transform: `translate(-50%, 0) rotate(${position.direction}deg)`
            }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with common component */}
        <PageHeader
          title="Warehouse Map Visualization"
          subtitle={`Real-time bot movements based on actual status • ${bots.length} bots total`}
          lastUpdated={lastUpdate}
          stats={headerStats}
        >
          <Button
            variant="primary"
            icon={<FaDownload />}
            onClick={downloadSampleSVG}
          >
            Get Sample Layout
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <Card
              title="Warehouse Map"
              actions={
                <div className="flex flex-wrap gap-3">
                  <label className="cursor-pointer">
                    <Button
                      variant="success"
                      icon={<FaUpload />}
                    >
                      Upload SVG
                    </Button>
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {svgFile && (
                    <span className="text-gray-700 text-sm flex items-center">
                      {svgFile.name}
                    </span>
                  )}
                  <Button
                    variant={isPlaying ? 'danger' : 'success'}
                    icon={isPlaying ? <FaPause /> : <FaPlay />}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    variant="primary"
                    icon={<FaSync />}
                    onClick={resetBots}
                  >
                    Reset Positions
                  </Button>
                </div>
              }
            >
              {/* Bot Stats */}
              <StatsGrid 
                stats={stats}
                columns={4}
                className="mb-6"
              />

              {/* Speed Control */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Simulation Speed: {simulationSpeed}x
                  <span className="text-sm text-gray-500 ml-2">(Active bots move faster)</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Map Container */}
              <div 
                ref={containerRef}
                className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200"
              >
                {/* SVG Background */}
                {svgContent ? (
                  <div
                    className="absolute inset-0"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center p-8">
                      <FaMapMarkedAlt className="mx-auto text-gray-300" size={64} />
                      <p className="text-gray-500 mt-4">No warehouse layout loaded</p>
                      <p className="text-gray-400 text-sm">
                        Upload an SVG or use the sample layout to see bots in context
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={downloadSampleSVG}
                      >
                        Download Sample Layout
                      </Button>
                    </div>
                  </div>
                )}

                {/* Render Bots */}
                {bots.map(bot => {
                  const position = botPositions[bot.id];
                  if (!position) return null;
                  
                  return (
                    <MapBot
                      key={bot.id}
                      bot={bot}
                      position={position}
                      isSelected={selectedBot === bot.id}
                      onClick={() => setSelectedBot(bot.id === selectedBot ? null : bot.id)}
                    />
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div>
            {/* Bot List */}
            <Card title="Bot Fleet Status">
              <div className="space-y-3">
                {bots.map(bot => {
                  const position = botPositions[bot.id];
                  const isSelected = selectedBot === bot.id;
                  
                  return (
                    <div 
                      key={bot.id} 
                      className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? 'border-2 border-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedBot(bot.id === selectedBot ? null : bot.id)}
                    >
                      <BotStatusIndicator
                        bot={bot}
                        size="sm"
                        showName={true}
                        showBattery={true}
                        showStatus={true}
                      />
                      {position && (
                        <div className="text-xs text-gray-500 mt-2">
                          Position: {position.x.toFixed(0)}%, {position.y.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Status Legend */}
            <Card title="Status Legend" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#10B981' }}></div>
                  <div className="flex-1">
                    <span className="font-medium">Active (Busy)</span>
                    <p className="text-xs text-gray-500">Moving with purpose, performing tasks</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#F59E0B' }}></div>
                  <div className="flex-1">
                    <span className="font-medium">Idle</span>
                    <p className="text-xs text-gray-500">Available, wandering randomly</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#3B82F6' }}></div>
                  <div className="flex-1">
                    <span className="font-medium">Charging</span>
                    <p className="text-xs text-gray-500">At charging station, slow movement</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#EF4444' }}></div>
                  <div className="flex-1">
                    <span className="font-medium">Error</span>
                    <p className="text-xs text-gray-500">Stationary, requires attention</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Instructions */}
            <Card 
              title="How It Works"
              className="mt-6 bg-blue-50 border border-blue-200"
            >
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Bots move based on their <strong>real status</strong> from dashboard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Active bots move faster with purpose</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Charging bots stay near charging areas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Error bots remain stationary</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Click any bot for detailed info</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Upload your own warehouse SVG layout</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8">
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard
                title="Total Bots"
                value={bots.length}
                color="blue"
                subtitle="In fleet"
              />
              <KPICard
                title="Currently Active"
                value={activeBots}
                color="green"
                subtitle="Working now"
              />
              <KPICard
                title="Avg Battery"
                value={`${avgBattery}%`}
                color="yellow"
                subtitle="Fleet average"
              />
              <KPICard
                title="Simulation"
                value={isPlaying ? 'Live' : 'Paused'}
                color="purple"
                subtitle="Status"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapPage;