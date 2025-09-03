import { PositionsData, PriceData, Transaction, Iteration, AppConfig, ComputedPortfolio, ComputedPosition } from '../types';

// Re-export Transaction type for use in other components
export type { Transaction };

const joinUrl = (base: string, path: string): string => {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
};

const getConfig = (): AppConfig => {
  const config = (window as any).__APP_CONFIG__;
  const baseUrl = (import.meta.env?.BASE_URL as string) || '/';
  const defaultData = joinUrl(baseUrl, 'data');
  return {
    dataBasePath: config?.dataBasePath || (import.meta.env?.VITE_DATA_BASE_PATH as string) || defaultData
  };
};

export const fetchPositionsData = async (): Promise<PositionsData> => {
  const config = getConfig();
  const response = await fetch(`${config.dataBasePath}/positions_current.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch positions data: ${response.statusText}`);
  }
  return response.json();
};

export const parseNDJSON = <T>(text: string): T[] => {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line) as T;
      } catch (error) {
        console.warn('Failed to parse NDJSON line:', line, error);
        return null;
      }
    })
    .filter((item): item is T => item !== null);
};

export const fetchPrices = async (): Promise<PriceData[]> => {
  const config = getConfig();
  const response = await fetch(`${config.dataBasePath}/prices.ndjson`);
  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.statusText}`);
  }
  const text = await response.text();
  return parseNDJSON<PriceData>(text);
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const config = getConfig();
  const response = await fetch(`${config.dataBasePath}/transactions.ndjson`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  const text = await response.text();
  return parseNDJSON<Transaction>(text);
};

export const fetchIterations = async (): Promise<Iteration[]> => {
  const config = getConfig();
  const response = await fetch(`${config.dataBasePath}/iterations.ndjson`);
  if (!response.ok) {
    throw new Error(`Failed to fetch iterations: ${response.statusText}`);
  }
  const text = await response.text();
  return parseNDJSON<Iteration>(text);
};

// Transaction replay functions using high-precision decimal arithmetic
export interface ReplayedPosition {
  symbol: string;
  open_quantity: string;
  total_cost: string;
  avg_cost: string;
}

export interface ReplayedPortfolio {
  base_currency: string;
  total_quote_invested: string;
  positions: ReplayedPosition[];
  last_transaction_time?: string;
}

// High-precision decimal arithmetic helpers
const addDecimals = (a: string, b: string): string => {
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  const result = aNum + bNum;
  return result.toFixed(8); // Use 8 decimal places for precision
};

const divideDecimals = (a: string, b: string): string => {
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  if (bNum === 0) return '0';
  const result = aNum / bNum;
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

export const replayTransactionsToPortfolio = async (): Promise<ReplayedPortfolio> => {
  try {
    const transactions = await fetchTransactions();
    
    if (transactions.length === 0) {
      throw new Error('No transactions found in transactions.ndjson');
    }

    // Group transactions by symbol and aggregate
    const positionMap = new Map<string, { totalQty: string; totalCost: string }>();
    let totalInvested = '0';
    let baseCurrency = 'USDC'; // Default
    let lastTransactionTime: string | undefined;

    for (const tx of transactions) {
      // Only process BUY transactions
      if (tx.side === 'BUY') {
        totalInvested = addDecimals(totalInvested, tx.quote_spent);
        lastTransactionTime = tx.ts;

        // Extract base currency from symbol (e.g., BTCUSDC -> USDC)
        if (tx.symbol.endsWith('USDC')) {
          baseCurrency = 'USDC';
        } else if (tx.symbol.endsWith('USDT')) {
          baseCurrency = 'USDT';
        }

        const existing = positionMap.get(tx.symbol) || { totalQty: '0', totalCost: '0' };
        positionMap.set(tx.symbol, {
          totalQty: addDecimals(existing.totalQty, tx.qty),
          totalCost: addDecimals(existing.totalCost, tx.quote_spent)
        });
      }
    }

    // Convert to positions array
    const positions: ReplayedPosition[] = Array.from(positionMap.entries()).map(([symbol, data]) => {
      const avgCost = divideDecimals(data.totalCost, data.totalQty);
      return {
        symbol,
        open_quantity: data.totalQty,
        total_cost: data.totalCost,
        avg_cost: avgCost
      };
    });

    return {
      base_currency: baseCurrency,
      total_quote_invested: totalInvested,
      positions,
      last_transaction_time: lastTransactionTime
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to fetch transactions')) {
      throw new Error('Transaction replay failed: transactions.ndjson file is missing or inaccessible');
    }
    throw error;
  }
};

// Get latest prices by symbol from prices.ndjson
const getLatestPrices = async (): Promise<Map<string, string>> => {
  try {
    const prices = await fetchPrices();
    const latestPrices = new Map<string, string>();
    
    // Get the most recent price for each symbol
    for (const priceData of prices) {
      const existing = latestPrices.get(priceData.symbol);
      if (!existing || new Date(priceData.ts) > new Date(existing.split('|')[1] || '0')) {
        latestPrices.set(priceData.symbol, `${priceData.price}|${priceData.ts}`);
      }
    }
    
    // Extract just the prices
    const result = new Map<string, string>();
    latestPrices.forEach((value, key) => {
      result.set(key, value.split('|')[0]);
    });
    
    return result;
  } catch (error) {
    console.warn('Could not fetch latest prices, market values will be unavailable');
    return new Map();
  }
};

// Main function to compute portfolio from transactions with market data
export const computePortfolioFromTransactions = async (): Promise<ComputedPortfolio> => {
  const replayedPortfolio = await replayTransactionsToPortfolio();
  const latestPrices = await getLatestPrices();
  
  let totalMarketValue = '0';
  let totalUnrealizedPL = '0';
  
  const computedPositions: ComputedPosition[] = replayedPortfolio.positions.map(position => {
    const latestPrice = latestPrices.get(position.symbol) || '0';
    const marketValue = multiplyDecimals(position.open_quantity, latestPrice);
    const unrealizedPL = subtractDecimals(marketValue, position.total_cost);
    
    // Add to totals
    totalMarketValue = addDecimals(totalMarketValue, marketValue);
    totalUnrealizedPL = addDecimals(totalUnrealizedPL, unrealizedPL);
    
    return {
      symbol: position.symbol,
      open_quantity: position.open_quantity,
      total_cost: position.total_cost,
      avg_cost: position.avg_cost,
      price: latestPrice,
      market_value: marketValue,
      unrealized_pl: unrealizedPL
    };
  });
  
  return {
    base_currency: replayedPortfolio.base_currency,
    total_quote_invested: replayedPortfolio.total_quote_invested,
    total_market_value: totalMarketValue,
    total_unrealized_pl: totalUnrealizedPL,
    positions: computedPositions,
    last_updated: replayedPortfolio.last_transaction_time || new Date().toISOString()
  };
};

// Interface for time-series chart data
export interface ChartDataPoint {
  date: string;
  invested: number;
  marketValue: number;
  unrealizedPL: number;
  timestamp: string;
}

// Create time-series data by replaying transactions chronologically
export const generateTimeSeriesFromTransactions = async (): Promise<ChartDataPoint[]> => {
  try {
    const transactions = await fetchTransactions();
    const prices = await fetchPrices();
    
    if (transactions.length === 0) {
      return [];
    }

    // Sort transactions by timestamp
    const sortedTransactions = transactions
      .filter(tx => tx.side === "BUY")
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

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
  } catch (error) {
    console.error("Failed to generate time series from transactions:", error);
    return [];
  }
};
