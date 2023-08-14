import { PoolClient } from 'pg';
import { pgClient } from '../database';
import Attachment, { AttachmentType } from './attachment';
import MailRecipient, { RecipientType } from './mailRecipient';
import MailFolder, { FolderTypes } from './mailFolder';

export type MailType = {
  id?: number;
  from: { user_id: number; email: string };
  to: { user_id: number; email: string }[];
  cc: { user_id: number; email: string }[];
  bcc: { user_id: number; email: string }[];
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
  async createMail(m: MailType): Promise<any> {
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
          values: [m.from.user_id, m.subject, m.message]
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
        const mailFolderResult = await mailFolder.createMailFolder(connection, {
          mail_id: mail_id,
          user_id: m.from.user_id,
          folder: FolderTypes.SENT
        });

        const recipientQuery = {
          text: `
          INSERT INTO mail_recipients
          (mail_id, recipient_id, recipient_email, recipient_type, reply_to_mail_id, reply_to_recipient_id)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
          `,
          values: [
            mail_id,
            m.from.user_id,
            m.from.email,
            RecipientType.TO,
            null,
            null
          ]
        };
        await connection.query(recipientQuery);

        // Recipients
        const mailRecipient = new MailRecipient();
        const mailRecipientResult = await mailRecipient.createMailRecipients(
          connection,
          {
            mail_id: mail_id,
            from: m.from,
            to: m.to,
            cc: m.cc,
            bcc: m.bcc
          }
        );
        return {
          id: result.rows[0].id,
          from: m.from,
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
          m.id,
          m.subject,
          m.message,
          (
          SELECT json_build_object(
            'email', mr.recipient_email,
            'name', u.first_name || ' ' || u.last_name,
            'avatar', COALESCE(pp.image_url, null)
          )
          FROM users u
          LEFT JOIN (
              SELECT DISTINCT ON (user_id) *
              FROM profile_pictures
              ORDER BY user_id, created_at DESC
            ) AS pp ON pp.user_id = u.id
            LEFT JOIN mail_recipients mr ON m.id = mr.mail_id
            WHERE m.sender_id = u.id AND mr.recipient_id = u.id
            GROUP BY m.id, u.id, pp.image_url, mr.recipient_email
          ) AS "from",
          mf.folder,
          COALESCE((ARRAY_AGG(ml.label::TEXT) FILTER (WHERE ml.mail_id = m.id AND ml.user_id = $1)), ARRAY[]::TEXT[]) AS labels,
          EXISTS (SELECT 1 FROM read_mails rm WHERE m.id = rm.mail_id AND rm.user_id = $1) AS is_read,
          EXISTS (SELECT 1 FROM starred_mails sm WHERE m.id = sm.mail_id AND sm.user_id = $1) AS is_starred,
          COALESCE((ARRAY_AGG(mr2.mail_id) FILTER (WHERE mr2.mail_id IS NOT NULL)), ARRAY[]::integer[]) AS replies,
          COALESCE((JSON_AGG(
            json_build_object(
              'file_name', a.file_name,
              'thumbnail', a.thumbnail,
              'url', a.file_url,
              'size', a.size
            )
          ) FILTER (WHERE a.mail_id = m.id)), '[]') AS attachments,
          (
            SELECT array_agg(
              json_build_object(
                'name', u.first_name || ' ' || u.last_name,
                'email', mr.recipient_email
              )
            )
            FROM users u
            LEFT JOIN mail_recipients mr ON mr.mail_id = m.id
            WHERE u.id = mr.recipient_id AND mr.recipient_id != $1
          ) AS to,
          COALESCE((ARRAY_AGG(json_build_object('name', u.first_name, 'email', mr1.recipient_email)) FILTER (WHERE mr1.recipient_type = 'CC')), ARRAY[]::json[]) AS cc,
          COALESCE((ARRAY_AGG(json_build_object('name', u.first_name, 'email', mr1.recipient_email)) FILTER (WHERE mr1.recipient_type = 'BCC')), ARRAY[]::json[]) AS bcc,
          m.created_at
        FROM mails m
        LEFT JOIN attachments a ON m.id = a.mail_id
        LEFT JOIN mail_labels ml ON m.id = ml.mail_id AND ml.user_id = $1
        LEFT JOIN mail_folders mf ON m.id = mf.mail_id AND mf.user_id = $1
        LEFT JOIN deleted_mails dm ON m.id = dm.mail_id AND dm.user_id = $1
        LEFT JOIN mail_recipients mr1 ON m.id = mr1.mail_id
        LEFT JOIN mail_recipients mr2 ON m.id = mr2.reply_to_mail_id AND mr2.recipient_id = $1
        LEFT JOIN users u ON mr1.recipient_id = u.id
        WHERE (mr1.recipient_id = $1 OR mr2.recipient_id = $1 OR mr2.reply_to_recipient_id = $1) AND dm.user_id IS NULL
        GROUP BY m.id, mf.folder
        ORDER BY m.created_at
        `,
        values: [user_id]
      };
      const result = await connection.query(query);

      if (result.rows.length > 0) {
        for (const mail of result.rows) {
          if (mail.labels === '{}') {
            mail.labels = [];
          }
          if (mail.attachments === null) {
            mail.attachments = [];
          }
          if (mail.replies[0] === null) {
            mail.replies = [];
          }
          if (mail.cc === null) {
            mail.cc = [];
          }
          if (mail.bcc === null) {
            mail.bcc = [];
          }
        }
      }

      return result.rows;
    });
  }
  async getMail(id: number, user_id: number): Promise<MailType> {
    return this.withConnection(async (connection: PoolClient) => {
      const query = {
        text: `
        SELECT
          m.id,
          m.subject,
          m.message,
          (
          SELECT json_build_object(
            'email', mr.recipient_email,
            'name', u.first_name || ' ' || u.last_name,
            'avatar', COALESCE(pp.image_url, null)
          )
          FROM users u
          LEFT JOIN (
              SELECT DISTINCT ON (user_id) *
              FROM profile_pictures
              ORDER BY user_id, created_at DESC
            ) AS pp ON pp.user_id = u.id
            LEFT JOIN mail_recipients mr ON m.id = mr.mail_id
            WHERE m.sender_id = u.id AND mr.recipient_id = u.id
            GROUP BY m.id, u.id, pp.image_url, mr.recipient_email
          ) AS "from",
          mf.folder,
          COALESCE((ARRAY_AGG(ml.label) FILTER (WHERE ml.mail_id = m.id AND ml.user_id = $2)), ARRAY[]::label_types[]) AS labels,
          EXISTS (SELECT 1 FROM read_mails rm WHERE m.id = rm.mail_id AND rm.user_id = $2) AS is_read,
          EXISTS (SELECT 1 FROM starred_mails sm WHERE m.id = sm.mail_id AND sm.user_id = $2) AS is_starred,
          COALESCE((ARRAY_AGG(mr2.mail_id) FILTER (WHERE mr2.mail_id IS NOT NULL)), ARRAY[]::integer[]) AS replies,
          COALESCE((JSON_AGG(
            json_build_object(
              'file_name', a.file_name,
              'thumbnail', a.thumbnail,
              'url', a.file_url,
              'size', a.size
            )
          ) FILTER (WHERE a.mail_id = m.id)), '[]') AS attachments,
          (
            SELECT array_agg(
              json_build_object(
                'name', u.first_name || ' ' || u.last_name,
                'email', mr.recipient_email
              )
            )
            FROM users u
            LEFT JOIN mail_recipients mr ON mr.mail_id = m.id
            WHERE u.id = mr.recipient_id AND mr.recipient_id != $2
          ) AS to,
          COALESCE((ARRAY_AGG(json_build_object('name', u.first_name, 'email', mr1.recipient_email)) FILTER (WHERE mr1.recipient_type = 'CC')), ARRAY[]::json[]) AS cc,
          COALESCE((ARRAY_AGG(json_build_object('name', u.first_name, 'email', mr1.recipient_email)) FILTER (WHERE mr1.recipient_type = 'BCC')), ARRAY[]::json[]) AS bcc,
          m.created_at
        FROM mails m
        LEFT JOIN attachments a ON m.id = a.mail_id
        LEFT JOIN mail_labels ml ON m.id = ml.mail_id AND ml.user_id = $2
        LEFT JOIN mail_folders mf ON m.id = mf.mail_id AND mf.user_id = $2
        LEFT JOIN deleted_mails dm ON m.id = dm.mail_id AND dm.user_id = $2
        LEFT JOIN mail_recipients mr1 ON m.id = mr1.mail_id
        LEFT JOIN mail_recipients mr2 ON m.id = mr2.reply_to_mail_id AND mr2.recipient_id = $2
        LEFT JOIN users u ON mr1.recipient_id = u.id
        WHERE m.id = $1 AND dm.user_id IS NULL
        GROUP BY m.id, mf.folder
        ORDER BY m.created_at
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
