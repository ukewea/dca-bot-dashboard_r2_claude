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
import { ChartDataPoint, generateTimeSeriesFromTransactions, fetchTransactions, Transaction, fetchPrices } from '../lib/dataReader';
import { formatCurrency, formatDateShort } from '../lib/utils';
import { useI18n } from '../lib/I18nContext';


function Charts() {
  const { t, lang } = useI18n();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

  // Function to generate time series with symbol filtering
  const generateFilteredTimeSeries = async (symbolFilter: string[]): Promise<ChartDataPoint[]> => {
    if (symbolFilter.length === 0) return [];
    
    const transactions = allTransactions.filter(tx => symbolFilter.includes(tx.symbol));
    const prices = await fetchPrices();
    
    if (transactions.length === 0) {
      return [];
    }

    // Sort transactions by timestamp
    const sortedTransactions = transactions
      .filter(tx => tx.side === "BUY")
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    // Helper functions for decimal arithmetic
    const addDecimals = (a: string, b: string): string => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      const result = aNum + bNum;
      return result.toFixed(8);
    };

    const multiplyDecimals = (a: string, b: string): string => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      const result = aNum * bNum;
      return result.toFixed(8);
    };

    const subtractDecimals = (a: string, b: string): string => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      const result = aNum - bNum;
      return result.toFixed(8);
    };

    // Group transactions by day to create data points
    const dailyGroups = new Map<string, Transaction[]>();
    
    for (const tx of sortedTransactions) {
      const date = new Date(tx.ts).toISOString().split("T")[0]; // YYYY-MM-DD
      if (!dailyGroups.has(date)) {
        dailyGroups.set(date, []);
      }
      dailyGroups.get(date)!.push(tx);
    }

    const chartData: ChartDataPoint[] = [];
    const runningPositions = new Map<string, { qty: string; cost: string }>();
    let runningInvested = "0";

    // Process each day
    for (const [date, dayTransactions] of Array.from(dailyGroups.entries()).sort()) {
      // Process all transactions for this day
      for (const tx of dayTransactions) {
        runningInvested = addDecimals(runningInvested, tx.quote_spent);
        
        const existing = runningPositions.get(tx.symbol) || { qty: "0", cost: "0" };
        runningPositions.set(tx.symbol, {
          qty: addDecimals(existing.qty, tx.qty),
          cost: addDecimals(existing.cost, tx.quote_spent)
        });
      }

      // Calculate market value using the latest available price for each symbol at this date
      let totalMarketValue = "0";
      const endOfDay = new Date(date + "T23:59:59Z");
      
      for (const [symbol, position] of runningPositions.entries()) {
        // Find the most recent price for this symbol up to this date
        const relevantPrices = prices
          .filter(p => p.symbol === symbol && new Date(p.ts) <= endOfDay)
          .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
        
        if (relevantPrices.length > 0) {
          const latestPrice = relevantPrices[0].price;
          const marketValue = multiplyDecimals(position.qty, latestPrice);
          totalMarketValue = addDecimals(totalMarketValue, marketValue);
        }
      }

      const unrealizedPL = subtractDecimals(totalMarketValue, runningInvested);
      
      chartData.push({
        date,
        invested: parseFloat(runningInvested),
        marketValue: parseFloat(totalMarketValue),
        unrealizedPL: parseFloat(unrealizedPL),
        timestamp: date + "T12:00:00Z" // Noon UTC for consistent display
      });
    }

    return chartData;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all transactions and symbols first
        const transactions = await fetchTransactions();
        setAllTransactions(transactions);
        
        const symbols = Array.from(new Set(transactions.map(t => t.symbol))).sort();
        setAvailableSymbols(symbols);
        setSelectedSymbols(symbols); // Default to all symbols selected
        
        // Generate initial chart data with all symbols
        const data = await generateTimeSeriesFromTransactions();
        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Regenerate chart data when selected symbols change
  useEffect(() => {
    if (allTransactions.length > 0 && availableSymbols.length > 0) {
      const updateChartData = async () => {
        try {
          const filteredData = await generateFilteredTimeSeries(selectedSymbols);
          setChartData(filteredData);
        } catch (err) {
          console.error('Failed to update chart data:', err);
        }
      };
      
      updateChartData();
    }
  }, [selectedSymbols, allTransactions]);

  const filterDataByTimeRange = (data: ChartDataPoint[]) => {
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
    
    return data.filter(point => new Date(point.timestamp) >= cutoff);
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

  const filteredChartData = filterDataByTimeRange(chartData).map(point => ({
    ...point,
    date: formatDateShort(point.timestamp)
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

  if (chartData.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">{t('charts.empty')}</p>
      </div>
    );
  }

  const baseCurrency = 'USDC'; // Default currency

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('charts.title')}</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    timeRange === range
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t(`charts.range.${range}`)}
                </button>
              ))}
            </div>
          </div>
        </div>



        {/* Symbol Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('charts.filter.title')}</h3>
            <button
              onClick={toggleAllSymbols}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {selectedSymbols.length === availableSymbols.length ? t('charts.filter.deselectAll') : t('charts.filter.selectAll')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSymbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => toggleSymbol(symbol)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedSymbols.includes(symbol)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {lang === 'zh-TW'
              ? `已選 ${selectedSymbols.length} ／ ${availableSymbols.length} 個資產`
              : `${selectedSymbols.length} of ${availableSymbols.length} assets selected`}
          </div>
        </div>
        {/* Current Stats */}
        {filteredChartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('kpi.totalInvested')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(filteredChartData[filteredChartData.length - 1].invested, baseCurrency)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('kpi.marketValue')}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(filteredChartData[filteredChartData.length - 1].marketValue, baseCurrency)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('kpi.unrealizedPL')}</p>
              <p className={`text-xl font-bold ${
                filteredChartData[filteredChartData.length - 1].unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(filteredChartData[filteredChartData.length - 1].unrealizedPL, baseCurrency)}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <LineChart data={filteredChartData}>
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
                  name // Use the name directly since Line components already have proper names
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
                name={t('charts.legend.invested')}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="marketValue"
                stroke="#10b981"
                strokeWidth={2}
                name={t('charts.legend.marketValue')}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="unrealizedPL"
                stroke="#f59e0b"
                strokeWidth={2}
                name={t('charts.legend.unrealizedPL')}
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
