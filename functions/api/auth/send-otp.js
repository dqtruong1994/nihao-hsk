/**
 * Cloudflare Worker / Pages Function: POST /api/auth/send-otp
 * Gửi mã OTP xác thực email đến hộp thư người dùng qua Email Service thật
 * Hỗ trợ: Gmail (qua Google Apps Script Webhook 100% Free), Resend API, Brevo API
 */

const DEFAULT_MAIL_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyTLv22IiCpxeRoaxgyI2uK6Hb27f5hHQKOjokCJa_IGIxYrIuHbWQIHRxQYW-7sE9g/exec';
const OTP_SALT = 'nihao_hsk_salt_2026';

async function sha256(text) {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  try {
    const { email, webhookUrl: customWebhook, isTest } = await request.json();
    const cleanEmail = String(email || '').trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: 'Địa chỉ email không hợp lệ.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Nếu không phải là test gửi thử thì kiểm tra xem email đã được đăng ký chưa
    if (!isTest && env.DB) {
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
    const otpHash = await sha256(code + ':' + cleanEmail + ':' + OTP_SALT);

    // Lưu mã vào bảng email_verifications nếu có D1
    if (env.DB && !isTest) {
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

    let emailSent = false;
    let providerUsed = '';
    let sendError = '';

    // 1. GỬI QUA GMAIL (Google Apps Script Webhook) - 100% MIỄN PHÍ, KHÔNG TỐN TIỀN
    const activeWebhook = String(customWebhook || env.MAIL_WEBHOOK_URL || DEFAULT_MAIL_WEBHOOK).trim();
    if (activeWebhook) {
      try {
        const resp = await fetch(activeWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            email: cleanEmail,
            code: code,
            isTest: !!isTest,
            subject: isTest
              ? 'NiHao HSK · Thử nghiệm gửi email từ Gmail thành công!'
              : 'NiHao HSK · Mã xác nhận đăng ký tài khoản: ' + code,
            body: isTest
              ? 'Xin chào! Bạn vừa kiểm tra gửi thử email từ hệ thống NiHao HSK qua Gmail. Kết nối hoạt động rất tốt!'
              : `Xin chào,\n\nMã xác nhận đăng ký tài khoản NiHao HSK của bạn là: ${code}\n\nMã có hiệu lực trong vòng 10 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nNiHao HSK`,
            html: isTest
              ? `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #bbf7d0; border-radius: 14px; background: #f0fdf4;">
                  <div style="text-align: center; margin-bottom: 16px;">
                    <span style="display: inline-block; background: #10b981; color: #ffffff; font-weight: 800; font-size: 18px; padding: 6px 14px; border-radius: 10px;">✅ Kết nối Gmail thành công!</span>
                  </div>
                  <h3 style="color: #065f46; text-align: center; margin: 0 0 10px;">Xin chào Quản trị viên</h3>
                  <p style="color: #1e293b; font-size: 14px; line-height: 1.6;">
                    Bạn vừa bấm nút gửi thử email test từ trang Quản trị viên <b>NiHao HSK</b>. Hộp thư Gmail của bạn đã sẵn sàng tự động gửi mã OTP xác nhận cho học viên và nhân viên mới!
                  </p>
                  <p style="color: #047857; font-size: 12px; margin-top: 14px;">Thời gian gửi: ${new Date().toLocaleString('vi-VN')}</p>
                </div>
              `
              : `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <span style="display: inline-block; background: #6657d9; color: #ffffff; font-weight: 900; font-size: 20px; padding: 8px 14px; border-radius: 12px;">中 NiHao HSK</span>
                  </div>
                  <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 12px; text-align: center;">Mã xác nhận đăng ký tài khoản</h2>
                  <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                    Xin chào, bạn vừa yêu cầu tạo tài khoản trên hệ thống học tiếng Trung <b>NiHao HSK</b>. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất đăng ký:
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
                    Email gửi tự động từ hệ thống NiHao HSK qua Gmail. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.
                  </div>
                </div>
              `
          })
        });

        if (resp.status >= 200 && resp.status < 400) {
          emailSent = true;
          providerUsed = 'gmail';
        } else {
          sendError = `Gmail Webhook trả về HTTP ${resp.status}`;
        }
      } catch (e) {
        sendError = `Lỗi kết nối Gmail Webhook: ${e.message}`;
      }
    }

    // 2. Dự phòng: Gửi qua Resend API (nếu có RESEND_API_KEY)
    if (!emailSent && env.RESEND_API_KEY) {
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
            subject: 'NiHao HSK · Mã xác nhận đăng ký: ' + code,
            html: `<p>Mã xác nhận của bạn là: <b>${code}</b></p>`
          })
        });
        if (resp.ok) {
          emailSent = true;
          providerUsed = 'resend';
        }
      } catch (e) {
        sendError = e.message;
      }
    }

    // 3. Dự phòng: Gửi qua Brevo API (nếu có BREVO_API_KEY)
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
            subject: 'NiHao HSK · Mã xác nhận đăng ký: ' + code,
            htmlContent: `<p>Mã xác thực của bạn là: <b>${code}</b></p>`
          })
        });
        if (resp.ok) {
          emailSent = true;
          providerUsed = 'brevo';
        }
      } catch (e) {
        sendError = e.message;
      }
    }

    // Trả về kết quả: Trả otpHash để client đối chiếu an toàn mà không lộ plaintext code
    return new Response(JSON.stringify({
      success: true,
      emailSent,
      provider: providerUsed,
      otpHash: emailSent ? otpHash : null,
      expiresAt,
      message: emailSent
        ? (isTest ? `Đã gửi email kiểm tra thành công tới ${cleanEmail} qua Gmail!` : `Đã gửi mã xác nhận 6 số đến hộp thư ${cleanEmail}.`)
        : `Chưa thể gửi email thật: ${sendError || 'Chưa cấu hình URL Google Apps Script của Gmail'}. Vui lòng liên hệ quản trị viên để thiết lập.`,
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
