import { PoolClient } from 'pg';
import { pgClient } from '../database';

enum LabelTypes {
  'PERSONAL',
  'IMPORTANT',
  'COMPANY',
  'PRIVATE'
}

type MailLabelType = {
  id: number;
  mail_id: number;
  user_id: number;
  label: LabelTypes;
};

class MailFolder {
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
  async createMailLabel(f: MailLabelType): Promise<MailLabelType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'INSERT INTO mail_labels (mail_id, user_id, label) VALUES ($1, $2, $3) RETURNING label',
        values: [f.mail_id, f.user_id, f.label]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async updateMailLabel(id: number, f: MailLabelType) {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'UPDATE mail_labels SET label=$3 WHERE id=$1 AND user_id=$2 RETURNING label',
        values: [id, f.user_id, f.label]
      };
      const result = await connection.query(query);
      if (!result.rows.length) {
        const query = {
          text: 'INSERT INTO mail_labels (mail_id, user_id, label) VALUES ($1, $2, $3) RETURNING label',
          values: [id, f.user_id, f.label]
        };
        const result = await connection.query(query);
        return result.rows[0];
      }
      return result.rows[0];
    });
  }
}
export default MailFolder;
