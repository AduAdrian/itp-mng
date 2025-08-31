import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'Adrian',
  password: 'Adrian',
  database: 'vehicle_registry',
  port: 3306
};

// Vehicle interface
export interface Vehicle {
  id?: number;
  nume: string;
  nr_inmatriculare: string;
  valabilitate: string;
  data_inregistrare: string;
  nr_telefon: string;
}

// Create connection pool for better performance
export const pool = mysql.createPool(dbConfig);

// Function to initialize database and tables
export async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // Create tables
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Function to create the vehicles table
async function createTables() {
  const createVehiclesTable = `
    CREATE TABLE IF NOT EXISTS vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nume VARCHAR(255) NOT NULL,
      nr_inmatriculare VARCHAR(50) NOT NULL UNIQUE,
      valabilitate DATE NOT NULL,
      data_inregistrare DATE NOT NULL,
      nr_telefon VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(createVehiclesTable);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Function to test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// CRUD operations
export async function addVehicle(vehicle: Vehicle): Promise<number | null> {
  try {
    const [result] = await pool.query(
      'INSERT INTO vehicles (nume, nr_inmatriculare, valabilitate, data_inregistrare, nr_telefon) VALUES (?, ?, ?, ?, ?)',
      [vehicle.nume, vehicle.nr_inmatriculare, vehicle.valabilitate, vehicle.data_inregistrare, vehicle.nr_telefon]
    ) as any[];
    return result.insertId;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return null;
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC') as any[];
    return rows as Vehicle[];
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return [];
  }
}

export async function getVehicleByRegistration(nr_inmatriculare: string): Promise<Vehicle | null> {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vehicles WHERE nr_inmatriculare = ?',
      [nr_inmatriculare]
    ) as any[];
    return rows.length > 0 ? rows[0] as Vehicle : null;
  } catch (error) {
    console.error('Error getting vehicle:', error);
    return null;
  }
}

export async function updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<boolean> {
  try {
    const fields = Object.keys(vehicle).filter(key => key !== 'id');
    const values = fields.map(field => vehicle[field as keyof Vehicle]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await pool.query(
      `UPDATE vehicles SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    return true;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return false;
  }
}

export async function deleteVehicle(id: number): Promise<boolean> {
  try {
    await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return false;
  }
}
