import { Customer, Invoice } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.');
    }

    return new OpenAI({
        apiKey: apiKey,
    });
};

export const createCustomerEmail = async (customerData: Customer, invoice: Invoice) => {
    const openai = getOpenAIClient();

    const itemsList = invoice.items.map(item => `- ${item.description} (Quantity: ${item.quantity}, Unit Price: $${item.unitPrice})`).join('\n');
    const prompt = `Create a customer email for ${customerData.name} 
                regarding their invoice. The invoice number is ${invoice.invoiceNumber}, 
                due on ${invoice.dueDate}, 
                with a total amount of $${invoice.totalAmount}. The invoice includes the following items: ${itemsList}
                Write the email in a professional tone.

                Address the customer politely and include a call to action for payment.

                return json with separate fields for "subject" and "text" text content

                {
                    "subject": "string",
                    "text": "string",
                }
                
`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 500,
    });
    return response.choices[0].message?.content || '';
};

export async function POST(request: NextRequest) {
    try {
        const { customer, invoice } = await request.json();

        const emailContent = await createCustomerEmail(customer, invoice);
        
        // Clean the response - remove markdown code blocks if present
        let cleanedContent = emailContent;
        if (cleanedContent.includes('```json')) {
            cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        }
        
        // Parse the JSON response from OpenAI
        const parsedContent = JSON.parse(cleanedContent);

        return NextResponse.json(parsedContent);
    } catch (error) {
        console.error('Error generating email:', error);
        return NextResponse.json(
            { error: 'Failed to generate email' },
            { status: 500 }
        );
    }
}