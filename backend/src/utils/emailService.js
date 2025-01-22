import nodemailer from 'nodemailer';

// Configure email transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'rddevs1910@gmail.com',
        pass: `${process.env.NODEMAILER_PASSWORD}`,
    },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
