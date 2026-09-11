const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend('YOUR_RESEND_API_KEY');
const authCodes = {};

app.post('/api/send-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    authCodes[email] = code;

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: '[비밀번호 확인기] 요청하신 인증 코드입니다.',
            html: `<p>인증 코드 6자리는 다음과 같습니다: <strong>${code}</strong></p>`
        });

        res.json({ success: true, message: '이메일로 인증 코드가 발송되었습니다.' });
    } catch (error) {
        res.status(500).json({ success: false, message: '이메일 전송 실패', error: error.message });
    }
});

app.post('/api/verify-code', (req, res) => {
    const { email, code } = req.body;

    if (authCodes[email] && authCodes[email] === code) {
        delete authCodes[email];
        res.json({ success: true, message: '인증 성공' });
    } else {
        res.status(400).json({ success: false, message: '인증 코드가 일치하지 않습니다.' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
