// src/lib/email.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const from   = process.env.AUTH_EMAIL!
const appUrl = process.env.NEXT_PUBLIC_APP_URL!

// ─── Helpers ───────────────────────────────────────────────
const base = (content: string) => `
  <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #f5f0e8; padding: 32px; border-radius: 12px;">
    <div style="text-align:center; margin-bottom: 24px;">
      <span style="font-size:22px; font-weight:900; color:#17222D; letter-spacing:2px;">DUCKY UNIVERSITY</span>
      <div style="font-size:11px; color:#ccb581; margin-top:2px;">Sistema de Biblioteca</div>
    </div>
    ${content}
    <div style="margin-top:32px; font-size:11px; color:#7f7e76; text-align:center;">
      Este es un correo automático — no respondas a este mensaje.
    </div>
  </div>
`

// ─── Auth emails ───────────────────────────────────────────
export async function sendVerificationEmail(email: string, token: string) {
  const url = `${appUrl}/verify-email?token=${token}`
  await resend.emails.send({
    from,
    to: email,
    subject: "Verifica tu correo — Ducky University",
    html: base(`
      <h2 style="color:#17222D;">Bienvenido a Ducky University</h2>
      <p style="color:#333;">Haz clic en el siguiente botón para verificar tu correo electrónico:</p>
      <a href="${url}" style="display:inline-block;background:#ccb581;color:#17222D;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Verificar Email
      </a>
      <p style="color:#7f7e76;font-size:12px;">Este enlace expira en 24 horas. Si no creaste una cuenta ignora este mensaje.</p>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${appUrl}/reset-password?token=${token}`
  await resend.emails.send({
    from,
    to: email,
    subject: "Restablecer contraseña — Ducky University",
    html: base(`
      <h2 style="color:#17222D;">Restablecer contraseña</h2>
      <p style="color:#333;">Recibimos una solicitud para restablecer tu contraseña:</p>
      <a href="${url}" style="display:inline-block;background:#ccb581;color:#17222D;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Cambiar Contraseña
      </a>
      <p style="color:#7f7e76;font-size:12px;">Este enlace expira en 1 hora. Si no solicitaste esto ignora este mensaje.</p>
    `),
  })
}

// ─── Préstamos emails ──────────────────────────────────────

/** Enviado al ADMIN cuando un usuario solicita un préstamo */
export async function sendPrestamoSolicitadoAdmin({
  adminEmail,
  usuarioNombre,
  usuarioEmail,
  libroTitulo,
  libroIsbn,
  fechaDevolucion,
  prestamoId,
}: {
  adminEmail: string
  usuarioNombre: string
  usuarioEmail: string
  libroTitulo: string
  libroIsbn: string
  fechaDevolucion: string
  prestamoId: number
}) {
  const url = `${appUrl}/dashboard/prestamos`
  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `Nueva solicitud de préstamo — ${libroTitulo}`,
    html: base(`
      <h2 style="color:#17222D;">Nueva Solicitud de Préstamo</h2>
      <p style="color:#333;">Un usuario ha solicitado un préstamo y está esperando tu aprobación.</p>
      <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #ccb581;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#7f7e76;width:140px;">Usuario:</td><td style="color:#17222D;font-weight:600;">${usuarioNombre}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Email:</td><td style="color:#17222D;">${usuarioEmail}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Libro:</td><td style="color:#17222D;font-weight:600;">${libroTitulo}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">ISBN:</td><td style="color:#17222D;">${libroIsbn}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Devolución esperada:</td><td style="color:#17222D;">${fechaDevolucion}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">ID Préstamo:</td><td style="color:#17222D;">#${prestamoId}</td></tr>
        </table>
      </div>
      <a href="${url}" style="display:inline-block;background:#17222D;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">
        Ir a Gestión de Préstamos
      </a>
    `),
  })
}

/** Enviado al USUARIO cuando el admin aprueba su préstamo */
export async function sendPrestamoAprobadoUsuario({
  userEmail,
  usuarioNombre,
  libroTitulo,
  libroEdicion,
  autores,
  codigoInterno,
  fechaPrestamo,
  fechaDevolucion,
  prestamoId,
}: {
  userEmail: string
  usuarioNombre: string
  libroTitulo: string
  libroEdicion: string | null
  autores: string
  codigoInterno: string
  fechaPrestamo: string
  fechaDevolucion: string
  prestamoId: number
}) {
  await resend.emails.send({
    from,
    to: userEmail,
    subject: `✅ Préstamo aprobado — ${libroTitulo}`,
    html: base(`
      <h2 style="color:#17222D;">¡Tu préstamo fue aprobado!</h2>
      <p style="color:#333;">Hola <strong>${usuarioNombre}</strong>, tu solicitud de préstamo fue aceptada. Ya puedes pasar a recoger tu libro a la biblioteca.</p>
      <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #22c55e;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#7f7e76;width:160px;">Libro:</td><td style="color:#17222D;font-weight:600;">${libroTitulo}</td></tr>
          ${libroEdicion ? `<tr><td style="padding:4px 0;color:#7f7e76;">Edición:</td><td style="color:#17222D;">${libroEdicion}</td></tr>` : ""}
          <tr><td style="padding:4px 0;color:#7f7e76;">Autores:</td><td style="color:#17222D;">${autores}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Código de copia:</td><td style="color:#17222D;font-family:monospace;">${codigoInterno}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Fecha de préstamo:</td><td style="color:#17222D;">${fechaPrestamo}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Fecha de devolución:</td><td style="color:#e53e3e;font-weight:600;">${fechaDevolucion}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">ID Préstamo:</td><td style="color:#17222D;">#${prestamoId}</td></tr>
        </table>
      </div>
      <p style="color:#7f7e76;font-size:13px;">Recuerda devolver el libro antes de la fecha de devolución para evitar multas.</p>
    `),
  })
}

/** Enviado al USUARIO cuando renueva un préstamo */
export async function sendRenovacionConfirmada({
  userEmail,
  usuarioNombre,
  libroTitulo,
  fechaAnterior,
  nuevaFecha,
  renovaciones,
  prestamoId,
}: {
  userEmail: string
  usuarioNombre: string
  libroTitulo: string
  fechaAnterior: string
  nuevaFecha: string
  renovaciones: number
  prestamoId: number
}) {
  await resend.emails.send({
    from,
    to: userEmail,
    subject: `🔄 Renovación confirmada — ${libroTitulo}`,
    html: base(`
      <h2 style="color:#17222D;">Renovación de Préstamo Confirmada</h2>
      <p style="color:#333;">Hola <strong>${usuarioNombre}</strong>, tu renovación fue procesada exitosamente.</p>
      <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #7c3aed;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#7f7e76;width:200px;">Libro:</td><td style="color:#17222D;font-weight:600;">${libroTitulo}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Fecha anterior de devolución:</td><td style="color:#7f7e76;text-decoration:line-through;">${fechaAnterior}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Nueva fecha de devolución:</td><td style="color:#17222D;font-weight:600;">${nuevaFecha}</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">Renovaciones usadas:</td><td style="color:#17222D;">${renovaciones} de 1</td></tr>
          <tr><td style="padding:4px 0;color:#7f7e76;">ID Préstamo:</td><td style="color:#17222D;">#${prestamoId}</td></tr>
        </table>
      </div>
      <p style="color:#7f7e76;font-size:13px;">Solo se permite 1 renovación por préstamo. Recuerda devolver el libro antes de la nueva fecha.</p>
    `),
  })
}
