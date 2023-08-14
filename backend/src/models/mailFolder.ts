import { PoolClient } from 'pg';
import { pgClient } from '../database';

export enum FolderTypes {
  INBOX = 'INBOX',
  SENT = 'SENT',
  SPAM = 'SPAM',
  DRAFT = 'DRAFT',
  TRASH = 'TRASH'
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
  async updateMailFolder(
    f: MailFolderType & { mail_ids: number[] }
  ): Promise<any> {
    return this.withConnection(async (connection: PoolClient) => {
      const results: FolderTypes[] = [];
      if (f.mail_ids.length) {
        for (const id of f.mail_ids) {
          const query = {
            text: 'UPDATE mail_folders SET folder=$3 WHERE mail_id=$1 AND user_id=$2 RETURNING folder',
            values: [id, f.user_id, f.folder]
          };
          const result = await connection.query(query);
          if (!result.rows.length) {
            const query = {
              text: 'INSERT INTO mail_folders (mail_id, user_id, folder) VALUES ($1, $2, $3) RETURNING folder',
              values: [id, f.user_id, f.folder]
            };
            const result = await connection.query(query);
            return results.push(result.rows[0].folder);
          }
          results.push(result.rows[0].folder);
        }
      }
      return results;
    });
  }
}
export default MailFolder;
