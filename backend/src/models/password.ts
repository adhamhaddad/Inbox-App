import { PoolClient } from 'pg';
import { pgClient } from '../database';
import { hash, compare } from '../utils/password';

export interface PasswordType {
  id?: number;
  password: string;
  user_id: number;
}

type ResetPasswordType = {
  current_password: string;
  new_password: string;
};
class Password {
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
  async createPassword(connection: PoolClient, p: PasswordType): Promise<void> {
    const password = await hash(p.password);
    const query = {
      text: 'INSERT INTO passwords (password, user_id) VALUES ($1, $2)',
      values: [password, p.user_id]
    };
    await connection.query(query);
  }
  async updatePassword(user_id: number, p: ResetPasswordType): Promise<void> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'SELECT password FROM passwords WHERE user_id=$1',
        values: [user_id]
      };
      const result = await connection.query(query);
      if (result.rows.length) {
        const { password } = result.rows[0];
        const check = await compare(p.current_password, password);
        if (check) {
          const password = await hash(p.new_password);
          const query = {
            text: 'UPDATE passwords SET password=$2 WHERE user_id=$1',
            values: [user_id, password]
          };
          await connection.query(query);
          return;
        }
        throw new Error('Current password is incorrect.');
      }
      throw new Error('User id not exists.');
    });
  }
}
export default Password;
