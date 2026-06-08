import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Award, Star, ArrowLeft, BookOpen, TrendingUp, MessageSquare } from 'lucide-react';
import type { CompareItem } from '../App';

interface Course {
  id: number;
  name: string;
  duration_years: number;
  fees_annual: number;
  intake: number;
}

interface Placement {
  id: number;
  year: number;
  average_package_lpa: number;
  highest_package_lpa: number;
  placement_rate: number;
}

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  content: string;
  created_at: string;
}

interface Cutoff {
  id: number;
  exam: string;
  branch: string;
  category: string;
  closing_rank: number;
}

interface CollegeDetailData {
  id: number;
  name: string;
  type: 'Public' | 'Private';
  city: string;
  state: string;
  fees_avg: number;
  rating: number;
  overview: string;
  logo_url: string;
  image_url: string;
  established_year: number;
  courses: Course[];
  placements: Placement[];
  reviews: Review[];
  cutoffs: Cutoff[];
}

interface CollegeDetailProps {
  compareList: CompareItem[];
  onToggleCompare: (id: number, name: string) => void;
}

const API_BASE = 'http://localhost:5000/api';

function CollegeDetail({ compareList, onToggleCompare }: CollegeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [college, setCollege] = useState<CollegeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'reviews'>('overview');

  // Review form states
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/colleges/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('College details not found');
          throw new Error('Failed to load college details');
        }
        const data = await res.json();
        setCollege(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading college details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !college) return;
    
    if (!reviewerName.trim() || !reviewContent.trim()) {
      setFormError('Please fill in your name and review content.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/colleges/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewer_name: reviewerName,
          rating: reviewRating,
          content: reviewContent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review');
      }

      const data = await res.json();
      
      // Update local college reviews and rating
      setCollege(prev => {
        if (!prev) return null;
        return {
          ...prev,
          rating: data.new_college_rating,
          reviews: [data.review, ...prev.reviews]
        };
      });

      // Clear Form
      setReviewerName('');
      setReviewRating(5);
      setReviewContent('');
      setFormSuccess('Thank you! Your review has been added.');
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving review.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${val.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="loading-spinner-container" style={{ minHeight: '400px' }}>
        <div className="loading-spinner"></div>
        <p>Loading college credentials and dataset...</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="empty-state" style={{ minHeight: '300px', borderColor: '#ef4444' }}>
        <h3 className="error-message">{error || 'College details could not be loaded.'}</h3>
        <p style={{ marginTop: '0.5rem' }}>The page requested might not exist or the server could be offline.</p>
        <Link to="/" className="reset-filters-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
          Back to Listings
        </Link>
      </div>
    );
  }

  const isCompared = compareList.some(item => item.id === college.id);

  return (
    <div className="detail-container">
      {/* Navigation Back Link */}
      <div>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--primary)' }}>
          <ArrowLeft size={16} />
          <span>Back to College Search</span>
        </Link>
      </div>

      {/* Hero Banner Header */}
      <section className="detail-hero" style={{ backgroundImage: `url(${college.image_url})` }}>
        <div className="detail-hero-overlay"></div>
        <div className="detail-hero-content">
          <div className="detail-meta-left">
            <div className="detail-logo-wrapper">
              <img src={college.logo_url} alt={`${college.name} Logo`} className="detail-logo" />
            </div>
            <div>
              <span className="detail-badge-pill">{college.type}</span>
              <h1 className="detail-name" style={{ color: 'white', margin: '0.25rem 0' }}>{college.name}</h1>
              <div className="detail-location-row">
                <MapPin size={16} />
                <span>{college.city}, {college.state}</span>
                <span>•</span>
                <Calendar size={16} />
                <span>Est. {college.established_year}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div className="detail-rating-pill">
              <span>{college.rating}</span>
              <Star size={18} fill="white" style={{ verticalAlign: 'middle' }} />
            </div>
            <button 
              className={`compare-checkbox-label ${isCompared ? 'checked' : ''}`}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => onToggleCompare(college.id, college.name)}
            >
              <span>{isCompared ? 'Added to Compare' : '+ Add to Compare'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tab Navigation Menu */}
      <div className="detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses & Fees
        </button>
        <button 
          className={`tab-btn ${activeTab === 'placements' ? 'active' : ''}`}
          onClick={() => setActiveTab('placements')}
        >
          Placements
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({college.reviews.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="tab-panels-container">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-panel">
            <h2 className="panel-title">About the Institution</h2>
            <p className="overview-text">{college.overview}</p>

            <div className="quick-stats-grid">
              <div className="stat-box">
                <span className="stat-box-title">Average Annual Fee</span>
                <span className="stat-box-value">{formatCurrency(college.fees_avg)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-box-title">Courses Offered</span>
                <span className="stat-box-value">{college.courses.length} Degrees</span>
              </div>
              <div className="stat-box">
                <span className="stat-box-title">Highest Placement Package</span>
                <span className="stat-box-value">
                  {college.placements.length > 0 
                    ? `${college.placements[0].highest_package_lpa} LPA` 
                    : 'N/A'}
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-box-title">Ownership Type</span>
                <span className="stat-box-value">{college.type}</span>
              </div>
            </div>

            {/* Cutoff Reference list */}
            {college.cutoffs.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <h3 className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                  <Award size={18} style={{ marginRight: '0.4rem', verticalAlign: 'middle', color: 'var(--primary)' }} />
                  Entrance Cutoffs Reference
                </h3>
                <div className="cutoff-grid">
                  <table className="cutoff-table">
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Course / Specialization</th>
                        <th>Category</th>
                        <th>Closing Rank Cutoff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {college.cutoffs.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.exam}</strong></td>
                          <td>{c.branch}</td>
                          <td><span className="detail-badge-pill" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-title)', border: '1px solid var(--border)' }}>{c.category}</span></td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{c.closing_rank.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="tab-panel">
            <h2 className="panel-title">Degrees and Curriculums</h2>
            {college.courses.length === 0 ? (
              <p>Course details are currently unavailable for this college.</p>
            ) : (
              <div className="courses-grid">
                {college.courses.map((course) => (
                  <div key={course.id} className="course-item-card">
                    <div className="course-info-col">
                      <div className="course-name-label">
                        <BookOpen size={16} style={{ color: 'var(--primary)', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                        {course.name}
                      </div>
                      <div className="course-meta-tags">
                        <span>Duration: {course.duration_years} Years</span>
                        <span>•</span>
                        <span>Capacity: {course.intake ? `${course.intake} seats` : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="course-fees-col">
                      <div className="card-stat-label">Annual Tuition Fee</div>
                      <div className="course-fees-amount">{formatCurrency(course.fees_annual)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Placements Tab */}
        {activeTab === 'placements' && (
          <div className="tab-panel">
            <h2 className="panel-title">Placement & Career Records</h2>
            {college.placements.length === 0 ? (
              <p>Placement records are currently unavailable for this college.</p>
            ) : (
              <div className="placement-dashboard">
                {/* Placement Stats Dashboard Grid */}
                <div className="placements-trend-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontWeight: '700', color: 'var(--text-title)' }}>Latest Year Highlights ({college.placements[0].year})</span>
                  </div>
                  <div className="placement-stats-row">
                    <div style={{ borderRight: '1px solid var(--border)' }}>
                      <div className="card-stat-label">Average CTC package</div>
                      <div className="stat-box-value" style={{ color: 'var(--primary)' }}>
                        {college.placements[0].average_package_lpa} LPA
                      </div>
                    </div>
                    <div style={{ borderRight: '1px solid var(--border)' }}>
                      <div className="card-stat-label">Highest CTC package</div>
                      <div className="stat-box-value" style={{ color: 'var(--accent)' }}>
                        {college.placements[0].highest_package_lpa} LPA
                      </div>
                    </div>
                    <div>
                      <div className="card-stat-label">Placement Percentage</div>
                      <div className="stat-box-value">
                        {college.placements[0].placement_rate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                <div>
                  <h3 className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Placement History</h3>
                  <table className="placements-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Average Package (LPA)</th>
                        <th>Highest Package (LPA)</th>
                        <th>Placement Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {college.placements.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.year}</strong></td>
                          <td style={{ fontWeight: 600 }}>{p.average_package_lpa} LPA</td>
                          <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{p.highest_package_lpa} LPA</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{p.placement_rate}%</span>
                              <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden', maxWidth: '100px' }}>
                                <div style={{ height: '100%', width: `${p.placement_rate}%`, backgroundColor: 'var(--primary)' }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="tab-panel">
            <h2 className="panel-title">Student & Alumni Feedback</h2>
            
            <div className="reviews-section">
              {/* Reviews Feed List */}
              <div className="reviews-list">
                {college.reviews.length === 0 ? (
                  <div className="empty-state" style={{ borderStyle: 'solid', padding: '2rem' }}>
                    <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <p>No reviews have been written yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  college.reviews.map((review) => (
                    <div key={review.id} className="review-item-card">
                      <div className="review-header">
                        <div>
                          <div className="reviewer-name">{review.reviewer_name}</div>
                          <div className="review-date">
                            {review.created_at ? new Date(review.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Just now'}
                          </div>
                        </div>
                        <div className="reviewer-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < review.rating ? 'hsl(45, 95%, 45%)' : 'none'} 
                              stroke={i < review.rating ? 'hsl(45, 95%, 45%)' : 'currentColor'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-content">{review.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Interactive Review Form */}
              <div className="review-form-card">
                <span className="form-title">Write a Review</span>
                
                {formSuccess && <p className="success-message">{formSuccess}</p>}
                {formError && <p className="error-message">{formError}</p>}

                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="reviewer-name">Your Name</label>
                    <input
                      id="reviewer-name"
                      type="text"
                      className="form-input"
                      placeholder="Enter your name"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-select-stars">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`star-rating-btn ${starVal <= reviewRating ? 'active' : ''}`}
                            onClick={() => setReviewRating(starVal)}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-content">Review Description</label>
                    <textarea
                      id="review-content"
                      className="form-textarea"
                      placeholder="Share your campus life, facilities, and placement experience..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-review-btn"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? 'Posting Review...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollegeDetail;
