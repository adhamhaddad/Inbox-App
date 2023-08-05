import { PoolClient } from 'pg';
import { pgClient } from '../database';

type StarredMailType = {
  mail_id: number;
  user_id: number;
};

class StarredMail {
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
  async createStarredMail(m: StarredMailType): Promise<StarredMailType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'INSERT INTO starred_mails (mail_id, user_id) VALUES ($1, $2) RETURNING *',
        values: [m.mail_id, m.user_id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async deleteStarredMail(mail_id: number, user_id: number) {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'DELETE FROM starred_mails WHERE mail_id=$1 AND user_id=$2 RETURNING *',
        values: [mail_id, user_id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
}
export default StarredMail;
