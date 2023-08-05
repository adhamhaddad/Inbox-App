import { PoolClient } from 'pg';
import { pgClient } from '../database';
import { compare } from '../utils/password';
import { UserType } from './user';

type AuthType = {
  email: string;
  password: string;
};

class Auth {
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
  async authUser(u: AuthType): Promise<AuthType & UserType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: `
          SELECT DISTINCT p.password, u.id
          FROM passwords p, users u
          WHERE
          p.user_id=u.id
          AND
          u.email=$1
        `,
        values: [u.email]
      };
      const result = await connection.query(query);
      if (result.rows.length) {
        const { id, password: hash } = result.rows[0];
        const check = await compare(u.password, hash);
        if (check) {
          const query = {
            text: 'SELECT id, first_name, last_name, email FROM users WHERE id=$1',
            values: [id]
          };
          const result = await connection.query(query);
          return result.rows[0];
        }
        throw new Error('Password is incorrect.');
      }
      throw new Error('Email not exist.');
    });
  }
  async authMe(id: string): Promise<UserType & AuthType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'SELECT id, first_name, last_name, email FROM users WHERE id=$1',
        values: [id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
}
export default Auth;
