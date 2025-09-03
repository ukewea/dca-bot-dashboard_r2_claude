import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Charts = lazy(() => import('./pages/Charts'));
const Transactions = lazy(() => import('./pages/Transactions'));
const About = lazy(() => import('./pages/About'));
import { ThemeProvider } from './lib/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { I18nProvider, useI18n } from './lib/I18nContext';
import LanguageToggle from './components/LanguageToggle';

function Navigation() {
  const location = useLocation();
  const { t } = useI18n();
  
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
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/charts"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/charts') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {t('nav.charts')}
              </Link>
              <Link
                to="/transactions"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/transactions') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {t('nav.transactions')}
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/about') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {t('nav.about')}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  // Use Vite's injected BASE_URL for subpath hosting; strip trailing slash
  const rawBase = import.meta.env.BASE_URL || '/';
  const basename = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');
  
  return (
    <I18nProvider>
      <ThemeProvider>
        <Router basename={basename}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div></div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
