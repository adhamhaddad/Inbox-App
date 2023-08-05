import { PoolClient } from 'pg';
import { pgClient } from '../database';

type PhoneType = {
  id?: number;
  phone: string;
  is_default?: boolean;
  is_verified?: boolean;
  user_id: number;
};

class Phone {
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
  async createPhone(p: PhoneType): Promise<PhoneType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'INSERT INTO phones (phone, user_id) VALUES ($1, $2) RETURNING *',
        values: [p.phone, p.user_id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async getPhones(user_id: number): Promise<PhoneType[]> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'SELECT * FROM phones WHERE user_id=$1',
        values: [user_id]
      };
      const result = await connection.query(query);
      return result.rows;
    });
  }
  async updatePhone(id: number, p: PhoneType): Promise<PhoneType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'UPDATE phones SET phone=$2 WHERE id=$1 RETURNING *',
        values: [id, p.phone]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async deletePhone(id: number): Promise<PhoneType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'DELETE FROM phones WHERE id=$1 RETURNING id',
        values: [id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
}
export default Phone;
