type ResetPasswordEmailProps = {
  username: string;
  resetUrl: string;
};

export function ResetPasswordEmailTemplate({
  username,
  resetUrl,
}: ResetPasswordEmailProps) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: ui-monospace, 'Geist Mono', monospace; background-color: #fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.05);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ea8e3c 0%, #f4a261 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">
                    Réinitialisation de mot de passe
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #27272a;">
                    Bonjour <strong>${username}</strong>,
                  </p>

                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #52525b;">
                    Vous avez demandé à réinitialiser votre mot de passe pour votre compte <strong>Run Together</strong>.
                  </p>

                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #52525b;">
                    Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 30px;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ea8e3c 0%, #f4a261 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0px 4px 6px -1px rgba(234, 142, 60, 0.4);">
                          Réinitialiser mon mot de passe
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative link -->
                  <div style="background-color: #fafafa; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 10px; font-size: 14px; line-height: 20px; color: #52525b;">
                      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 20px; word-break: break-all; font-family: ui-monospace, monospace;">
                      <a href="${resetUrl}" style="color: #ea8e3c; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </p>
                  </div>

                  <!-- Security info -->
                  <div style="border-left: 4px solid #ea8e3c; background-color: #fef3e7; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #9a5a1f;">
                      ⚠️ Important
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #9a5a1f;">
                      Ce lien est valide pendant <strong>1 heure</strong> et ne peut être utilisé qu'une seule fois.
                    </p>
                  </div>

                  <p style="margin: 0; font-size: 14px; line-height: 20px; color: #71717a;">
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 30px; border-top: 1px solid #e5e5e5;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom: 12px;">
                        <span style="display: inline-block; font-size: 20px; font-weight: 700; color: #ea8e3c; font-family: ui-monospace, monospace;">
                          Run Together
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a3a3a3;">
                          © ${new Date().getFullYear()} Run Together. Tous droits réservés.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
