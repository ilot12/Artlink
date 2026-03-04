/**
 * 이메일 전송 서비스
 *
 * - nodemailer를 사용한 SMTP 이메일 전송
 * - 환경변수(SMTP_HOST 등)로 설정, 미설정 시 콘솔 로그만 출력
 * - 지원하기 시 Artist 포트폴리오를 Gallery 오너에게 전송
 *
 * @see backend/.env - SMTP 설정
 */
import nodemailer from 'nodemailer';

// SMTP 설정이 있으면 실제 전송, 없으면 콘솔 로그 모드
const hasSmtpConfig = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

interface PortfolioEmailData {
  artistName: string;
  artistEmail: string;
  biography?: string;
  exhibitionHistory?: string;
  imageUrls: string[];
  exhibitionTitle: string;
  galleryName: string;
  galleryOwnerEmail: string;
}

/**
 * Artist 포트폴리오를 Gallery 오너에게 이메일로 전송
 * SMTP 미설정 시 콘솔에 로그만 출력 (개발 환경용)
 */
export async function sendPortfolioEmail(data: PortfolioEmailData): Promise<void> {
  const imageHtml = data.imageUrls.length > 0
    ? `<h3>작품 사진</h3><div>${data.imageUrls.map(url =>
        `<img src="${url}" style="max-width:300px;margin:4px;" />`
      ).join('')}</div>`
    : '';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2>ArtLink - 새로운 지원이 접수되었습니다</h2>
      <p><strong>${data.galleryName}</strong>의 <strong>${data.exhibitionTitle}</strong> 공모에 새로운 지원이 있습니다.</p>
      <hr/>
      <h3>지원자 정보</h3>
      <p><strong>이름:</strong> ${data.artistName}</p>
      <p><strong>이메일:</strong> ${data.artistEmail}</p>
      ${data.biography ? `<h3>작가 약력</h3><p>${data.biography}</p>` : ''}
      ${data.exhibitionHistory ? `<h3>전시 참가 이력</h3><p>${data.exhibitionHistory}</p>` : ''}
      ${imageHtml}
      <hr/>
      <p style="color:#888;font-size:12px;">이 메일은 ArtLink 플랫폼에서 자동 발송되었습니다.</p>
    </div>
  `;

  if (!transporter) {
    console.log('[Mailer] SMTP 미설정 - 이메일 로그:');
    console.log(`  To: ${data.galleryOwnerEmail}`);
    console.log(`  Subject: [ArtLink] ${data.exhibitionTitle} 공모 지원 - ${data.artistName}`);
    console.log(`  Artist: ${data.artistName} (${data.artistEmail})`);
    console.log(`  Images: ${data.imageUrls.length}장`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: data.galleryOwnerEmail,
    subject: `[ArtLink] ${data.exhibitionTitle} 공모 지원 - ${data.artistName}`,
    html,
  });
}
