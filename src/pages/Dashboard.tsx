import { useState, useEffect } from 'react';
import { ComputedPortfolio } from '../types';
import { computePortfolioFromTransactions } from '../lib/dataReader';
import { formatCurrency, formatPLColor, formatDate } from '../lib/utils';

function Dashboard() {
  const [portfolio, setPortfolio] = useState<ComputedPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const computedPortfolio = await computePortfolioFromTransactions();
        setPortfolio(computedPortfolio);
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

  if (!portfolio) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">No data available</p>
      </div>
    );
  }

  const totalInvested = parseFloat(portfolio.total_quote_invested);
  const totalMarketValue = parseFloat(portfolio.total_market_value);
  const totalUnrealizedPL = parseFloat(portfolio.total_unrealized_pl);
  
  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalInvested, portfolio.base_currency)}
            </p>
            <p className="text-sm text-gray-500">Total Invested</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalMarketValue, portfolio.base_currency)}
            </p>
            <p className="text-sm text-gray-500">Market Value</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${formatPLColor(totalUnrealizedPL)}`}>
              {totalUnrealizedPL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPL, portfolio.base_currency)}
            </p>
            <p className="text-sm text-gray-500">Unrealized P/L</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolio.positions.length}
            </p>
            <p className="text-sm text-gray-500">Assets</p>
            <p className="text-xs text-gray-500 mt-1">
              Updated: {formatDate(portfolio.last_updated)}
            </p>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Current Positions</h2>
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
              {portfolio.positions.map((position, index) => {
                const quantity = parseFloat(position.open_quantity);
                const totalCost = parseFloat(position.total_cost);
                const avgCost = parseFloat(position.avg_cost);
                const lastPrice = parseFloat(position.price);
                const marketValue = parseFloat(position.market_value);
                const unrealizedPL = parseFloat(position.unrealized_pl);
                
                return (
                  <tr key={`${position.symbol}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{position.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{quantity.toFixed(6)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {formatCurrency(avgCost, portfolio.base_currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {formatCurrency(totalCost, portfolio.base_currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {lastPrice > 0 ? formatCurrency(lastPrice, portfolio.base_currency) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {marketValue > 0 ? formatCurrency(marketValue, portfolio.base_currency) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${formatPLColor(unrealizedPL)}`}>
                        {unrealizedPL !== 0 ? (
                          <>
                            {unrealizedPL > 0 ? '+' : ''}{formatCurrency(unrealizedPL, portfolio.base_currency)}
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