import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const from = process.env.AUTH_EMAIL!
const appUrl = process.env.NEXT_PUBLIC_APP_URL!

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${appUrl}/verify-email?token=${token}`

  await resend.emails.send({
    from,
    to: email,
    subject: "Verifica tu correo — Ducky University",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #17222D;">Bienvenido a Ducky University</h2>
        <p>Haz clic en el siguiente botón para verificar tu correo electrónico:</p>
        <a href="${url}" style="
          display: inline-block;
          background: #ccb581;
          color: #17222D;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          margin: 16px 0;
        ">Verificar Email</a>
        <p style="color: #7f7e76; font-size: 12px;">
          Este enlace expira en 24 horas. Si no creaste una cuenta ignora este mensaje.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${appUrl}/reset-password?token=${token}`

  await resend.emails.send({
    from,
    to: email,
    subject: "Restablecer contraseña — Ducky University",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #17222D;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña:</p>
        <a href="${url}" style="
          display: inline-block;
          background: #ccb581;
          color: #17222D;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          margin: 16px 0;
        ">Cambiar Contraseña</a>
        <p style="color: #7f7e76; font-size: 12px;">
          Este enlace expira en 1 hora. Si no solicitaste esto ignora este mensaje.
        </p>
      </div>
    `,
  })
}