// seed.js
// Fills the database with realistic starting data.
// Run with:  npm run seed   (WARNING: deletes all existing users and feedback first)

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Feedback = require('./models/Feedback');

const STUDENT_PASSWORD = 'student123';

// [name, rollNo, department, year, phone]
const studentData = [
  ['Aarav Sharma', '23BCS1042', 'CSE', 3, '9829014521'],
  ['Priya Agarwal', '23BCS1087', 'CSE', 3, '9414237786'],
  ['Rohan Meena', '22BIT2015', 'IT', 4, '9784561230'],
  ['Sneha Choudhary', '24BCS1123', 'CSE', 2, '8003214598'],
  ['Vikram Singh Rathore', '22BEC3034', 'ECE', 4, '9928347615'],
  ['Ananya Jain', '23BAI1056', 'CSE-AI/ML', 3, '7023456189'],
  ['Harsh Gupta', '24BIT2078', 'IT', 2, '9351278440'],
  ['Ishita Khandelwal', '23BCS1099', 'CSE', 3, '9660123874'],
  ['Kartik Yadav', '22BCS1011', 'CSE', 4, '8890542317'],
  ['Meera Pareek', '24BAI1034', 'CSE-AI/ML', 2, '7742198563'],
];

// Email = first name + last name (middle names skipped)
// "Vikram Singh Rathore" -> vikram.rathore@student.college.edu
const makeEmail = (fullName) => {
  const parts = fullName.toLowerCase().split(' ');
  return `${parts[0]}.${parts[parts.length - 1]}@student.college.edu`;
};

// Feedback uses student positions in the list above:
// 0 Aarav, 1 Priya, 2 Rohan, 3 Sneha, 4 Vikram,
// 5 Ananya, 6 Harsh, 7 Ishita, 8 Kartik, 9 Meera
// [from, to, category, rating, comment, isAnonymous]
const feedbackData = [
  [0, 2, 'Technical Skills', 5, 'Rohan helped our whole team debug the DBMS project, really solid with SQL.', false],
  [1, 2, 'Teamwork', 4, 'Always ready to help in group work and shares notes with everyone.', false],
  [3, 2, 'Communication', 4, 'Explains concepts patiently, his seminar on normalization was easy to follow.', true],
  [8, 2, 'Punctuality', 3, 'Good ideas, but often misses group meeting deadlines.', true],
  [2, 5, 'Technical Skills', 5, 'Ananya built the ML model for our minor project almost single-handedly. Very strong in Python.', false],
  [0, 5, 'Leadership', 5, 'Led the hackathon team calmly, divided work well and kept everyone motivated.', false],
  [7, 5, 'Communication', 4, 'Clear presenter. Her slides were neat and to the point.', false],
  [9, 5, 'Behaviour', 5, 'Very approachable senior, guided me a lot with my first Python project.', false],
  [5, 0, 'Teamwork', 4, 'Reliable teammate, finishes his part of the work on time.', false],
  [1, 0, 'Communication', 3, 'Knows the topic well but speaks too fast during presentations.', true],
  [6, 0, 'Technical Skills', 4, 'Good at C++ and DSA, helped me understand recursion.', false],
  [4, 8, 'Leadership', 4, 'Handled the coding club events nicely, though planning could start earlier.', false],
  [2, 8, 'Technical Skills', 5, 'One of the best competitive programmers in our batch.', false],
  [0, 8, 'Punctuality', 2, 'Usually late to labs and project meetings.', true],
  [8, 1, 'Communication', 5, 'Excellent speaker, handled the viva questions for our whole group.', false],
  [3, 1, 'Behaviour', 5, 'Kind and supportive, always helps juniors with doubts.', false],
  [5, 1, 'Teamwork', 4, 'Coordinates well and keeps the group chat organised.', true],
  [6, 4, 'Technical Skills', 4, 'Great with hardware and embedded systems, fixed our Arduino circuit.', false],
  [7, 4, 'Punctuality', 3, 'Work quality is good, but submissions are often last minute.', true],
  [1, 7, 'Teamwork', 4, 'Takes ownership of documentation and testing without being asked.', false],
  [9, 7, 'Communication', 3, 'Good ideas but hesitates to speak up in group discussions.', false],
  [0, 3, 'Behaviour', 4, 'Polite and eager to learn, asks good questions.', false],
  [2, 6, 'Technical Skills', 3, 'Picking up web development quickly, needs more practice with JavaScript.', false],
  [5, 9, 'Technical Skills', 4, 'Strong grasp of statistics, did the data cleaning for our project.', true],
  [3, 6, 'Teamwork', 2, 'Was hard to reach during the last group assignment.', true],
];

const seed = async () => {
  await connectDB();

  console.log('Clearing old data...');
  await Feedback.deleteMany({});
  await User.deleteMany({});

  // Make sure the unique index (one feedback per category per pair) exists
  await Feedback.syncIndexes();

  console.log('Creating admin...');
  await User.create({
    name: 'Admin',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
  });

  console.log('Creating students...');
  // User.create runs the pre-save hook, so every password gets hashed
  const students = await User.create(
    studentData.map(([name, rollNo, department, year, phone]) => ({
      name,
      email: makeEmail(name),
      rollNo,
      department,
      year,
      phone,
      password: STUDENT_PASSWORD,
      role: 'student',
    }))
  );

  console.log('Creating feedback...');
  // Spread createdAt over the last ~30 days so dates look real
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const feedbackDocs = feedbackData.map(([from, to, category, rating, comment, isAnonymous], i) => {
    if (from === to) throw new Error(`Seed error: self-feedback at row ${i}`);
    const date = new Date(now - (feedbackData.length - i) * 1.2 * DAY);
    return {
      givenBy: students[from]._id,
      givenTo: students[to]._id,
      category,
      rating,
      comment,
      isAnonymous,
      createdAt: date,
      updatedAt: date,
    };
  });
  await Feedback.insertMany(feedbackDocs);

  console.log('\nSeed complete!');
  console.log(`  1 admin, ${students.length} students, ${feedbackDocs.length} feedback`);
  console.log('  Admin login:   admin@college.edu / admin123');
  console.log(`  Student login: ${makeEmail(studentData[0][0])} / ${STUDENT_PASSWORD}`);

  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.connection.close();
  process.exit(1);
});
