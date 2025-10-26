
import Mailjet from 'node-mailjet';
import { NextRequest, NextResponse } from 'next/server';


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
    const FROM_EMAIL = process.env.FROM_EMAIL;
    if (!FROM_EMAIL) {
        throw new Error('Sender email is not configured. Please set FROM_EMAIL in your environment variables.');
    }

    try {
        const request = mailjet.post("send", { 'version': 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: FROM_EMAIL
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

        const response = await request;
        console.log('Email sent successfully:', response.body);
        return NextResponse.json({ success: true, data: response.body });
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export async function POST(request: NextRequest) {
    try {
        const { toEmail, subject, textContent } = await request.json();
        
        if (!toEmail || !subject || !textContent) {
            return NextResponse.json(
                { error: 'Missing required fields: toEmail, subject, or textContent' },
                { status: 400 }
            );
        }

        const result = await sendEmail({ toEmail, subject, textContent });
        return result;
    } catch (error) {
        console.error('Error in POST /api/send-email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}