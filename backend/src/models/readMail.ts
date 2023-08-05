import { PoolClient } from 'pg';
import { pgClient } from '../database';

type ReadMailType = {
  mail_id: number;
  user_id: number;
  is_read: boolean;
  created_at?: Date;
};

class ReadMail {
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
  async createReadMail(m: ReadMailType): Promise<ReadMailType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'INSERT INTO read_mails (mail_id, user_id) VALUES ($1, $2) RETURNING *',
        values: [m.mail_id, m.user_id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async updateReadMail(mail_id: number, user_id: number) {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'UPDATE read_mails SET  is_read=false WHERE mail_id=$1 AND user_id=$2 RETURNING *',
        values: [mail_id, user_id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
}
export default ReadMail;
