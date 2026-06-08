import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowUpDown, Filter, RotateCcw } from 'lucide-react';
import type { CompareItem } from '../App';

interface College {
  id: number;
  name: string;
  type: 'Public' | 'Private';
  city: string;
  state: string;
  fees_avg: number;
  rating: number;
  logo_url: string;
  image_url: string;
  established_year: number;
  latest_avg_placement: number | null;
  latest_highest_placement: number | null;
}

interface FilterMetadata {
  states: string[];
  max_fee: number;
  course_types: string[];
  exams: string[];
}

interface CollegeListProps {
  compareList: CompareItem[];
  onToggleCompare: (id: number, name: string) => void;
}

const API_BASE = 'http://localhost:5000/api';

function CollegeList({ compareList, onToggleCompare }: CollegeListProps) {
  // Search & Filters state
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [maxFees, setMaxFees] = useState<number>(600000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);

  // Data state
  const [colleges, setColleges] = useState<College[]>([]);
  const [totalColleges, setTotalColleges] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters metadata
  const [filtersMetadata, setFiltersMetadata] = useState<FilterMetadata>({
    states: [],
    max_fee: 600000,
    course_types: [],
    exams: []
  });

  // Fetch filter options once
  useEffect(() => {
    fetch(`${API_BASE}/colleges/filters`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load filter metadata');
        return res.json();
      })
      .then((data: FilterMetadata) => {
        setFiltersMetadata(data);
        setMaxFees(data.max_fee);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch colleges list (with debouncing on search query)
  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          search,
          state: selectedState,
          type: selectedType,
          course_type: selectedCourse,
          max_fees: maxFees.toString(),
          min_rating: minRating.toString(),
          sort_by: sortBy,
          page: page.toString(),
          limit: '6'
        });

        const res = await fetch(`${API_BASE}/colleges?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch colleges data');
        const data = await res.json();
        
        setColleges(data.colleges);
        setTotalColleges(data.total);
        setTotalPages(data.total_pages);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading colleges.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchColleges();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedState, selectedType, selectedCourse, maxFees, minRating, sortBy, page]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedState, selectedType, selectedCourse, maxFees, minRating, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedState('');
    setSelectedType('');
    setSelectedCourse('');
    setMaxFees(filtersMetadata.max_fee);
    setMinRating(0);
    setSortBy('rating');
    setPage(1);
  };

  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="list-container">
      {/* Hero Search Banner */}
      <section className="hero-banner">
        <h1 className="hero-title">Discover Your Perfect College</h1>
        <p className="hero-subtitle">
          Explore top public and private Indian institutions, compare academic and placement statistics side-by-side, and predict cutoff eligibility.
        </p>
        <div className="search-bar-wrapper">
          <Search className="search-icon-main" size={22} />
          <input
            type="text"
            className="search-input-main"
            placeholder="Search by college name, city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Filter Sidebar */}
        <aside className="filters-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="filter-section-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
              <Filter size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Filters
            </span>
            <button className="theme-toggle-btn" onClick={handleResetFilters} style={{ padding: '0.35rem' }} title="Reset All Filters">
              <RotateCcw size={16} />
            </button>
          </div>

          {/* College Type Filter */}
          <div className="filter-group">
            <label>College Type</label>
            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Public">Public (Government)</option>
              <option value="Private">Private</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="filter-group">
            <label>State</label>
            <select
              className="filter-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
              {filtersMetadata.states.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Course Category Filter */}
          <div className="filter-group">
            <label>Stream / Course</label>
            <select
              className="filter-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Streams</option>
              {filtersMetadata.course_types.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Fees Slider */}
          <div className="filter-group">
            <label>Max Annual Fees: {formatCurrency(maxFees)}</label>
            <div className="range-slider-wrapper">
              <input
                type="range"
                className="fees-slider"
                min="1000"
                max={filtersMetadata.max_fee}
                step="5000"
                value={maxFees}
                onChange={(e) => setMaxFees(parseInt(e.target.value))}
              />
              <div className="slider-values">
                <span>₹1,000</span>
                <span>{formatCurrency(filtersMetadata.max_fee)}</span>
              </div>
            </div>
          </div>

          {/* Star Rating Filter */}
          <div className="filter-group">
            <label>Minimum User Rating</label>
            <div className="radio-checkbox-list">
              {[0, 4.5, 4.0, 3.5].map(rating => (
                <label key={rating} className="checkbox-label">
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                  />
                  <span>{rating === 0 ? 'Any Rating' : `${rating} ★ & above`}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Listings Panel */}
        <section className="listings-panel">
          <div className="listings-header">
            <div className="results-count">
              {loading ? 'Searching...' : `Showing ${totalColleges} colleges`}
            </div>

            <div className="sort-dropdown-wrapper">
              <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
              <label htmlFor="sort-select">Sort By:</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Overall User Rating</option>
                <option value="fees_asc">Fees: Low to High</option>
                <option value="fees_desc">Fees: High to Low</option>
                <option value="placement_avg">Average Placement Package</option>
                <option value="placement_highest">Highest Placement Package</option>
              </select>
            </div>
          </div>

          {/* API Error Handling */}
          {error && (
            <div className="empty-state" style={{ borderColor: '#ef4444' }}>
              <p className="error-message" style={{ fontSize: '1.1rem' }}>{error}</p>
              <button className="reset-filters-btn" style={{ marginTop: '1rem' }} onClick={handleResetFilters}>
                Retry Loading
              </button>
            </div>
          )}

          {/* Loading States */}
          {loading && colleges.length === 0 ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
              <p>Fetching college listings from database...</p>
            </div>
          ) : !error && colleges.length === 0 ? (
            <div className="empty-state">
              <h3>No colleges match your criteria</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Try adjusting your search filters or resetting them.</p>
              <button className="reset-filters-btn" onClick={handleResetFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* College Card Grids */}
              <div className="colleges-grid">
                {colleges.map((college) => {
                  const isCompared = compareList.some(item => item.id === college.id);
                  return (
                    <article key={college.id} className="college-card">
                      <div 
                        className="card-banner" 
                        style={{ backgroundImage: `url(${college.image_url})` }}
                      >
                        <span className="card-badge">{college.type}</span>
                        <div className="card-rating-badge">
                          <span>{college.rating}</span>
                          <span style={{ fontSize: '0.75rem' }}>★</span>
                        </div>
                        <div className="card-logo-container">
                          <img src={college.logo_url} alt={`${college.name} Logo`} className="card-logo" />
                        </div>
                      </div>

                      <div className="card-body">
                        <h2 className="card-title">{college.name}</h2>
                        <div className="card-location">
                          <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{college.city}, {college.state}</span>
                        </div>

                        <div className="card-details-row">
                          <div>
                            <div className="card-stat-label">Avg Annual Fees</div>
                            <div className="card-stat-val">{formatCurrency(college.fees_avg)}</div>
                          </div>
                          <div>
                            <div className="card-stat-label">Avg Placements</div>
                            <div className="card-stat-val">
                              {college.latest_avg_placement 
                                ? `${college.latest_avg_placement} LPA` 
                                : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="card-actions">
                          <Link to={`/college/${college.id}`} className="card-btn-primary">
                            <span>Explore Details</span>
                          </Link>
                          <label className={`compare-checkbox-label ${isCompared ? 'checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isCompared}
                              onChange={() => onToggleCompare(college.id, college.name)}
                              style={{ display: 'none' }}
                            />
                            <span>{isCompared ? 'Comparing' : '+ Compare'}</span>
                          </label>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button 
                    className="pagination-btn"
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      className={`pagination-btn ${page === pNum ? 'active' : ''}`}
                      onClick={() => setPage(pNum)}
                    >
                      {pNum}
                    </button>
                  ))}
                  <button 
                    className="pagination-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default CollegeList;
