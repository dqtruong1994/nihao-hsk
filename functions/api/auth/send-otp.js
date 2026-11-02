/**
 * Cloudflare Worker / Pages Function: POST /api/auth/send-otp
 * Gửi mã OTP xác thực email đến hộp thư người dùng qua Email Service thật
 */

export async function onRequestPost({ request, env }) {
  try {
    const { email } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: 'Địa chỉ email nhân viên không hợp lệ.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Kiểm tra xem email đã được tài khoản nào đăng ký chưa
    if (env.DB) {
      try {
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
        if (existing) {
          return new Response(JSON.stringify({ error: 'Email này đã được sử dụng bởi một tài khoản khác.' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (dbErr) {
        console.warn('DB check error:', dbErr.message);
      }
    }

    // Tạo mã OTP ngẫu nhiên 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút

    // Lưu mã vào bảng email_verifications nếu có D1
    if (env.DB) {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS email_verifications (
            email TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL
          )
        `).run();

        await env.DB.prepare(`
          INSERT OR REPLACE INTO email_verifications (email, code, expires_at, created_at)
          VALUES (?, ?, ?, ?)
        `).bind(cleanEmail, code, expiresAt, Date.now()).run();
      } catch (storeErr) {
        console.warn('Store OTP error:', storeErr.message);
      }
    }

    // Tiến hành gửi email qua các dịch vụ đã cấu hình
    let emailSent = false;
    let providerUsed = '';
    let sendError = '';

    // 1. Gửi qua Resend API (nếu có biến môi trường RESEND_API_KEY)
    if (env.RESEND_API_KEY) {
      try {
        const fromEmail = env.RESEND_FROM || 'NiHao HSK <onboarding@resend.dev>';
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [cleanEmail],
            subject: 'NiHao HSK · Mã xác nhận đăng ký tài khoản',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="display: inline-block; background: #6657d9; color: #ffffff; font-weight: 900; font-size: 20px; padding: 8px 14px; border-radius: 12px;">中 NiHao HSK</span>
                </div>
                <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 12px; text-align: center;">Mã xác nhận đăng ký tài khoản</h2>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                  Xin chào, bạn (hoặc một nhân viên) vừa yêu cầu tạo tài khoản trên hệ thống học tiếng Trung <b>NiHao HSK</b>. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất đăng ký:
                </p>
                <div style="text-align: center; margin: 24px 0;">
                  <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4338ca; background: #eef2ff; border: 2px dashed #6366f1; padding: 12px 28px; border-radius: 12px;">
                    ${code}
                  </div>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 16px; text-align: center;">
                  ⏳ Mã xác nhận có hiệu lực trong vòng <b>10 phút</b>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
                </p>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
                  Nếu không phải bạn yêu cầu, bạn có thể an tâm bỏ qua email này.
                </div>
              </div>
            `
          })
        });
        if (resp.ok) {
          emailSent = true;
          providerUsed = 'resend';
        } else {
          const detail = await resp.text();
          sendError = `Resend API lỗi: ${detail}`;
        }
      } catch (e) {
        sendError = `Resend exception: ${e.message}`;
      }
    }

    // 2. Gửi qua Brevo API (Sendinblue) nếu có BREVO_API_KEY
    if (!emailSent && env.BREVO_API_KEY) {
      try {
        const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': env.BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'NiHao HSK', email: env.BREVO_SENDER || 'no-reply@nihaohsk.com' },
            to: [{ email: cleanEmail }],
            subject: 'NiHao HSK · Mã xác nhận đăng ký tài khoản: ' + code,
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px;">
                <h2 style="color: #6657d9; text-align: center;">NiHao HSK · Xác nhận Email</h2>
                <p>Mã xác thực của bạn để đăng ký tài khoản là:</p>
                <div style="text-align: center; margin: 24px 0;">
                  <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4338ca; background: #eef2ff; padding: 10px 24px; border-radius: 8px;">${code}</span>
                </div>
                <p style="color: #64748b; font-size: 13px;">Mã có hiệu lực trong vòng 10 phút.</p>
              </div>
            `
          })
        });
        if (resp.ok) {
          emailSent = true;
          providerUsed = 'brevo';
        } else {
          const detail = await resp.text();
          sendError = `Brevo API lỗi: ${detail}`;
        }
      } catch (e) {
        sendError = `Brevo exception: ${e.message}`;
      }
    }

    // 3. Gửi qua Webhook (Google Apps Script / Webhook Mailer) nếu có MAIL_WEBHOOK_URL
    if (!emailSent && env.MAIL_WEBHOOK_URL) {
      try {
        const resp = await fetch(env.MAIL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            subject: 'NiHao HSK · Mã xác nhận đăng ký: ' + code,
            body: `Mã xác nhận của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
            html: `<h2>Mã xác nhận NiHao HSK</h2><p>Mã của bạn là: <b>${code}</b></p>`
          })
        });
        if (resp.ok) {
          emailSent = true;
          providerUsed = 'webhook';
        } else {
          sendError = `Webhook lỗi: ${resp.status}`;
        }
      } catch (e) {
        sendError = `Webhook exception: ${e.message}`;
      }
    }

    // Trả về kết quả: TUYỆT ĐỐI KHÔNG TRẢ 'code' VỀ PHÍA TRÌNH DUYỆT
    return new Response(JSON.stringify({
      success: true,
      emailSent,
      provider: providerUsed,
      message: emailSent
        ? `Đã gửi mã xác nhận 6 số đến hộp thư ${cleanEmail}.`
        : `Yêu cầu xác thực đã được ghi nhận. (Cần cấu hình dịch vụ email để chuyển vào hộp thư: ${sendError || 'Chưa cài đặt RESEND_API_KEY hoặc BREVO_API_KEY'})`,
      requiresConfig: !emailSent
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi gửi mã OTP: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
