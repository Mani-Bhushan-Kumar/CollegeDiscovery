import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, GraduationCap } from 'lucide-react';

interface PredictionResult {
  id: number;
  college_id: number;
  exam: string;
  branch: string;
  category: string;
  closing_rank: number;
  college_name: string;
  city: string;
  state: string;
  rating: number;
  fees_avg: number;
  logo_url: string;
}

const API_BASE = 'http://localhost:5000/api';

function Predictor() {
  const [exam, setExam] = useState('JEE Main');
  const [category, setCategory] = useState('General');
  const [rankInput, setRankInput] = useState('');
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    const rank = parseInt(rankInput);
    if (isNaN(rank) || rank <= 0) {
      setError('Please enter a valid positive rank.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    try {
      const queryParams = new URLSearchParams({
        exam,
        rank: rank.toString(),
        category
      });

      const res = await fetch(`${API_BASE}/predict?${queryParams.toString()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Prediction service error');
      }
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while calculating predictions.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs/yr`;
    }
    return `₹${val.toLocaleString()}/yr`;
  };

  return (
    <div className="predictor-container">
      {/* Page Title & Explanation Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-title)' }}>
          Cutoff Rank Predictor
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '800px', marginTop: '0.25rem' }}>
          Evaluate your admission prospects in top engineering and medical institutions. Our algorithm matches your entrance rank against historical closing cutoff trends.
        </p>
      </div>

      {/* Inputs Form Dashboard */}
      <section className="predictor-form-panel">
        <form onSubmit={handlePredict}>
          <div className="predictor-grid">
            <div className="filter-group">
              <label htmlFor="exam-select">Select Entrance Exam</label>
              <select
                id="exam-select"
                className="filter-select"
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value);
                  // Auto-suggest logical rank defaults for UI usability
                  if (e.target.value === 'JEE Advanced') {
                    setRankInput('500');
                  } else if (e.target.value === 'NEET') {
                    setRankInput('300');
                  } else {
                    setRankInput('5000');
                  }
                }}
              >
                <option value="JEE Main">JEE Main (for NITs, DTU, State Unis)</option>
                <option value="JEE Advanced">JEE Advanced (for IITs)</option>
                <option value="NEET">NEET (for Medical Colleges like AIIMS, MAMC)</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="category-select">Quota / Category</label>
              <select
                id="category-select"
                className="filter-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General (UR)</option>
                <option value="OBC">OBC-NCL</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="rank-input">All India Rank (AIR)</label>
              <input
                id="rank-input"
                type="number"
                className="filter-input"
                placeholder="e.g. 5000"
                min="1"
                value={rankInput}
                onChange={(e) => setRankInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="predictor-action-row">
            <button type="submit" className="predict-btn" disabled={loading}>
              <Sparkles size={18} />
              <span>Predict Colleges</span>
            </button>
          </div>
        </form>
      </section>

      {/* Results Board Section */}
      <section className="predictor-results-board">
        {loading && (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Querying database for matches satisfying closing rank criteria...</p>
          </div>
        )}

        {error && (
          <div className="empty-state" style={{ borderColor: '#ef4444' }}>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="empty-state">
            <GraduationCap size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No eligible college / branch found</h3>
            <p style={{ marginTop: '0.5rem', maxWidth: '500px', marginInline: 'auto' }}>
              Your rank of <strong>{parseInt(rankInput).toLocaleString()}</strong> was higher than the historical closing ranks for <strong>{exam} ({category})</strong> in our database. Try checking a different exam or category quota.
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div>
            <h2 className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
              Eligible Colleges & Branches ({results.length} Matches found)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.map((item) => (
                <div key={item.id} className="predictor-card-row">
                  <div className="predictor-college-info">
                    <img src={item.logo_url} alt={item.college_name} className="predictor-college-logo" />
                    <div className="predictor-course-info">
                      <span className="predictor-college-name">{item.college_name}</span>
                      <span className="predictor-branch-name">{item.branch}</span>
                      <div className="predictor-badge-row">
                        <span className="detail-badge-pill" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-title)', border: '1px solid var(--border)', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                          Fees: {formatCurrency(item.fees_avg)}
                        </span>
                        <span className="detail-badge-pill" style={{ backgroundColor: 'hsl(45, 95%, 45%)', color: 'white', fontSize: '0.75rem', padding: '0.15rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {item.rating} <Star size={10} fill="white" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="predictor-rank-data">
                    <div>
                      <div className="predictor-closing-label">Historical Closing Cutoff</div>
                      <div className="predictor-closing-val">Rank {item.closing_rank.toLocaleString()}</div>
                    </div>
                    <Link to={`/college/${item.college_id}`} className="predictor-details-btn" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                      Explore College
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Predictor;
