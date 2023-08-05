import { Response } from 'express';
import { Request } from '../../middleware';
import { io } from '../../server';
import Mail from '../../models/mail';

const mail = new Mail();

export const createMail = async (req: Request, res: Response) => {
  try {
    console.log('Delivered');
    const requestData = {
      ...req.body,
      sender_id: req.user?.id as unknown as number,
      from: req.body.to,
      to: JSON.parse(req.body.to),
      cc: JSON.parse(req.body.cc),
      bcc: JSON.parse(req.body.bcc),
      attachments:
        // @ts-ignore
        req?.files?.attachments.length > 0
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
    console.log(requestData);
    return;
    const response = await mail.createMail(requestData);
    io.emit('mails', { action: 'CREATE', data: response });
    res.status(201).json({ data: response });
  } catch (error) {
    res.status(400).json({ errors: (error as Error).message });
  }
};
