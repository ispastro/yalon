import { EmployeeApplicationInput } from '../validators/employeeApplication.schema';

// Simple HTML-escape to prevent user input from breaking or injecting
// into the email markup.
function esc(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Distinct accent color from the customer-request email (gold #c9a15a),
// so the two email types are visually distinguishable at a glance in an inbox.
const ACCENT = '#a3443a'; // muted maroon/brick red — "staff application" identity

export function buildEmployeeApplicationEmail(data: EmployeeApplicationInput): { subject: string; html: string } {
  const subject = `[Staff Application] New Application — ${data.full_name} (${data.position_applied.replace(/_/g, ' ')})`;

  const availableDaysText = (data.available_days || []).map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') || '-';
  const skillsText = (data.skills || []).join(', ') || '-';

  const html = `
  <div style="margin:0;padding:32px 0;background-color:#eee6d8;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" align="center" style="background-color:#ffffff;border-radius:6px;overflow:hidden;max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background-color:#0e3b29;padding:24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
  <img src="cid:yalonlogo" alt="Yalon Professional Staffing Solutions" width="160" style="display:block;height:auto;border:0;">
</td>
              <td align="right" valign="top" style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:${ACCENT};padding-top:6px;">NEW STAFF APPLICATION</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="background-color:${ACCENT};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

      <!-- Intro -->
      <tr>
        <td style="padding:32px 32px 8px 32px;">
          <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:${ACCENT};font-weight:bold;">JOIN THE TEAM</div>
          <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.25;color:#0e3b29;margin:8px 0 0 0;">New application from ${esc(data.full_name)}</h1>
          <p style="font-family:Georgia,serif;font-size:14px;color:#555;margin:12px 0 0 0;line-height:1.6;">
            Applying for: <strong>${esc(data.position_applied.replace(/_/g, ' '))}</strong>. Review the details below and update the application status in the admin dashboard.
          </p>
        </td>
      </tr>

      <!-- Details card -->
      <tr>
        <td style="padding:24px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0e3b29;border-radius:6px;">
            <tr>
              <td style="padding:24px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#ffffff;">
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">DATE OF BIRTH</div>
                      <div>${esc(data.date_of_birth)}</div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">NATIONALITY</div>
                      <div>${esc(data.nationality)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">PHONE</div>
                      <div><a href="tel:${esc(data.phone_number)}" style="color:#ffffff;text-decoration:none;">${esc(data.phone_number)}</a></div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">WHATSAPP</div>
                      <div>${esc(data.whatsapp_number)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">EMAIL</div>
                      <div><a href="mailto:${esc(data.email)}" style="color:#ffffff;text-decoration:none;">${esc(data.email)}</a></div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">CITY</div>
                      <div>${esc(data.city)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 14px 0;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">EMERGENCY CONTACT</div>
                      <div>${esc(data.emergency_contact_name)} (${esc(data.emergency_contact_relationship)}) — ${esc(data.emergency_contact_phone)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">HOSPITALITY EXPERIENCE</div>
                      <div>${data.has_hospitality_experience ? 'Yes' : 'No'}</div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">YEARS OF EXPERIENCE</div>
                      <div>${esc(data.years_of_experience)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 14px 0;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">PREVIOUS COMPANY / POSITION</div>
                      <div>${esc(data.previous_company)} ${data.previous_position ? `— ${esc(data.previous_position)}` : ''}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">AVAILABLE DAYS</div>
                      <div>${esc(availableDaysText)}</div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">PREFERRED SHIFT</div>
                      <div>${esc(data.preferred_shift)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 14px 0;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">SKILLS</div>
                      <div>${esc(skillsText)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding:0;">
                      <div style="color:${ACCENT};font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">MEDICALLY FIT TO WORK</div>
                      <div>${data.medically_fit_to_work ? 'Yes' : `No — ${esc(data.medical_explanation)}`}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Documents note -->
      <tr>
        <td style="padding:0 32px 8px 32px;">
          <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;color:${ACCENT};font-weight:bold;margin-bottom:6px;">DOCUMENTS</div>
          <p style="font-family:Georgia,serif;font-size:14px;color:#333;line-height:1.6;margin:0;background-color:#f6f1e7;padding:16px 18px;border-radius:6px;border-left:3px solid ${ACCENT};">
            Passport photo, CV, national ID, and certificates (if provided) were uploaded and are attached to this applicant's record in Supabase. Review them securely in the admin dashboard rather than via email attachment.
          </p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:28px 32px;">
          <a href="mailto:${esc(data.email)}" style="display:inline-block;background-color:#0e3b29;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-decoration:none;padding:14px 28px;border-radius:4px;">
            CONTACT ${esc(data.full_name)} &rarr;
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color:#f6f1e7;padding:20px 32px;border-top:1px solid #e8ddc8;">
          <p style="font-family:Arial,sans-serif;font-size:11px;color:#999;margin:0;letter-spacing:0.5px;">
            This application was submitted via the Yalon casual employee registration form.
          </p>
        </td>
      </tr>

    </table>
  </div>
  `;

  return { subject, html };
}