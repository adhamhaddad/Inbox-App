import { PoolClient } from 'pg';
import { pgClient } from '../database';

export enum FolderTypes {
  'INBOX',
  'SENT',
  'SPAM',
  'DRAFT',
  'TRASH'
}

type MailFolderType = {
  id?: number;
  mail_id: number;
  user_id: number;
  folder: FolderTypes;
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
  async createMailFolder(
    connection: PoolClient,
    f: MailFolderType
  ): Promise<MailFolderType> {
    const query = {
      text: 'INSERT INTO mail_folders (mail_id, user_id, folder) VALUES ($1, $2, $3) RETURNING folder',
      values: [f.mail_id, f.user_id, f.folder]
    };
    const result = await connection.query(query);
    return result.rows[0];
  }
  async updateMailFolder(id: number, f: MailFolderType) {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'UPDATE mail_folders SET folder=$3 WHERE id=$1 AND user_id=$2 RETURNING folder',
        values: [id, f.user_id, f.folder]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
}
export default MailFolder;
