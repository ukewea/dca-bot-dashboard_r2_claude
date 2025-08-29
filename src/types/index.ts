export interface Position {
  symbol: string;
  open_quantity?: string;
  open_qty?: number;
  total_cost: string;
  avg_cost?: string;
  price?: string;
  market_value?: string;
  unrealized_pl?: string;
}

export interface PositionsData {
  updated_at: string;
  base_currency: string;
  total_quote_invested: string;
  positions: Position[];
}

export interface ComputedPosition {
  symbol: string;
  open_quantity: string;
  total_cost: string;
  avg_cost: string;
  price: string;
  market_value: string;
  unrealized_pl: string;
}

export interface ComputedPortfolio {
  base_currency: string;
  total_quote_invested: string;
  total_market_value: string;
  total_unrealized_pl: string;
  positions: ComputedPosition[];
  last_updated: string;
}

export interface PriceData {
  ts: string;
  symbol: string;
  price: string;
  source?: string;
  iteration_id?: string;
}

export interface Transaction {
  ts: string;
  exchange?: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: string;
  qty: string;
  quote_spent: string;
  order_type?: string;
  iteration_id?: string;
  filters_validated?: boolean;
  notes?: string;
}

export interface Iteration {
  iteration_id: string;
  started_at: string;
  ended_at?: string;
  assets_total?: number;
  buys_executed?: number;
  status: string;
  notes?: string;
}

export interface AppConfig {
  dataBasePath: string;
}