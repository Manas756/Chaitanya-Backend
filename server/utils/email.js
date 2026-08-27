const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOTPEmail = async (email, otp, type, teamName) => {
    const safeType = escapeHtml(type);
    const safeTeamName = escapeHtml(teamName) || "Not provided";
    const mailOptions = {
        from: `"Chaitanya" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Chaitanya OTP Code",

        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chaitanya OTP</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: Arial, Helvetica, sans-serif;
        ">

        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
            <tr>
                <td align="center">

                    <table width="100%" cellpadding="0" cellspacing="0"
                        style="
                            max-width: 500px;
                            background-color: #ffffff;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                        ">

                        <!-- HEADER -->
                        <tr>
                            <td style="
                                padding: 30px;
                                text-align: center;
                                background-color: #111111;
                            ">

                                <h1 style="
                                    margin: 0;
                                    color: #ffffff;
                                    font-size: 28px;
                                    letter-spacing: 2px;
                                ">
                                    CHAITANYA
                                </h1>

                                <p style="
                                    margin: 8px 0 0;
                                    color: #aaaaaa;
                                    font-size: 13px;
                                ">
                                    THE AIM
                                </p>

                            </td>
                        </tr>


                        <!-- MAIN CONTENT -->
                        <tr>
                            <td style="padding: 40px 35px;">

                                <h2 style="
                                    margin: 0 0 15px;
                                    color: #111111;
                                    font-size: 22px;
                                ">
                                    Verify your email
                                </h2>


                                <p style="
                                    margin: 0 0 25px;
                                    color: #555555;
                                    font-size: 15px;
                                    line-height: 1.6;
                                ">
                                    Use the verification code below to
                                    <strong>${safeType}</strong> on Chaitanya.
                                </p>


                                <!-- OTP BOX -->

                                <div style="
                                    text-align: center;
                                    margin: 30px 0;
                                ">

                                    <div style="
                                        display: inline-block;
                                        padding: 18px 35px;
                                        background-color: #f3f3f3;
                                        border-radius: 12px;
                                        border: 1px solid #e5e5e5;
                                    ">

                                        <span style="
                                            font-size: 32px;
                                            font-weight: bold;
                                            letter-spacing: 8px;
                                            color: #111111;
                                        ">
                                            ${otp}
                                        </span>

                                    </div>

                                </div>


                                <p style="
                                    margin: 0;
                                    text-align: center;
                                    color: #777777;
                                    font-size: 13px;
                                ">
                                    This code will expire in
                                    <strong>5 minutes</strong>.
                                </p>


                                <!-- AFTER CONFIRMATION -->

                                <div style="
                                    margin-top: 30px;
                                    padding: 18px;
                                    background-color: #f8f8f8;
                                    border-radius: 10px;
                                    border-left: 4px solid #111111;
                                ">

                                    <p style="
                                        margin: 0;
                                        color: #444444;
                                        font-size: 14px;
                                        line-height: 1.6;
                                    ">

                                        <strong>After confirmation:</strong>
                                        <br>

                                        Once your email is successfully
                                        verified, you can continue with your
                                        <strong>${safeType}</strong> on Chaitaniya.

                                    </p>

                                </div>


                                <!-- REGISTRATION CONFIRMATION -->

                                <div style="
                                    margin-top: 20px;
                                    padding: 20px;
                                    background-color: #f8f8f8;
                                    border-radius: 10px;
                                    border-left: 4px solid #111111;
                                ">

                                    <p style="
                                        margin: 0 0 8px;
                                        color: #777777;
                                        font-size: 12px;
                                        text-transform: uppercase;
                                        letter-spacing: 1px;
                                    ">
                                        Registration Confirmed
                                    </p>


                                    <p style="
                                        margin: 0;
                                        color: #111111;
                                        font-size: 18px;
                                        font-weight: bold;
                                    ">
                                        Team: ${safeTeamName}
                                    </p>


                                    <p style="
                                        margin: 8px 0 0;
                                        color: #777777;
                                        font-size: 13px;
                                        line-height: 1.5;
                                    ">
                                        Your team has been successfully
                                        registered for Chaitanya.
                                    </p>

                                </div>


                                <!-- SECURITY MESSAGE -->

                                <hr style="
                                    border: none;
                                    border-top: 1px solid #eeeeee;
                                    margin: 30px 0;
                                ">


                                <p style="
                                    margin: 0;
                                    color: #999999;
                                    font-size: 12px;
                                    line-height: 1.6;
                                ">

                                    If you didn't request this code,
                                    you can safely ignore this email.

                                    <br><br>

                                    Do not share this OTP with anyone.

                                </p>

                            </td>
                        </tr>


                        <!-- FOOTER -->

                        <tr>
                            <td style="
                                padding: 20px;
                                text-align: center;
                                background-color: #fafafa;
                            ">

                                <p style="
                                    margin: 0;
                                    color: #999999;
                                    font-size: 12px;
                                ">
                                    © ${new Date().getFullYear()} Chaitanya
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

        </body>
        </html>
        `,
    };

    try {

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent:", info.messageId);

        return info;

    } catch (error) {

        console.error("Error sending email:", error);

        throw error;

    }
};