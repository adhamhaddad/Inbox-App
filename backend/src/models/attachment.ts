import { PoolClient } from 'pg';
import { pgClient } from '../database';

export type AttachmentType = {
  id?: number;
  mail_id?: number;
  file_name: string;
  file_url: string;
  thumbnail?: string;
  size: string;
};

class Attachment {
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
  async createAttachment(
    connection: PoolClient,
    m: { mail_id: number } & { attachments: AttachmentType[] }
  ): Promise<AttachmentType[]> {
    const attachmentResult: AttachmentType[] = [];
    const { attachments } = m;
    if (attachments.length) {
      for (const file of attachments) {
        const query = {
          text: 'INSERT INTO attachments (mail_id, file_name, file_url, thumbnail, size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          values: [
            m.mail_id,
            file.file_name,
            file.file_url,
            file.thumbnail,
            file.size
          ]
        };
        await connection.query(query);
      }
    }
    return attachmentResult;
  }
}
export default Attachment;
