
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';

const targetEmails = [
  'ravi@gmail.com',
  'suresh@gmail.com',
  'priya@gmail.com',
  'testemployee@gmail.com'
];

async function createEmployeeLogins() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `SELECT id, name, email
       FROM employees
       WHERE LOWER(email) = ANY($1::text[])
       ORDER BY id`,
      [targetEmails]
    );

    const foundEmails = result.rows.map(
      employee => employee.email.toLowerCase()
    );

    const missingEmails = targetEmails.filter(
      email => !foundEmails.includes(email)
    );

    if (missingEmails.length > 0) {
      throw new Error(
        `Employee records not found: ${missingEmails.join(', ')}`
      );
    }

    const credentials = [];

    for (const employee of result.rows) {
      const existing = await client.query(
        `SELECT id, role, employee_id
         FROM users
         WHERE LOWER(email) = LOWER($1)`,
        [employee.email]
      );

      if (existing.rows.length > 0) {
        const user = existing.rows[0];

        if (user.role !== 'Employee') {
          throw new Error(
            `Account for ${employee.email} is not an Employee account.`
          );
        }

        if (
          user.employee_id !== null &&
          Number(user.employee_id) !== Number(employee.id)
        ) {
          throw new Error(
            `Account ${employee.email} is already linked to another employee.`
          );
        }

        await client.query(
          `UPDATE users
           SET employee_id = $1
           WHERE id = $2`,
          [employee.id, user.id]
        );

        console.log(`Linked existing account: ${employee.email}`);
        continue;
      }

      const temporaryPassword = randomBytes(9).toString('base64url');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const created = await client.query(
        `INSERT INTO users (name, email, password, employee_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, employee_id`,
        [
          employee.name,
          employee.email,
          hashedPassword,
          employee.id
        ]
      );

      credentials.push({
        email: employee.email,
        temporaryPassword
      });

      console.log('Created account:', created.rows[0].email);
    }

    await client.query('COMMIT');

    console.log('\nTemporary login credentials:');
    console.table(credentials);
    console.log(
      'Save these passwords securely. They are displayed only for this run.'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Account creation failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createEmployeeLogins();
