import { PoolClient } from 'pg';
import { pgClient } from '../database';
import Password, { PasswordType } from './password';

export type UserType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
  delete_at?: Date;
};
class User {
  async withConnection<T>(
    callback: (connection: PoolClient) => Promise<T>
  ): Promise<T> {
    const connection = await pgClient.connect();
    try {
      return await callback(connection);
    } catch (error) {
      throw new Error((error as Error).message);
    } finally {
      connection.release();
    }
  }
  async withTransaction<T>(
    connection: PoolClient,
    callback: () => Promise<T>
  ): Promise<T> {
    try {
      await connection.query('BEGIN');
      const result = await callback();
      await connection.query('COMMIT');
      return result;
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    }
  }
  async createUser(u: UserType & PasswordType): Promise<UserType> {
    return this.withConnection(async (connection: PoolClient) => {
      return this.withTransaction(connection, async () => {
        const password = new Password();
        const query = {
          text: `
            INSERT INTO users (first_name, last_name, email)
            VALUES ($1, $2, $3)
            RETURNING id, first_name, last_name, email
          `,
          values: [
            u.first_name.trim().toLocaleLowerCase(),
            u.last_name.trim().toLocaleLowerCase(),
            u.email.trim().toLocaleLowerCase()
          ]
        };
        const result = await connection.query(query);
        const { id: user_id } = result.rows[0];
        await password.createPassword(connection, {
          user_id,
          password: u.password
        });
        return result.rows[0];
      });
    });
  }
  async getUser(id: number): Promise<UserType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'SELECT id, first_name, last_name, email FROM users WHERE id=$1',
        values: [id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async getUserByEmail(email: string): Promise<UserType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: `
          SELECT u.id, u.first_name, u.last_name, u.email, COALESCE(pp.image_url, null) AS image_url
          FROM users u
          LEFT JOIN (
            SELECT DISTINCT ON (user_id) *
            FROM profile_pictures
            ORDER BY user_id, created_at DESC
          ) AS pp ON pp.user_id = u.id
          WHERE u.email LIKE $1
        `,
        values: [`%${email}%`]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async updateUser(id: number, u: UserType): Promise<UserType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: `
          UPDATE users SET first_name=$2, last_name=$3, updated_at=CURRENT_TIMESTAMP
          WHERE id=$1
          RETURNING *
        `,
        values: [
          id,
          u.first_name.trim().toLocaleLowerCase(),
          u.last_name.trim().toLocaleLowerCase()
        ]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async changeEmail(id: number, u: UserType): Promise<UserType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: `
          UPDATE users SET email=$2, updated_at=CURRENT_TIMESTAMP
          WHERE id=$1
          RETURNING *
        `,
        values: [id, u.email.trim().toLocaleLowerCase()]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async deleteUser(id: number): Promise<UserType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'UPDATE users SET updated_at=CURRENT_TIMESTAMP, deleted_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING id',
        values: [id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
}
export default User;
