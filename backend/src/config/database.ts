import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const config: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'invoiceflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(config);

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip VARCHAR(20),
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        payment_terms VARCHAR(50) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
        tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
        tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        discount_type VARCHAR(20),
        discount_value DECIMAL(10, 2),
        discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create invoice_line_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoice_line_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        rate DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
      CREATE INDEX IF NOT EXISTS idx_line_items_invoice_id ON invoice_line_items(invoice_id);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

