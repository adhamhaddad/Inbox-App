import { PoolClient } from 'pg';
import { pgClient } from '../database';
import MailFolder, { FolderTypes } from './mailFolder';

enum RecipientType {
  'TO',
  'CC',
  'BCC',
  'REPLY_TO'
}

export type MailRecipientType = {
  id?: number;
  mail_id: number;
  recipient_id: number;
  recipient_email: string;
  recipient_type: RecipientType;
  created_at?: Date;
};
type MailRecipientTypes = {
  sender_id: number;
  mail_id: number;
  to: MailRecipientType[];
  cc: MailRecipientType[];
  bcc: MailRecipientType[];
};
type MailRecipientTypeReturn = {
  to: MailRecipientType[];
  cc: MailRecipientType[];
  bcc: MailRecipientType[];
};

class MailRecipient {
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
  async createMailRecipients(
    connection: PoolClient,
    m: MailRecipientTypes
  ): Promise<MailRecipientTypeReturn> {
    const toResult = [];
    const ccResult = [];
    const bccResult = [];
    const mailFolder = new MailFolder();

    const { to } = m;
    if (to.length) {
      for (const recipient of to) {
        const query = {
          text: 'INSERT INTO mail_recipients (mail_id, recipient_id, recipient_email, recipient_type) VALUES ($1, $2, $3, $4) RETURNING *',
          values: [
            m.mail_id,
            recipient.recipient_id,
            recipient.recipient_email,
            RecipientType.TO
          ]
        };
        const result = await connection.query(query);

        await mailFolder.createMailFolder(connection, {
          mail_id: m.mail_id,
          user_id: m.sender_id,
          folder: FolderTypes.INBOX
        });
        toResult.push(result.rows[0].recipient_email);
      }
    }

    const { cc } = m;
    if (cc.length) {
      for (const recipient of cc) {
        const query = {
          text: 'INSERT INTO mail_recipients (mail_id, recipient_id, recipient_email, recipient_type) VALUES ($1, $2, $3, $4) RETURNING *',
          values: [
            m.mail_id,
            recipient.recipient_id,
            recipient.recipient_email,
            RecipientType.CC
          ]
        };
        const result = await connection.query(query);
        await mailFolder.createMailFolder(connection, {
          mail_id: m.mail_id,
          user_id: m.sender_id,
          folder: FolderTypes.INBOX
        });
        ccResult.push(result.rows[0].recipient_email);
      }
    }
    const { bcc } = m;
    if (bcc.length) {
      for (const recipient of bcc) {
        const query = {
          text: 'INSERT INTO mail_recipients (mail_id, recipient_id, recipient_email, recipient_type) VALUES ($1, $2, $3, $4) RETURNING *',
          values: [
            m.mail_id,
            recipient.recipient_id,
            recipient.recipient_email,
            RecipientType.BCC
          ]
        };
        const result = await connection.query(query);

        await mailFolder.createMailFolder(connection, {
          mail_id: m.mail_id,
          user_id: m.sender_id,
          folder: FolderTypes.INBOX
        });
        bccResult.push(result.rows[0].recipient_email);
      }
    }

    return {
      to: toResult,
      cc: ccResult,
      bcc: bccResult
    };
  }
}
export default MailRecipient;
