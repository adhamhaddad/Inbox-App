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

class MailLabel {
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
  async updateMailLabel(
    f: MailLabelType & { mail_ids: number[] }
  ): Promise<any> {
    return this.withConnection(async (connection: PoolClient) => {
      const results: MailLabelType[] = [];
      if (f.mail_ids.length) {
        for (const id of f.mail_ids) {
          const query = {
            text: 'UPDATE mail_labels SET label=$3 WHERE mail_id=$1 AND user_id=$2 RETURNING label',
            values: [id, f.user_id, f.label]
          };
          const result = await connection.query(query);
          if (!result.rows.length) {
            const query = {
              text: 'INSERT INTO mail_labels (mail_id, user_id, label) VALUES ($1, $2, $3) RETURNING label',
              values: [id, f.user_id, f.label]
            };
            const result = await connection.query(query);
            return results.push(result.rows[0]);
          }
          results.push(result.rows[0]);
        }
      }
      return results;
    });
  }
}
export default MailLabel;
