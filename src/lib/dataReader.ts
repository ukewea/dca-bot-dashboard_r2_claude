import { PositionsData, Snapshot, PriceData, Transaction, Iteration, AppConfig } from '../types';

const getConfig = (): AppConfig => {
  const config = (window as any).__APP_CONFIG__;
  return {
    dataBasePath: config?.dataBasePath || (import.meta.env?.VITE_DATA_BASE_PATH as string) || '/data'
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

export const fetchSnapshots = async (): Promise<Snapshot[]> => {
  const config = getConfig();
  const response = await fetch(`${config.dataBasePath}/snapshots.ndjson`);
  if (!response.ok) {
    throw new Error(`Failed to fetch snapshots: ${response.statusText}`);
  }
  const text = await response.text();
  return parseNDJSON<Snapshot>(text);
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