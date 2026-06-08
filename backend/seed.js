import { initDB } from './db.js';

async function seed() {
  const db = await initDB();
  console.log('Clearing existing database tables...');

  // Disable foreign keys temporarily for clean deletion
  await db.run('PRAGMA foreign_keys = OFF');
  await db.run('DELETE FROM cutoffs');
  await db.run('DELETE FROM reviews');
  await db.run('DELETE FROM placements');
  await db.run('DELETE FROM courses');
  await db.run('DELETE FROM colleges');
  await db.run('DELETE FROM sqlite_sequence');
  await db.run('PRAGMA foreign_keys = ON');

  console.log('Seeding Colleges...');

  const collegesData = [
    {
      id: 1,
      name: 'Indian Institute of Technology Bombay (IITB)',
      type: 'Public',
      city: 'Mumbai',
      state: 'Maharashtra',
      fees_avg: 220000,
      rating: 4.8,
      overview: 'IIT Bombay is a leading public engineering institution known globally for its state-of-the-art research, exceptional faculty, and outstanding placement record. Situated in Powai, Mumbai, it offers a vibrant campus life, tech festivals like Mood Indigo, and top-tier entrepreneurial incubation facilities.',
      logo_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
      established_year: 1958
    },
    {
      id: 2,
      name: 'Indian Institute of Technology Delhi (IITD)',
      type: 'Public',
      city: 'New Delhi',
      state: 'Delhi',
      fees_avg: 225000,
      rating: 4.7,
      overview: 'Located in the heart of the national capital, IIT Delhi is a premier institute of technology. It is recognized for its excellence in scientific and technical education, research initiatives, and producing top global tech leaders, founders, and academics.',
      logo_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?w=800&auto=format&fit=crop&q=80',
      established_year: 1961
    },
    {
      id: 3,
      name: 'Birla Institute of Technology and Science (BITS Pilani)',
      type: 'Private',
      city: 'Pilani',
      state: 'Rajasthan',
      fees_avg: 520000,
      rating: 4.6,
      overview: 'BITS Pilani is one of India\'s top private deemed universities, famous for its "No Reservation" policy, rigorous academic curriculum, dual-degree options, and a highly successful Practice School internship system with top multinational corporations.',
      logo_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
      established_year: 1964
    },
    {
      id: 4,
      name: 'National Institute of Technology Trichy (NITT)',
      type: 'Public',
      city: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      fees_avg: 145000,
      rating: 4.4,
      overview: 'NIT Trichy is consistently ranked as the #1 National Institute of Technology in India. It boasts competitive national-level admissions, high-profile industrial collaborations, and an extensive residential campus offering a balance of tech and cultural societies.',
      logo_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&auto=format&fit=crop&q=80',
      established_year: 1964
    },
    {
      id: 5,
      name: 'All India Institute of Medical Sciences (AIIMS Delhi)',
      type: 'Public',
      city: 'New Delhi',
      state: 'Delhi',
      fees_avg: 1600,
      rating: 4.9,
      overview: 'AIIMS Delhi is the premier medical college and public research university in India. It is highly competitive, offering world-class medical education at a near-nominal tuition fee with unparalleled clinical exposure and patient volumes.',
      logo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      established_year: 1956
    },
    {
      id: 6,
      name: 'Christian Medical College (CMC Vellore)',
      type: 'Private',
      city: 'Vellore',
      state: 'Tamil Nadu',
      fees_avg: 52000,
      rating: 4.5,
      overview: 'CMC Vellore is a globally recognized, private Christian minority medical college. It is famous for implementing community-oriented healthcare practices, strong bioethical training, and highly sought-after postgraduate medical programs.',
      logo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
      established_year: 1900
    },
    {
      id: 7,
      name: 'Vellore Institute of Technology (VIT)',
      type: 'Private',
      city: 'Vellore',
      state: 'Tamil Nadu',
      fees_avg: 198000,
      rating: 4.1,
      overview: 'VIT is a highly ranked private engineering university in India, known for its modular curriculum (FFCS), campus diversity, and large scale placement drives hosting over 800 companies annually.',
      logo_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
      established_year: 1984
    },
    {
      id: 8,
      name: 'Shri Ram College of Commerce (SRCC)',
      type: 'Public',
      city: 'New Delhi',
      state: 'Delhi',
      fees_avg: 30000,
      rating: 4.5,
      overview: 'SRCC is the top-ranked commerce and economics college in India, affiliated with Delhi University. The college attracts students with near-perfect 12th-grade boards scores and places graduates at elite consulting, banking, and financial services companies.',
      logo_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      established_year: 1926
    },
    {
      id: 9,
      name: 'RV College of Engineering (RVCE)',
      type: 'Private',
      city: 'Bengaluru',
      state: 'Karnataka',
      fees_avg: 280000,
      rating: 4.2,
      overview: 'RVCE is a private, self-financing engineering college located in Bengaluru. With its strategic location in the Silicon Valley of India, it provides exceptional industry connections and high placements in tech firms.',
      logo_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      established_year: 1963
    },
    {
      id: 10,
      name: 'Delhi Technological University (DTU)',
      type: 'Public',
      city: 'New Delhi',
      state: 'Delhi',
      fees_avg: 219000,
      rating: 4.3,
      overview: 'Formerly Delhi College of Engineering (DCE), DTU is one of Delhi\'s flagship state universities. Celebrated for its expansive 164-acre lush green campus, tech incubators, and competitive coding culture.',
      logo_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?w=800&auto=format&fit=crop&q=80',
      established_year: 1941
    },
    {
      id: 11,
      name: 'Maulana Azad Medical College (MAMC)',
      type: 'Public',
      city: 'New Delhi',
      state: 'Delhi',
      fees_avg: 12000,
      rating: 4.6,
      overview: 'MAMC is a top public medical college located in New Delhi, affiliated with Delhi University. Associated with multiple hospitals, it offers extensive practical training with massive patient caseloads, preparing students for PG medical entries.',
      logo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80',
      established_year: 1959
    },
    {
      id: 12,
      name: 'College of Engineering Pune (COEP)',
      type: 'Public',
      city: 'Pune',
      state: 'Maharashtra',
      fees_avg: 135000,
      rating: 4.3,
      overview: 'COEP is a historic autonomous engineering college in Pune, Maharashtra. Established in 1854, it is the third oldest engineering college in Asia, offering a rich legacy, highly specialized engineering labs, and a vibrant student community.',
      logo_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
      established_year: 1854
    }
  ];

  for (const college of collegesData) {
    await db.run(
      `INSERT INTO colleges (id, name, type, city, state, fees_avg, rating, overview, logo_url, image_url, established_year) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [college.id, college.name, college.type, college.city, college.state, college.fees_avg, college.rating, college.overview, college.logo_url, college.image_url, college.established_year]
    );
  }

  console.log('Seeding Courses...');
  const coursesData = [
    // IIT Bombay
    { college_id: 1, name: 'B.Tech Computer Science & Engineering', duration_years: 4, fees_annual: 220000, intake: 120 },
    { college_id: 1, name: 'B.Tech Electrical Engineering', duration_years: 4, fees_annual: 220000, intake: 100 },
    { college_id: 1, name: 'B.Tech Mechanical Engineering', duration_years: 4, fees_annual: 220000, intake: 140 },
    // IIT Delhi
    { college_id: 2, name: 'B.Tech Computer Science & Engineering', duration_years: 4, fees_annual: 225000, intake: 115 },
    { college_id: 2, name: 'B.Tech Electrical Engineering', duration_years: 4, fees_annual: 225000, intake: 105 },
    { college_id: 2, name: 'B.Tech Chemical Engineering', duration_years: 4, fees_annual: 225000, intake: 90 },
    // BITS Pilani
    { college_id: 3, name: 'B.E. Computer Science', duration_years: 4, fees_annual: 520000, intake: 150 },
    { college_id: 3, name: 'B.E. Electronics & Communication', duration_years: 4, fees_annual: 520000, intake: 120 },
    { college_id: 3, name: 'M.Sc. Economics (Dual Degree)', duration_years: 5, fees_annual: 520000, intake: 80 },
    // NIT Trichy
    { college_id: 4, name: 'B.Tech Computer Science & Engineering', duration_years: 4, fees_annual: 145000, intake: 110 },
    { college_id: 4, name: 'B.Tech Electronics & Communication', duration_years: 4, fees_annual: 145000, intake: 110 },
    // AIIMS Delhi
    { college_id: 5, name: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)', duration_years: 5, fees_annual: 1600, intake: 125 },
    { college_id: 5, name: 'B.Sc. Nursing (Hons)', duration_years: 4, fees_annual: 1000, intake: 50 },
    // CMC Vellore
    { college_id: 6, name: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)', duration_years: 5, fees_annual: 52000, intake: 100 },
    { college_id: 6, name: 'B.Sc. Nursing', duration_years: 4, fees_annual: 45000, intake: 60 },
    // VIT Vellore
    { college_id: 7, name: 'B.Tech Computer Science & Engineering', duration_years: 4, fees_annual: 198000, intake: 720 },
    { college_id: 7, name: 'B.Tech Information Technology', duration_years: 4, fees_annual: 198000, intake: 360 },
    // SRCC
    { college_id: 8, name: 'B.Com (Hons) Bachelor of Commerce', duration_years: 3, fees_annual: 30000, intake: 626 },
    { college_id: 8, name: 'B.A. (Hons) Economics', duration_years: 3, fees_annual: 30000, intake: 155 },
    // RVCE
    { college_id: 9, name: 'B.E. Computer Science & Engineering', duration_years: 4, fees_annual: 280000, intake: 180 },
    { college_id: 9, name: 'B.E. Information Science', duration_years: 4, fees_annual: 280000, intake: 120 },
    // DTU
    { college_id: 10, name: 'B.Tech Computer Science & Engineering', duration_years: 4, fees_annual: 219000, intake: 240 },
    { college_id: 10, name: 'B.Tech Software Engineering', duration_years: 4, fees_annual: 219000, intake: 180 },
    // MAMC
    { college_id: 11, name: 'MBBS (Bachelor of Medicine & Surgery)', duration_years: 5, fees_annual: 12000, intake: 250 },
    // COEP
    { college_id: 12, name: 'B.Tech Computer Engineering', duration_years: 4, fees_annual: 135000, intake: 120 },
    { college_id: 12, name: 'B.Tech Electronics & Telecommunication', duration_years: 4, fees_annual: 135000, intake: 75 }
  ];

  for (const course of coursesData) {
    await db.run(
      `INSERT INTO courses (college_id, name, duration_years, fees_annual, intake) VALUES (?, ?, ?, ?, ?)`,
      [course.college_id, course.name, course.duration_years, course.fees_annual, course.intake]
    );
  }

  console.log('Seeding Placement Stats...');
  const placementData = [
    { college_id: 1, year: 2024, average_package_lpa: 23.5, highest_package_lpa: 120.0, placement_rate: 91.0 },
    { college_id: 1, year: 2023, average_package_lpa: 21.8, highest_package_lpa: 168.0, placement_rate: 93.0 },
    { college_id: 2, year: 2024, average_package_lpa: 22.0, highest_package_lpa: 110.0, placement_rate: 89.0 },
    { college_id: 2, year: 2023, average_package_lpa: 20.5, highest_package_lpa: 150.0, placement_rate: 92.0 },
    { college_id: 3, year: 2024, average_package_lpa: 19.5, highest_package_lpa: 75.0, placement_rate: 88.0 },
    { college_id: 3, year: 2023, average_package_lpa: 18.2, highest_package_lpa: 81.0, placement_rate: 90.0 },
    { college_id: 4, year: 2024, average_package_lpa: 15.2, highest_package_lpa: 52.8, placement_rate: 90.5 },
    { college_id: 5, year: 2024, average_package_lpa: 16.5, highest_package_lpa: 35.0, placement_rate: 100.0 }, // medical pg rate
    { college_id: 6, year: 2024, average_package_lpa: 10.8, highest_package_lpa: 22.0, placement_rate: 100.0 },
    { college_id: 7, year: 2024, average_package_lpa: 9.2, highest_package_lpa: 44.0, placement_rate: 85.0 },
    { college_id: 8, year: 2024, average_package_lpa: 12.2, highest_package_lpa: 36.0, placement_rate: 84.0 },
    { college_id: 9, year: 2024, average_package_lpa: 11.5, highest_package_lpa: 62.0, placement_rate: 87.2 },
    { college_id: 10, year: 2024, average_package_lpa: 16.8, highest_package_lpa: 82.5, placement_rate: 89.0 },
    { college_id: 11, year: 2024, average_package_lpa: 14.0, highest_package_lpa: 28.0, placement_rate: 100.0 },
    { college_id: 12, year: 2024, average_package_lpa: 11.0, highest_package_lpa: 50.5, placement_rate: 86.4 }
  ];

  for (const placement of placementData) {
    await db.run(
      `INSERT INTO placements (college_id, year, average_package_lpa, highest_package_lpa, placement_rate) 
       VALUES (?, ?, ?, ?, ?)`,
      [placement.college_id, placement.year, placement.average_package_lpa, placement.highest_package_lpa, placement.placement_rate]
    );
  }

  console.log('Seeding Reviews...');
  const reviewsData = [
    { college_id: 1, reviewer_name: 'Aarav Mehta', rating: 5, content: 'IIT Bombay is a dream! The programming culture, robotics clubs, and hackathons are unparalleled. Placements are solid, and coding is almost like a religion here.' },
    { college_id: 1, reviewer_name: 'Neha Sharma', rating: 4, content: 'Academics are highly demanding and competitive. Campus life Powai is fantastic, green, and spacious, though hostel infrastructure could be improved.' },
    { college_id: 2, reviewer_name: 'Rahul Verma', rating: 5, content: 'Stellar academic support, world-class labs, and brilliant batchmates. Being in Delhi gives major networking and startup opportunities.' },
    { college_id: 2, reviewer_name: 'Sneha Roy', rating: 4, content: 'Professor support is highly research-oriented. The exams are difficult, but coding clubs and student tech teams like IITD Dev Club keep it exciting.' },
    { college_id: 3, reviewer_name: 'Amit Patel', rating: 5, content: 'The zero-attendance policy allows you to explore startups and self-learning. Practice School (PS2) internship in my 4th year landed me an direct PPO.' },
    { college_id: 3, reviewer_name: 'Ananya Sen', rating: 4, content: 'Fees are quite high compared to IITs/NITs, but the quality of facilities, no-reservation meritocratic system, and alumni network are worth it.' },
    { college_id: 4, reviewer_name: 'Karthik S.', rating: 5, content: 'NIT Trichy is a powerhouse for placements. Pragyan and Festember are legendary festivals. Heavy focus on both engineering concepts and coding.' },
    { college_id: 5, reviewer_name: 'Dr. Vivek Anand', rating: 5, content: 'Unbelievable patient load, top-tier research, and zero tuition. If you get into AIIMS, your medical career is launched on the best trajectory possible.' },
    { college_id: 6, reviewer_name: 'Sherin Mathew', rating: 5, content: 'CMC Vellore teaches you medicine with empathy. Clinical postings are comprehensive, and hostel culture is warm and community-driven.' },
    { college_id: 7, reviewer_name: 'Rohan Gupta', rating: 4, content: 'VIT offers excellent infrastructure and top-notch labs. The crowd is huge, which means competition for placements is fierce, but opportunities are endless.' },
    { college_id: 8, reviewer_name: 'Aditi Jain', rating: 5, content: 'SRCC is the best place for commerce. The brand value is immense, and the Big 4 accounting firms recruit in massive numbers.' },
    { college_id: 9, reviewer_name: 'Sandeep Gowda', rating: 4, content: 'RVCE has excellent placements, particularly in the tech and semiconductor space. The campus is compact but highly active with clubs.' },
    { college_id: 10, reviewer_name: 'Varun Malhotra', rating: 4, content: 'DTU has an amazing campus life and a very strong coding culture. Almost all major tech firms (Google, Microsoft, Amazon) visit for campus hiring.' },
    { college_id: 11, reviewer_name: 'Dr. Ritu Chaudhary', rating: 5, content: 'MAMC provides unmatched training at LNJP Hospital. Academics are intense, but the medical competence you gain here is outstanding.' },
    { college_id: 12, reviewer_name: 'Pranav Joshi', rating: 4, content: 'COEP has a legacy of 170 years and it shows in the academic rigor and the respect the college commands in industries in Maharashtra.' }
  ];

  for (const review of reviewsData) {
    await db.run(
      `INSERT INTO reviews (college_id, reviewer_name, rating, content) VALUES (?, ?, ?, ?)`,
      [review.college_id, review.reviewer_name, review.rating, review.content]
    );
  }

  console.log('Seeding Cutoffs...');
  const cutoffsData = [
    // JEE Advanced - IIT Bombay (id: 1)
    { college_id: 1, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'General', closing_rank: 67 },
    { college_id: 1, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'OBC', closing_rank: 50 },
    { college_id: 1, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'SC', closing_rank: 25 },
    { college_id: 1, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'ST', closing_rank: 12 },
    { college_id: 1, exam: 'JEE Advanced', branch: 'Electrical Engineering', category: 'General', closing_rank: 480 },
    { college_id: 1, exam: 'JEE Advanced', branch: 'Electrical Engineering', category: 'OBC', closing_rank: 320 },
    { college_id: 1, exam: 'JEE Advanced', branch: 'Mechanical Engineering', category: 'General', closing_rank: 1250 },

    // JEE Advanced - IIT Delhi (id: 2)
    { college_id: 2, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'General', closing_rank: 118 },
    { college_id: 2, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'OBC', closing_rank: 85 },
    { college_id: 2, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'SC', closing_rank: 40 },
    { college_id: 2, exam: 'JEE Advanced', branch: 'Computer Science & Engineering', category: 'ST', closing_rank: 20 },
    { college_id: 2, exam: 'JEE Advanced', branch: 'Electrical Engineering', category: 'General', closing_rank: 550 },
    { college_id: 2, exam: 'JEE Advanced', branch: 'Electrical Engineering', category: 'OBC', closing_rank: 390 },

    // JEE Main - NIT Trichy (id: 4)
    { college_id: 4, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'General', closing_rank: 1500 },
    { college_id: 4, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'OBC', closing_rank: 900 },
    { college_id: 4, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'SC', closing_rank: 450 },
    { college_id: 4, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'ST', closing_rank: 200 },
    { college_id: 4, exam: 'JEE Main', branch: 'Electronics & Communication Engineering', category: 'General', closing_rank: 3200 },
    { college_id: 4, exam: 'JEE Main', branch: 'Electronics & Communication Engineering', category: 'OBC', closing_rank: 1800 },

    // NEET - AIIMS Delhi (id: 5)
    { college_id: 5, exam: 'NEET', branch: 'MBBS', category: 'General', closing_rank: 50 },
    { college_id: 5, exam: 'NEET', branch: 'MBBS', category: 'OBC', closing_rank: 250 },
    { college_id: 5, exam: 'NEET', branch: 'MBBS', category: 'SC', closing_rank: 800 },
    { college_id: 5, exam: 'NEET', branch: 'MBBS', category: 'ST', closing_rank: 1500 },

    // NEET - CMC Vellore (id: 6)
    { college_id: 6, exam: 'NEET', branch: 'MBBS', category: 'General', closing_rank: 1200 },
    { college_id: 6, exam: 'NEET', branch: 'MBBS', category: 'OBC', closing_rank: 2500 },
    { college_id: 6, exam: 'NEET', branch: 'MBBS', category: 'SC', closing_rank: 5800 },
    { college_id: 6, exam: 'NEET', branch: 'MBBS', category: 'ST', closing_rank: 9000 },

    // JEE Main - VIT Vellore (id: 7) - Assuming VIT has custom rank metrics or uses JEE Main cutoffs for some entries
    { college_id: 7, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'General', closing_rank: 12000 },
    { college_id: 7, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'OBC', closing_rank: 18000 },

    // JEE Main - RVCE Bangalore (id: 9)
    { college_id: 9, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'General', closing_rank: 9500 },
    { college_id: 9, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'OBC', closing_rank: 14000 },
    { college_id: 9, exam: 'JEE Main', branch: 'Information Science & Engineering', category: 'General', closing_rank: 12500 },

    // JEE Main - DTU Delhi (id: 10)
    { college_id: 10, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'General', closing_rank: 4500 },
    { college_id: 10, exam: 'JEE Main', branch: 'Computer Science & Engineering', category: 'OBC', closing_rank: 7800 },
    { college_id: 10, exam: 'JEE Main', branch: 'Software Engineering', category: 'General', closing_rank: 6200 },

    // NEET - MAMC Delhi (id: 11)
    { college_id: 11, exam: 'NEET', branch: 'MBBS', category: 'General', closing_rank: 350 },
    { college_id: 11, exam: 'NEET', branch: 'MBBS', category: 'OBC', closing_rank: 950 },
    { college_id: 11, exam: 'NEET', branch: 'MBBS', category: 'SC', closing_rank: 2200 },
    { college_id: 11, exam: 'NEET', branch: 'MBBS', category: 'ST', closing_rank: 4500 },

    // JEE Main - COEP Pune (id: 12)
    { college_id: 12, exam: 'JEE Main', branch: 'Computer Engineering', category: 'General', closing_rank: 8000 },
    { college_id: 12, exam: 'JEE Main', branch: 'Computer Engineering', category: 'OBC', closing_rank: 11500 },
    { college_id: 12, exam: 'JEE Main', branch: 'Electronics & Telecommunication', category: 'General', closing_rank: 11000 }
  ];

  for (const cutoff of cutoffsData) {
    await db.run(
      `INSERT INTO cutoffs (college_id, exam, branch, category, closing_rank) VALUES (?, ?, ?, ?, ?)`,
      [cutoff.college_id, cutoff.exam, cutoff.branch, cutoff.category, cutoff.closing_rank]
    );
  }

  // Update overall ratings in college table based on review averages
  const collegeRatings = await db.all(`
    SELECT college_id, AVG(rating) as avg_rating FROM reviews GROUP BY college_id
  `);
  for (const r of collegeRatings) {
    await db.run(
      `UPDATE colleges SET rating = ROUND(?, 1) WHERE id = ?`,
      [r.avg_rating, r.college_id]
    );
  }

  console.log('Database successfully seeded!');
  await db.close();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
});
