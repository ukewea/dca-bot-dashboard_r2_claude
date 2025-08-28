import { useState, useEffect } from 'react';
import { PositionsData, Snapshot } from '../types';
import { fetchPositionsData, fetchSnapshots } from '../lib/dataReader';
import { formatCurrency, formatPLColor, formatDate } from '../lib/utils';

function Dashboard() {
  const [positions, setPositions] = useState<PositionsData | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [positionsData, snapshotsData] = await Promise.all([
          fetchPositionsData(),
          fetchSnapshots()
        ]);
        setPositions(positionsData);
        if (snapshotsData.length > 0) {
          setLatestSnapshot(snapshotsData[snapshotsData.length - 1]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  if (!positions) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">No data available</p>
      </div>
    );
  }

  const totalInvested = parseFloat(positions.total_quote_invested);
  const totalMarketValue = latestSnapshot ? parseFloat(latestSnapshot.total_market_value) : 0;
  const totalUnrealizedPL = latestSnapshot ? parseFloat(latestSnapshot.total_unrealized_pl) : 0;
  
  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalInvested, positions.base_currency)}
            </p>
            <p className="text-sm text-gray-500">Total Invested</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalMarketValue, positions.base_currency)}
            </p>
            <p className="text-sm text-gray-500">Market Value</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${formatPLColor(totalUnrealizedPL)}`}>
              {totalUnrealizedPL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPL, positions.base_currency)}
            </p>
            <p className="text-sm text-gray-500">Unrealized P/L</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {positions.positions.length}
            </p>
            <p className="text-sm text-gray-500">Assets</p>
            <p className="text-xs text-gray-500 mt-1">
              Updated: {formatDate(positions.updated_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Current Positions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  P/L
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {positions.positions.map((position, index) => {
                const quantity = parseFloat(position.open_quantity || '0') || parseFloat(position.open_qty?.toString() || '0');
                const totalCost = parseFloat(position.total_cost);
                const avgCost = position.avg_cost ? parseFloat(position.avg_cost) : (quantity > 0 ? totalCost / quantity : 0);
                
                // Get market data from latest snapshot
                const snapshotPosition = latestSnapshot?.positions.find(p => p.symbol === position.symbol);
                const lastPrice = snapshotPosition ? parseFloat(snapshotPosition.price) : 0;
                const marketValue = snapshotPosition ? parseFloat(snapshotPosition.market_value) : 0;
                const unrealizedPL = snapshotPosition ? parseFloat(snapshotPosition.unrealized_pl) : 0;
                
                return (
                  <tr key={`${position.symbol}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{position.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quantity.toFixed(6)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(avgCost, positions.base_currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(totalCost, positions.base_currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lastPrice > 0 ? formatCurrency(lastPrice, positions.base_currency) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {marketValue > 0 ? formatCurrency(marketValue, positions.base_currency) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${formatPLColor(unrealizedPL)}`}>
                        {unrealizedPL !== 0 ? (
                          <>
                            {unrealizedPL > 0 ? '+' : ''}{formatCurrency(unrealizedPL, positions.base_currency)}
                          </>
                        ) : '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;