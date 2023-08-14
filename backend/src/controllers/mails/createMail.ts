import { Response } from 'express';
import { Request } from '../../middleware';
import { io } from '../../server';
import Mail from '../../models/mail';

const mail = new Mail();

export const createMail = async (req: Request, res: Response) => {
  try {
    const requestData = {
      from: {
        user_id: req.user?.id as unknown as number,
        email: req.user?.email as string
      },
      to: JSON.parse(req.body.to),
      cc: JSON.parse(req.body.cc),
      bcc: JSON.parse(req.body.bcc),
      subject: req.body.subject,
      message: req.body.message,
      attachments:
        // @ts-ignore
        req?.files?.attachments
          ? // @ts-ignore
            req?.files?.attachments.map((file) => ({
              file_name: file.originalname,
              file_url: file.path,
              thumbnail:
                '/images/icons/file-icons/png.' +
                file.originalname.split('.')[1],
              size: file.size
            }))
          : []
    };
    const response = await mail.createMail(requestData);

    io.emit('mails', { action: 'CREATE', data: response });
    res.status(201).json({ data: response });
  } catch (error) {
    res.status(400).json({ errors: (error as Error).message });
  }
};
