import { PoolClient } from 'pg';
import { pgClient } from '../database';
import Attachment, { AttachmentType } from './attachment';
import MailRecipient, { MailRecipientType } from './mailRecipient';
import MailFolder, { FolderTypes } from './mailFolder';

export type MailType = {
  id: number;
  sender_id: number;
  from?: string;
  to: MailRecipientType[];
  cc: MailRecipientType[];
  bcc: MailRecipientType[];
  subject: string;
  message: string;
  attachments: AttachmentType[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

class Mail {
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
  async withTransaction<T>(
    connection: PoolClient,
    callback: () => Promise<T>
  ): Promise<T> {
    try {
      await connection.query('BEGIN');
      const result = await callback();
      await connection.query('COMMIT');
      return result;
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    }
  }
  async createMail(m: MailType): Promise<MailType> {
    return this.withConnection(async (connection: PoolClient) => {
      return this.withTransaction(connection, async () => {
        const query = {
          text: `
          INSERT INTO mails
          (sender_id, subject, message)
          VALUES
          ($1, $2, $3)
          RETURNING *
          `,
          values: [m.sender_id, m.subject, m.message]
        };
        const result = await connection.query(query);
        const { id: mail_id } = result.rows[0];

        // Attachments
        const attachment = new Attachment();
        const attachmentResult = await attachment.createAttachment(connection, {
          mail_id: mail_id,
          attachments: m.attachments
        });

        // Mail Folder
        const mailFolder = new MailFolder();
        await mailFolder.createMailFolder(connection, {
          mail_id: mail_id,
          user_id: m.sender_id,
          folder: FolderTypes.SENT
        });

        // Recipients
        const mailRecipient = new MailRecipient();
        const mailRecipientResult = await mailRecipient.createMailRecipients(
          connection,
          {
            sender_id: m.sender_id,
            mail_id: mail_id,
            to: m.to,
            cc: m.cc,
            bcc: m.bcc
          }
        );

        return {
          id: result.rows[0].id,
          sender_id: m.sender_id,
          sender_email: m.from,
          ...mailRecipientResult,
          subject: result.rows[0].subject,
          message: result.rows[0].message,
          attachments: attachmentResult,
          created_at: result.rows[0].created_at
        };
      });
    });
  }
  async getMails(user_id: number): Promise<MailType[]> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: `
          SELECT
            m.id, m.user_id, m.subject, m.message, m.created_at,
            a.file_name, a.thumbnail, a.file_url, a.size, f.folder,
            COALESCE(array_agg(l.label), '{}') AS labels,
            COALESCE((rm.id IS NOT NULL), false) AS is_read,
            COALESCE((sm.id IS NOT NULL), false) AS is_starred,
            COALESCE(array_agg(mr2.mail_id), '{}') AS replies
          FROM mails m
          LEFT JOIN attachments a ON m.id = a.mail_id
          LEFT JOIN mail_labels ml ON m.id = ml.mail_id
          LEFT JOIN mail_folders mf ON m.id = mf.mail_id AND mf.user_id = $1
          LEFT JOIN read_mails rm ON m.id = rm.mail_id AND rm.user_id = $1
          LEFT JOIN starred_mails sm ON m.id = sm.mail_id AND sm.user_id = $1
          LEFT JOIN deleted_mails dm ON m.id = dm.mail_id AND dm.user_id = $1
          LEFT JOIN mail_recipients mr1 ON m.id = mr1.mail_id
          LEFT JOIN mail_recipients mr2 ON m.reply_to = mr2.mail_id
          WHERE
          (mr1.recipient_id = $1 OR mr2.recipient_id = $1) AND dm.id IS NULL
          GROUP BY m.id, a.id, f.id, l.id, rm.id, sm.id
          ORDER BY m.created_at
          `,
        values: [user_id]
      };
      const result = await connection.query(query);
      return result.rows;
    });
  }
  async getMail(id: number, user_id: number): Promise<MailType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: `
          SELECT
            m.id, m.user_id, m.subject, m.message, m.created_at,
            a.file_name, a.thumbnail, a.file_url, a.size, f.folder,
            COALESCE(array_agg(l.label), '{}') AS labels,
            COALESCE((rm.id IS NOT NULL), false) AS is_read,
            COALESCE((sm.id IS NOT NULL), false) AS is_starred,
            COALESCE(array_agg(m.id), '{}') AS replies
          FROM mails m, mail_recipients mr
          LEFT JOIN attachments a ON m.id = a.mail_id
          LEFT JOIN mail_labels ml ON m.id = ml.mail_id
          LEFT JOIN mail_folders mf ON m.id = mf.mail_id AND mf.user_id = $2
          LEFT JOIN read_mails rm ON m.id = rm.mail_id AND rm.user_id = $2
          LEFT JOIN starred_mails sm ON m.id = sm.mail_id AND sm.user_id = $2
          LEFT JOIN mr.recipient_type = 'REPLY_TO' ON m.id = mr.mail_id
          LEFT JOIN deleted_mails dm ON m.id = dm.mail_id AND dm.user_id = $2
          WHERE m.id = $1 AND dm.id IS NULL
          GROUP BY m.id, a.id, f.id, l.id, rm.id, sm.id
          `,
        values: [id, user_id]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async updateMail(id: number, m: MailType): Promise<MailType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'UPDATE mails SET message=$2, update_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *',
        values: [id, m.message]
      };
      const result = await connection.query(query);
      return result.rows[0];
    });
  }
  async deleteMail(id: number, user_id: number): Promise<MailType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: 'UPDATE mails SET updated_at=CURRENT_TIMESTAMP, deleted_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING id',
        values: [id]
      };
      const result = await connection.query(query);
      const { id: mail_id } = result.rows[0];
      // INSERT INTO delete_messages
      const deletedMailsQuery = {
        text: 'INSERT INTO deleted_mails (mail_id, user_id) VALUES ($1, $2) RETURNING *',
        values: [mail_id, user_id]
      };
      await connection.query(deletedMailsQuery);
      return result.rows[0];
    });
  }
}
export default Mail;
