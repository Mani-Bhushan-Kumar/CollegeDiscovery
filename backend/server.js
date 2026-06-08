import express from 'express';
import cors from 'cors';
import { initDB, getDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database connection at startup
let db;
try {
  db = await initDB();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// 1. GET /api/colleges - Paginated listing with search, filtering, and sorting
app.get('/api/colleges', async (req, res) => {
  try {
    const search = req.query.search || '';
    const state = req.query.state || '';
    const type = req.query.type || '';
    const minRating = parseFloat(req.query.min_rating) || 0;
    const maxFees = parseInt(req.query.max_fees) || null;
    const courseType = req.query.course_type || '';
    const sortBy = req.query.sort_by || 'rating'; // rating, fees_asc, fees_desc, placement_avg, placement_highest
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    // Search query matches college name, city, or state
    if (search) {
      whereClauses.push('(colleges.name LIKE ? OR colleges.city LIKE ? OR colleges.state LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (state) {
      whereClauses.push('colleges.state = ?');
      params.push(state);
    }

    if (type) {
      whereClauses.push('colleges.type = ?');
      params.push(type);
    }

    if (minRating > 0) {
      whereClauses.push('colleges.rating >= ?');
      params.push(minRating);
    }

    if (maxFees !== null) {
      whereClauses.push('colleges.fees_avg <= ?');
      params.push(maxFees);
    }

    if (courseType) {
      whereClauses.push('colleges.id IN (SELECT DISTINCT college_id FROM courses WHERE name LIKE ?)');
      params.push(`%${courseType}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sort mapping
    let orderSql = 'ORDER BY colleges.rating DESC';
    if (sortBy === 'fees_asc') {
      orderSql = 'ORDER BY colleges.fees_avg ASC';
    } else if (sortBy === 'fees_desc') {
      orderSql = 'ORDER BY colleges.fees_avg DESC';
    } else if (sortBy === 'placement_avg') {
      // Join placements to order by average package of the latest year (2024)
      orderSql = `ORDER BY (SELECT average_package_lpa FROM placements WHERE college_id = colleges.id ORDER BY year DESC LIMIT 1) DESC`;
    } else if (sortBy === 'placement_highest') {
      orderSql = `ORDER BY (SELECT highest_package_lpa FROM placements WHERE college_id = colleges.id ORDER BY year DESC LIMIT 1) DESC`;
    } else if (sortBy === 'rating') {
      orderSql = 'ORDER BY colleges.rating DESC';
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM colleges ${whereSql}`;
    const countResult = await db.get(countQuery, params);
    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const selectQuery = `
      SELECT colleges.*, 
      (SELECT average_package_lpa FROM placements WHERE college_id = colleges.id ORDER BY year DESC LIMIT 1) as latest_avg_placement,
      (SELECT highest_package_lpa FROM placements WHERE college_id = colleges.id ORDER BY year DESC LIMIT 1) as latest_highest_placement
      FROM colleges 
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;
    
    const colleges = await db.all(selectQuery, [...params, limit, offset]);

    res.json({
      colleges,
      total,
      page,
      limit,
      total_pages: totalPages
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /api/colleges/filters - Fetch metadata for search filters
app.get('/api/colleges/filters', async (req, res) => {
  try {
    const states = await db.all('SELECT DISTINCT state FROM colleges ORDER BY state ASC');
    const maxFeeResult = await db.get('SELECT MAX(fees_avg) as max_fee FROM colleges');
    const courses = await db.all('SELECT DISTINCT name FROM courses ORDER BY name ASC');
    const exams = await db.all('SELECT DISTINCT exam FROM cutoffs ORDER BY exam ASC');

    res.json({
      states: states.map(s => s.state),
      max_fee: maxFeeResult.max_fee || 1000000,
      course_types: ['Computer Science', 'Electrical', 'Mechanical', 'MBBS', 'Nursing', 'Commerce', 'Economics'],
      exams: exams.map(e => e.exam)
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. GET /api/colleges/:id - Detailed college page details
app.get('/api/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const college = await db.get('SELECT * FROM colleges WHERE id = ?', [id]);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    const courses = await db.all('SELECT * FROM courses WHERE college_id = ? ORDER BY fees_annual DESC', [id]);
    const placements = await db.all('SELECT * FROM placements WHERE college_id = ? ORDER BY year DESC', [id]);
    const reviews = await db.all('SELECT * FROM reviews WHERE college_id = ? ORDER BY created_at DESC', [id]);
    const cutoffs = await db.all('SELECT * FROM cutoffs WHERE college_id = ? ORDER BY exam ASC, closing_rank ASC', [id]);

    res.json({
      ...college,
      courses,
      placements,
      reviews,
      cutoffs
    });
  } catch (error) {
    console.error('Error fetching college details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. POST /api/colleges/:id/reviews - Submit review and update rating
app.post('/api/colleges/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_name, rating, content } = req.body;

    if (!reviewer_name || !rating || !content) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // Check if college exists
    const college = await db.get('SELECT id FROM colleges WHERE id = ?', [id]);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Insert review
    await db.run(
      `INSERT INTO reviews (college_id, reviewer_name, rating, content) VALUES (?, ?, ?, ?)`,
      [id, reviewer_name, ratingVal, content]
    );

    // Update aggregate college rating
    const ratingResult = await db.get(
      `SELECT AVG(rating) as avg_rating FROM reviews WHERE college_id = ?`,
      [id]
    );
    const newRating = Math.round((ratingResult.avg_rating || 0) * 10) / 10;
    
    await db.run(
      `UPDATE colleges SET rating = ? WHERE id = ?`,
      [newRating, id]
    );

    // Retrieve and send back the newly added review
    const addedReview = await db.get(
      `SELECT * FROM reviews WHERE college_id = ? ORDER BY id DESC LIMIT 1`,
      [id]
    );

    res.status(201).json({
      message: 'Review added successfully',
      review: addedReview,
      new_college_rating: newRating
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. GET /api/compare - Compare up to 3 colleges side-by-side
app.get('/api/compare', async (req, res) => {
  try {
    const idsString = req.query.ids;
    if (!idsString) {
      return res.status(400).json({ error: 'No college IDs specified for comparison' });
    }

    const ids = idsString.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (ids.length === 0) {
      return res.status(400).json({ error: 'Invalid college IDs provided' });
    }

    if (ids.length > 3) {
      return res.status(400).json({ error: 'You can compare up to 3 colleges at a time' });
    }

    const placeholders = ids.map(() => '?').join(',');
    
    // Query colleges
    const colleges = await db.all(
      `SELECT * FROM colleges WHERE id IN (${placeholders})`,
      ids
    );

    // Fetch dependent info for each compared college
    const comparisonList = [];
    for (const college of colleges) {
      const courses = await db.all('SELECT * FROM courses WHERE college_id = ?', [college.id]);
      const placements = await db.all('SELECT * FROM placements WHERE college_id = ? ORDER BY year DESC', [college.id]);
      const reviews = await db.all('SELECT * FROM reviews WHERE college_id = ?', [college.id]);
      
      comparisonList.push({
        ...college,
        courses_count: courses.length,
        courses: courses,
        latest_placement: placements[0] || null,
        placements: placements,
        reviews_count: reviews.length
      });
    }

    // Maintain requested order of IDs if possible
    comparisonList.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    res.json(comparisonList);
  } catch (error) {
    console.error('Error during college comparison:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. GET /api/predict - Predictor tool logic matching closing cutoffs
app.get('/api/predict', async (req, res) => {
  try {
    const { exam, rank, category } = req.query;

    if (!exam || !rank || !category) {
      return res.status(400).json({ error: 'Missing query parameters. Required: exam, rank, category' });
    }

    const rankVal = parseInt(rank);
    if (isNaN(rankVal) || rankVal <= 0) {
      return res.status(400).json({ error: 'Rank must be a positive integer' });
    }

    // Find cutoffs where closing rank is greater than or equal to input rank
    // (a higher closing rank is easier to clear than the input rank)
    const selectQuery = `
      SELECT cutoffs.*, colleges.name as college_name, colleges.city, colleges.state, colleges.rating, colleges.fees_avg, colleges.logo_url
      FROM cutoffs
      JOIN colleges ON cutoffs.college_id = colleges.id
      WHERE cutoffs.exam = ? AND cutoffs.category = ? AND cutoffs.closing_rank >= ?
      ORDER BY cutoffs.closing_rank ASC
    `;
    
    const results = await db.all(selectQuery, [exam, category, rankVal]);

    res.json(results);
  } catch (error) {
    console.error('Error in rank predictor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start express server
app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});
