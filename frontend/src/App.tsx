import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Sparkles, Search, GitCompare, HelpCircle, X } from 'lucide-react';
import CollegeList from './components/CollegeList';
import CollegeDetail from './components/CollegeDetail';
import Compare from './components/Compare';
import Predictor from './components/Predictor';

export interface CompareItem {
  id: number;
  name: string;
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [compareList, setCompareList] = useState<CompareItem[]>(() => {
    const saved = localStorage.getItem('compareList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleCompare = (id: number, name: string) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === id);
      if (exists) {
        return prev.filter(item => item.id !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 colleges side-by-side.');
        return prev;
      }
      return [...prev, { id, name }];
    });
  };

  const handleRemoveCompare = (id: number) => {
    setCompareList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="navbar">
          <Link to="/" className="nav-brand">
            <Sparkles size={24} style={{ color: 'var(--primary)' }} />
            <span>EduSelect</span>
          </Link>
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Search size={18} />
                <span>Search Colleges</span>
              </div>
            </NavLink>
            <NavLink to="/compare" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GitCompare size={18} />
                <span>Compare</span>
              </div>
            </NavLink>
            <NavLink to="/predict" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HelpCircle size={18} />
                <span>Rank Predictor</span>
              </div>
            </NavLink>
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <CollegeList 
                  compareList={compareList} 
                  onToggleCompare={handleToggleCompare} 
                />
              } 
            />
            <Route 
              path="/college/:id" 
              element={
                <CollegeDetail 
                  compareList={compareList} 
                  onToggleCompare={handleToggleCompare} 
                />
              } 
            />
            <Route 
              path="/compare" 
              element={
                <Compare 
                  compareList={compareList} 
                  onRemoveCompare={handleRemoveCompare}
                />
              } 
            />
            <Route path="/predict" element={<Predictor />} />
          </Routes>
        </main>

        {/* Floating comparison drawer */}
        {compareList.length > 0 && (
          <div className="comparison-drawer">
            <div className="drawer-text">
              Comparing ({compareList.length}/3)
            </div>
            <div className="drawer-items">
              {compareList.map(item => (
                <div key={item.id} className="drawer-item">
                  <span>{item.name.split('(')[0].trim()}</span>
                  <button className="drawer-item-remove" onClick={() => handleRemoveCompare(item.id)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="reset-filters-btn" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }} 
                onClick={handleClearCompare}
              >
                Clear
              </button>
              <Link 
                to={`/compare?ids=${compareList.map(i => i.id).join(',')}`} 
                className="drawer-compare-btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Compare Now
              </Link>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>© {new Date().getFullYear()} EduSelect College Discovery Platform. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/" className="footer-link">Colleges</Link>
            <Link to="/compare" className="footer-link">Compare</Link>
            <Link to="/predict" className="footer-link">Cutoff Predictor</Link>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
