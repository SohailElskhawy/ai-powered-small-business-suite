import Mailjet from 'node-mailjet';
const mailjet = Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC || '', process.env.MJ_APIKEY_PRIVATE || ''
);


interface SendEmailParams {
    toEmail: string;
    subject: string;
    textContent: string;
}

export const sendEmail = async ({
    toEmail,
    subject,
    textContent
}: SendEmailParams) => {
    const request = mailjet.post("send", { 'version': 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.FROM_EMAIL || '<your-email@example.com>'
                },
                To: [
                    {
                        Email: toEmail
                    }
                ],
                Subject: subject,
                TextPart: textContent
            }
        ]
    });

    try {
        const response = await request;
        return response.body;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
