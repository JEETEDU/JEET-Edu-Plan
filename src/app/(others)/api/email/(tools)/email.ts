import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.NEXT_PUBLIC_AUTH_USER,
        pass: process.env.NEXT_PUBLIC_AUTH_PASS,
    },
    // tls: {
    //     rejectUnauthorized: false
    // },
});

export type ContactType = {
    title: string;
    name: string;
    contact: string;
    content: string;
};

type MailOptionType = {
    to: string[];
    from: string;
    subject: string;
    text: string;
};


export function sendEmail({name, contact, title, content}: ContactType) {
    const mailOptions: MailOptionType = {
        from: process.env.NEXT_PUBLIC_AUTH_USER || '',
        to: ['seoho7777.kim@gmail.com', 'dev@hegelty.me'],
        subject: `[JEET Edu Plan] ${title}`,
        text: `
이름: ${name}
연락처: ${contact}

---
        
${content}
`
    };

    transporter.sendMail(mailOptions).then();
}