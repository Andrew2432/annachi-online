import { get } from 'config';
import nodemailer from 'nodemailer';
import ejs from 'ejs';

import logger from './logger';
import { CustomSendMailOptions } from '../typings/SendMail';

const sendMail = async (
  to: string,
  subject: string,
  mailOptions: CustomSendMailOptions
) => {
  try {
    // Only for development purpose
    // const testAccount = await nodemailer.createTestAccount();
    // console.log(testAccount);

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: get('mailer.user'),
        pass: get('mailer.pass'),
      },
    });

    const renderEmail = await ejs.renderFile(
      `${__dirname}/../views/${mailOptions.template}.ejs`,
      { ...mailOptions.values }
    );

    const info = await transporter.sendMail({
      from: get('mailer.from'),
      to,
      subject,
      html: renderEmail,
    });

    console.log(nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
    logger.error(`>>>>>\n Send Mail Error: ${JSON.stringify(error)} \n<<<<<\n`);
  }
};

export default sendMail;
