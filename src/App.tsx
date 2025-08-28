import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Transactions from './pages/Transactions';
import { ThemeProvider } from './lib/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Crypto DCA Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/charts"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/charts') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Charts
              </Link>
              <Link
                to="/transactions"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/transactions') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                Transactions
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/transactions" element={<Transactions />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;