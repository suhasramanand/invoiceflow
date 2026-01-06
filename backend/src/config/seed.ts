import { pool } from './database';
import { hashPassword } from '../utils/auth';

const seedDatabase = async () => {
  try {
    // Create a test user
    const hashedPassword = await hashPassword('password123');
    const userResult = await pool.query(
      `INSERT INTO users (email, password, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['demo@invoiceflow.com', hashedPassword, 'Demo User']
    );

    if (userResult.rows.length === 0) {
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [
        'demo@invoiceflow.com',
      ]);
      const userId = existingUser.rows[0].id;

      // Create sample clients
      await pool.query(
        `INSERT INTO clients (user_id, name, email, phone, city, state)
         VALUES 
           ($1, 'Acme Corporation', 'contact@acme.com', '555-0100', 'New York', 'NY'),
           ($1, 'Tech Solutions Inc', 'info@techsolutions.com', '555-0200', 'San Francisco', 'CA'),
           ($1, 'Global Services Ltd', 'hello@globalservices.com', '555-0300', 'Chicago', 'IL')
         ON CONFLICT DO NOTHING`,
        [userId]
      );

      console.log('Database seeded successfully');
    } else {
      const userId = userResult.rows[0].id;

      // Create sample clients
      await pool.query(
        `INSERT INTO clients (user_id, name, email, phone, city, state)
         VALUES 
           ($1, 'Acme Corporation', 'contact@acme.com', '555-0100', 'New York', 'NY'),
           ($1, 'Tech Solutions Inc', 'info@techsolutions.com', '555-0200', 'San Francisco', 'CA'),
           ($1, 'Global Services Ltd', 'hello@globalservices.com', '555-0300', 'Chicago', 'IL')
         ON CONFLICT DO NOTHING`,
        [userId]
      );

      console.log('Database seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

seedDatabase();

