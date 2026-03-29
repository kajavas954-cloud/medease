require('dotenv').config();
const { User } = require('./models');
const nodemailer = require('nodemailer');

async function test() {
  try {
    const email = 'testuser@yopmail.com';
    let user = await User.findOne({ where: { email } });
    if (!user) {
       user = await User.create({ name: 'Test User', email, password: '123', phone: '123', age: 20, gender: 'Male', bloodGroup: 'O+' });
    }

    const otp = '123456';
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60000);
    await user.save();

    nodemailer.createTestAccount(async (err, account) => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host, port: account.smtp.port, secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass }
      });
      const info = await transporter.sendMail({
        from: '"MedEase" <noreply@medease.com>',
        to: email,
        subject: 'Your Password Reset OTP',
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`
      });
      console.log('Email successfully drafted for:', email);
      console.log('Ethereal Email Preview URL:', nodemailer.getTestMessageUrl(info));
      process.exit(0);
    });
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}
test();
