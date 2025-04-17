import nodemailer from 'nodemailer';

// This would be replaced with a real email service in production
const createTestTransport = async () => {
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// For production, you would use something like:
const createProdTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    // Use the appropriate transport based on environment
    const transporter = process.env.NODE_ENV === 'production'
      ? createProdTransport()
      : await createTestTransport();

    const info = await transporter.sendMail({
      from: `"Blog2Email" <${process.env.EMAIL_FROM || 'noreply@blog2email.com'}>`,
      to,
      subject,
      html,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const formatBlogPostEmail = (
  blogTitle: string,
  postTitle: string,
  postDescription: string,
  postUrl: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0369a1; margin-bottom: 0;">New Post on ${blogTitle}</h1>
      <h2 style="margin-top: 10px; margin-bottom: 5px;">${postTitle}</h2>
      <p style="color: #4b5563; margin-bottom: 20px;">${postDescription || 'No description available.'}</p>
      <a href="${postUrl}" 
         style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Read Full Post
      </a>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        You received this email because you're subscribed to updates from ${blogTitle} via Blog2Email.
        <br/>
        <a href="#" style="color: #0ea5e9;">Unsubscribe</a> or manage your <a href="#" style="color: #0ea5e9;">preferences</a>.
      </p>
    </div>
  `;
}; 