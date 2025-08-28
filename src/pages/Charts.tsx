import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Snapshot } from '../types';
import { fetchSnapshots } from '../lib/dataReader';
import { formatCurrency, formatDateShort } from '../lib/utils';

interface ChartDataPoint {
  date: string;
  invested: number;
  marketValue: number;
  unrealizedPL: number;
}

function Charts() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSnapshots();
        setSnapshots(data);
        
        // Extract unique symbols from snapshots
        const symbols = new Set<string>();
        data.forEach(snapshot => {
          snapshot.positions.forEach(position => {
            symbols.add(position.symbol);
          });
        });
        const symbolList = Array.from(symbols).sort();
        setAvailableSymbols(symbolList);
        setSelectedSymbols(symbolList); // Default to all symbols selected
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load snapshots');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filterDataByTimeRange = (data: Snapshot[]) => {
    if (timeRange === 'all') return data;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '24h':
        cutoff.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
    }
    
    return data.filter(snapshot => new Date(snapshot.ts) >= cutoff);
  };

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const toggleAllSymbols = () => {
    setSelectedSymbols(prev => 
      prev.length === availableSymbols.length ? [] : [...availableSymbols]
    );
  };

  const getFilteredSnapshots = (data: Snapshot[]) => {
    if (selectedSymbols.length === 0) return data;
    
    return data.map(snapshot => ({
      ...snapshot,
      total_quote_invested: snapshot.positions
        .filter(p => selectedSymbols.includes(p.symbol))
        .reduce((sum, p) => sum + parseFloat(p.total_cost), 0).toString(),
      total_market_value: snapshot.positions
        .filter(p => selectedSymbols.includes(p.symbol))
        .reduce((sum, p) => sum + parseFloat(p.market_value), 0).toString(),
      total_unrealized_pl: snapshot.positions
        .filter(p => selectedSymbols.includes(p.symbol))
        .reduce((sum, p) => sum + parseFloat(p.unrealized_pl), 0).toString(),
      positions: snapshot.positions.filter(p => selectedSymbols.includes(p.symbol))
    }));
  };

  const chartData: ChartDataPoint[] = getFilteredSnapshots(filterDataByTimeRange(snapshots)).map(snapshot => ({
    date: formatDateShort(snapshot.ts),
    invested: parseFloat(snapshot.total_quote_invested),
    marketValue: parseFloat(snapshot.total_market_value),
    unrealizedPL: parseFloat(snapshot.total_unrealized_pl),
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">No chart data available</p>
      </div>
    );
  }

  const latestSnapshot = snapshots[snapshots.length - 1];
  const baseCurrency = latestSnapshot?.base_currency || 'USDC';

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <h2 className="text-lg font-medium text-gray-900">Portfolio Performance</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    timeRange === range
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Symbol Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Filter by Assets</h3>
            <button
              onClick={toggleAllSymbols}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {selectedSymbols.length === availableSymbols.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSymbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => toggleSymbol(symbol)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedSymbols.includes(symbol)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {selectedSymbols.length} of {availableSymbols.length} assets selected
          </div>
        </div>

        {/* Current Stats */}
        {latestSnapshot && chartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(chartData[chartData.length - 1].invested, baseCurrency)}
              </p>
              <p className="text-sm text-gray-500">Total Invested</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(chartData[chartData.length - 1].marketValue, baseCurrency)}
              </p>
              <p className="text-sm text-gray-500">Market Value</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-semibold ${
                chartData[chartData.length - 1].unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(chartData[chartData.length - 1].unrealizedPL, baseCurrency)}
              </p>
              <p className="text-sm text-gray-500">Unrealized P/L</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value, baseCurrency),
                  name === 'invested' ? 'Invested' : 
                  name === 'marketValue' ? 'Market Value' : 'P/L'
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px' 
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="invested"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Invested"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="marketValue"
                stroke="#10b981"
                strokeWidth={2}
                name="Market Value"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="unrealizedPL"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Unrealized P/L"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Charts;