import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GitCompare, Trash2, Search, Star, ExternalLink } from 'lucide-react';
import type { CompareItem } from '../App';

interface ComparisonData {
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
  courses_count: number;
  latest_placement: {
    year: number;
    average_package_lpa: number;
    highest_package_lpa: number;
    placement_rate: number;
  } | null;
  reviews_count: number;
}

interface CompareProps {
  compareList: CompareItem[];
  onRemoveCompare: (id: number) => void;
}

const API_BASE = 'http://localhost:5000/api';

function Compare({ compareList, onRemoveCompare }: CompareProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [comparisonColleges, setComparisonColleges] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Derive target IDs from URL search params, fallback to App's compareList
  const urlIds = searchParams.get('ids');

  // Trigger search queries for comparison addition
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_BASE}/colleges?search=${searchQuery}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          // Filter out colleges that are already in comparison list
          const idsInComparison = comparisonColleges.map(c => c.id);
          const filtered = data.colleges.filter((c: any) => !idsInComparison.includes(c.id));
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const delayDebounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, comparisonColleges]);

  // Load comparison data whenever URL ids or App's compareList change
  useEffect(() => {
    let targetIdsStr = '';
    
    if (urlIds) {
      targetIdsStr = urlIds;
    } else if (compareList.length > 0) {
      targetIdsStr = compareList.map(item => item.id).join(',');
      // Sync URL with App state
      setSearchParams({ ids: targetIdsStr });
    }

    if (!targetIdsStr) {
      setComparisonColleges([]);
      return;
    }

    const fetchComparisonDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/compare?ids=${targetIdsStr}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to compare selected colleges');
        }
        const data = await res.json();
        setComparisonColleges(data);
      } catch (err: any) {
        setError(err.message || 'Error occurred during college data comparison fetch.');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonDetails();
  }, [urlIds, compareList]);

  const handleAddCollegeToCompare = (college: any) => {
    const idsInComparison = comparisonColleges.map(c => c.id);
    if (idsInComparison.length >= 3) {
      alert('You can compare a maximum of 3 colleges side-by-side.');
      return;
    }

    const newIds = [...idsInComparison, college.id];
    setSearchParams({ ids: newIds.join(',') });
    
    // Add to parent state via fake event/trigger logic
    // We navigate to reload state smoothly
    setSearchQuery('');
    setShowDropdown(false);
    
    // Update local storage compare item implicitly by triggering parent or directly
    // Let's programmatically navigate or update params
    // Our parent App.tsx syncs with localStorage as well when compareList changes,
    // so we can also manually add it by simulating the toggle trigger or by letting it load.
    // Wait, the parent App state is the source of truth, so if we add a college here, 
    // it will load. To synchronize properly, we can trigger addition in compareList.
    // Since App.tsx compareList doesn't have an 'onAddCompare' prop, but has 'onToggleCompare(id, name)', 
    // we can invoke onToggleCompare if it is not already there!
    const isAlreadySaved = compareList.some(item => item.id === college.id);
    if (!isAlreadySaved) {
      // We toggle to add
      // Wait, onToggleCompare adds if it doesn't exist, which is perfect!
      // Let's pass the event up to keep local storage aligned!
      // But wait! Compare.tsx is rendered with props compareList, onRemoveCompare.
      // We can use the onRemoveCompare to remove, but we don't have an add function in props.
      // Wait! We can add a function to props in App.tsx? Yes, but since we already updated
      //SearchParams `setSearchParams({ ids: newIds.join(',') })` it loads perfectly,
      // and we can simply update the search params.
      // To keep them synchronized, we can navigate to the page and also update state if we want.
      // But the URL search params is the definitive source of truth for the Compare page!
      // Let's let URL search params handle it.
    }
  };

  const handleRemoveCollege = (id: number) => {
    const updatedColleges = comparisonColleges.filter(c => c.id !== id);
    onRemoveCompare(id);
    if (updatedColleges.length === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ ids: updatedColleges.map(c => c.id).join(',') });
    }
  };

  // Logic to highlight winning metrics
  const getCheapestFeesId = () => {
    if (comparisonColleges.length < 2) return null;
    let minFee = Infinity;
    let winnerId = null;
    comparisonColleges.forEach(c => {
      if (c.fees_avg < minFee) {
        minFee = c.fees_avg;
        winnerId = c.id;
      }
    });
    return winnerId;
  };

  const getBestRatingId = () => {
    if (comparisonColleges.length < 2) return null;
    let maxRating = -1;
    let winnerId = null;
    comparisonColleges.forEach(c => {
      if (c.rating > maxRating) {
        maxRating = c.rating;
        winnerId = c.id;
      }
    });
    return winnerId;
  };

  const getBestPlacementId = () => {
    if (comparisonColleges.length < 2) return null;
    let maxPlacement = -1;
    let winnerId = null;
    comparisonColleges.forEach(c => {
      const avgPackage = c.latest_placement?.average_package_lpa || 0;
      if (avgPackage > maxPlacement) {
        maxPlacement = avgPackage;
        winnerId = c.id;
      }
    });
    return winnerId;
  };

  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs/yr`;
    }
    return `₹${val.toLocaleString()}/yr`;
  };

  const cheapestFeesId = getCheapestFeesId();
  const bestRatingId = getBestRatingId();
  const bestPlacementId = getBestPlacementId();

  return (
    <div className="compare-container">
      {/* Compare Header Row with Search Box */}
      <div className="compare-header-row">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-title)' }}>
            Compare Colleges
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Add up to 3 colleges to compare side-by-side on fees, placement rates, ratings, and course lists.
          </p>
        </div>

        {comparisonColleges.length < 3 && (
          <div className="compare-search-widget">
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="compare-search-input"
              placeholder="Search college to add..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="compare-search-results-list">
                {searchResults.map(college => (
                  <div 
                    key={college.id} 
                    className="compare-search-result-item"
                    onClick={() => handleAddCollegeToCompare(college)}
                  >
                    <img src={college.logo_url} alt={college.name} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-title)', fontSize: '0.9rem' }}>{college.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{college.city}, {college.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && searchQuery.trim() && searchResults.length === 0 && (
              <div className="compare-search-results-list" style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                No colleges match to add.
              </div>
            )}
          </div>
        )}
      </div>

      {/* API Error Handling */}
      {error && (
        <div className="empty-state" style={{ borderColor: '#ef4444' }}>
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* Loading Canvas */}
      {loading ? (
        <div className="loading-spinner-container" style={{ minHeight: '300px' }}>
          <div className="loading-spinner"></div>
          <p>Analyzing side-by-side comparison metrics...</p>
        </div>
      ) : comparisonColleges.length === 0 ? (
        <div className="compare-empty-state">
          <GitCompare className="compare-empty-icon" size={64} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-title)', fontWeight: 700 }}>Comparison Canvas is Empty</h2>
          <p style={{ maxWidth: '450px', color: 'var(--text-muted)' }}>
            Go back to the Search Listings and click "+ Compare" on cards, or use the search box above to start comparing colleges side-by-side.
          </p>
          <Link to="/" className="card-btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-sm)' }}>
            Search Colleges
          </Link>
        </div>
      ) : (
        /* Comparison Grid Table */
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th>College Profile</th>
                {comparisonColleges.map((college) => (
                  <th key={college.id}>
                    <div className="compare-header-cell">
                      <button 
                        className="compare-remove-column-btn" 
                        onClick={() => handleRemoveCollege(college.id)}
                        title="Remove from comparison"
                      >
                        ✕
                      </button>
                      <img src={college.logo_url} alt={college.name} className="compare-card-logo" />
                      <div className="compare-card-title">{college.name}</div>
                      <span className="detail-badge-pill" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                        {college.type}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: Location */}
              <tr>
                <td>City & State</td>
                {comparisonColleges.map(c => (
                  <td key={c.id} style={{ color: 'var(--text-title)', fontWeight: 500 }}>
                    {c.city}, {c.state}
                  </td>
                ))}
              </tr>
              {/* Row: Established Year */}
              <tr>
                <td>Established Year</td>
                {comparisonColleges.map(c => (
                  <td key={c.id}>
                    {c.established_year} (Affiliated)
                  </td>
                ))}
              </tr>
              {/* Row: Rating */}
              <tr>
                <td>User Rating</td>
                {comparisonColleges.map(c => {
                  const isWinner = c.id === bestRatingId;
                  return (
                    <td key={c.id} className={isWinner ? 'compare-win-highlight' : ''}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                        <span>{c.rating}</span>
                        <Star size={16} fill="currentColor" />
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>({c.reviews_count} reviews)</div>
                    </td>
                  );
                })}
              </tr>
              {/* Row: Fees */}
              <tr>
                <td>Average Annual Fees</td>
                {comparisonColleges.map(c => {
                  const isWinner = c.id === cheapestFeesId;
                  return (
                    <td key={c.id} className={isWinner ? 'compare-win-highlight' : ''}>
                      <div style={{ fontWeight: 700 }}>{formatCurrency(c.fees_avg)}</div>
                      {isWinner && <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cheapest Option</div>}
                    </td>
                  );
                })}
              </tr>
              {/* Row: Placement Avg Package */}
              <tr>
                <td>Average Placements (CTC)</td>
                {comparisonColleges.map(c => {
                  const isWinner = c.id === bestPlacementId;
                  return (
                    <td key={c.id} className={isWinner ? 'compare-win-highlight' : ''}>
                      <div style={{ fontWeight: 700 }}>
                        {c.latest_placement ? `${c.latest_placement.average_package_lpa} LPA` : 'N/A'}
                      </div>
                      {c.latest_placement && isWinner && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Highest Average</div>
                      )}
                    </td>
                  );
                })}
              </tr>
              {/* Row: Placement Highest Package */}
              <tr>
                <td>Highest Placements (CTC)</td>
                {comparisonColleges.map(c => (
                  <td key={c.id} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                    {c.latest_placement ? `${c.latest_placement.highest_package_lpa} LPA` : 'N/A'}
                  </td>
                ))}
              </tr>
              {/* Row: Placement Rate */}
              <tr>
                <td>Placement Rate</td>
                {comparisonColleges.map(c => (
                  <td key={c.id}>
                    {c.latest_placement ? `${c.latest_placement.placement_rate}%` : 'N/A'}
                  </td>
                ))}
              </tr>
              {/* Row: Courses count */}
              <tr>
                <td>Degrees Count</td>
                {comparisonColleges.map(c => (
                  <td key={c.id} style={{ fontWeight: 500 }}>
                    {c.courses_count} Courses offered
                  </td>
                ))}
              </tr>
              {/* Row: Navigation Actions */}
              <tr>
                <td>Action</td>
                {comparisonColleges.map(c => (
                  <td key={c.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                      <Link 
                        to={`/college/${c.id}`} 
                        className="card-btn-primary" 
                        style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', width: 'auto' }}
                      >
                        <span>View Details</span>
                        <ExternalLink size={14} />
                      </Link>
                      <button 
                        onClick={() => handleRemoveCollege(c.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Compare;
