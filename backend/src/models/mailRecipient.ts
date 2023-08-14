import { PoolClient } from 'pg';
import { pgClient } from '../database';
import MailFolder, { FolderTypes } from './mailFolder';

export enum RecipientType {
  TO = 'TO',
  CC = 'CC',
  BCC = 'BCC',
  REPLY_TO = 'REPLY_TO'
}

export type MailRecipientType = {
  id?: number;
  mail_id: number;
  recipient_id: number;
  recipient_email: string;
  recipient_type: RecipientType;
  reply_to_mail_id: number;
  reply_to_recipient_id: number;
};

type MailRecipientTypes = {
  mail_id: number;
  from: { user_id: number; email: string };
  to: { user_id: number; email: string }[];
  cc: { user_id: number; email: string }[];
  bcc: { user_id: number; email: string }[];
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
          text: `
          INSERT INTO mail_recipients
          (mail_id, recipient_id, recipient_email, recipient_type, reply_to_mail_id, reply_to_recipient_id)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
          `,
          values: [
            m.mail_id,
            recipient.user_id,
            recipient.email,
            RecipientType.TO,
            null, // This is null for now (reply_to_mail_id)
            null
          ]
        };
        const result = await connection.query(query);

        await mailFolder.createMailFolder(connection, {
          mail_id: m.mail_id,
          user_id: recipient.user_id,
          folder: FolderTypes.INBOX
        });
        toResult.push(result.rows[0].recipient_email);
      }
    }

    const { cc } = m;
    if (cc.length) {
      for (const recipient of cc) {
        const query = {
          text: `
          INSERT INTO mail_recipients
          (mail_id, recipient_id, recipient_email, recipient_type, reply_to_mail_id, reply_to_recipient_id)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
          `,
          values: [
            m.mail_id,
            recipient.user_id,
            recipient.email,
            RecipientType.CC,
            null, // This is null for now (reply_to_mail_id)
            null
          ]
        };
        const result = await connection.query(query);
        await mailFolder.createMailFolder(connection, {
          mail_id: m.mail_id,
          user_id: recipient.user_id,
          folder: FolderTypes.INBOX
        });
        ccResult.push(result.rows[0].recipient_email);
      }
    }
    const { bcc } = m;
    if (bcc.length) {
      for (const recipient of bcc) {
        const query = {
          text: `
          INSERT INTO mail_recipients
          (mail_id, recipient_id, recipient_email, recipient_type, reply_to_mail_id, reply_to_recipient_id)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
          `,
          values: [
            m.mail_id,
            recipient.user_id,
            recipient.email,
            RecipientType.BCC,
            null, // This is null for now (reply_to_mail_id)
            null
          ]
        };
        const result = await connection.query(query);

        await mailFolder.createMailFolder(connection, {
          mail_id: m.mail_id,
          user_id: recipient.user_id,
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
