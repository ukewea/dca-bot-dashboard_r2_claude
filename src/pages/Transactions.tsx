import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { fetchTransactions } from '../lib/dataReader';
import { formatCurrency, formatDate } from '../lib/utils';

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
        
        // Extract unique symbols
        const symbols = Array.from(new Set(data.map(t => t.symbol))).sort();
        setAvailableSymbols(symbols);
        
        setFilteredTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedSymbol === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.symbol === selectedSymbol));
    }
  }, [selectedSymbol, transactions]);

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

  const totalSpent = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.quote_spent), 0);
  const averagePrice = filteredTransactions.length > 0 
    ? filteredTransactions.reduce((sum, t) => sum + parseFloat(t.price), 0) / filteredTransactions.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            <p className="text-sm text-gray-500">Total Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalSpent, 'USDC')}
            </p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {availableSymbols.length}
            </p>
            <p className="text-sm text-gray-500">Assets Traded</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {averagePrice > 0 ? formatCurrency(averagePrice, 'USDC') : '-'}
            </p>
            <p className="text-sm text-gray-500">Avg Price</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-md font-medium text-gray-900">Filter Transactions</h3>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Assets</option>
            {availableSymbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exchange
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction, index) => (
                <tr key={`${transaction.ts}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(transaction.ts)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.side === 'BUY' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.side}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(transaction.price, 'USDC')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{parseFloat(transaction.qty).toFixed(6)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.quote_spent, 'USDC')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {transaction.exchange?.replace('_', ' ').toUpperCase() || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;