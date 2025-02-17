import {ContactType} from './email';

export async function sendContactEmail(emailForm: ContactType) {
    const response = await fetch('/api/email', {
        method: 'POST',
        body: JSON.stringify(emailForm),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        // throw new Error(data.message || '서버 요청에 실패함');
        return {success: false};
    }

    return {success: true, data: data};
}