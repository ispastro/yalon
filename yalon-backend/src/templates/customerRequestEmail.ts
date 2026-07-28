import { CustomerRequestInput } from '../validators/customerRequest.schema';

// Simple HTML-escape to prevent user input from breaking or injecting
// into the email markup (e.g. someone typing "<img src=x onerror=...>"
// as their company name).
function esc(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildCustomerRequestEmail(data: CustomerRequestInput): { subject: string; html: string } {
  const subject = `New Service Request from ${data.company_name}`;

  const staffBreakdownText = Object.entries(data.staff_breakdown || {})
    .filter(([, count]) => count && count > 0)
    .map(([role, count]) => `${count} ${role.replace(/_/g, ' ')}`)
    .join(', ') || '-';

  const positionsText = (data.positions_requested || []).map((p) => p.replace(/_/g, ' ')).join(', ') || '-';
  const serviceTypesText = (data.service_types || []).map((s) => s.replace(/_/g, ' ')).join(', ') || '-';

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
              <td align="right" valign="top" style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#c9a15a;padding-top:6px;">NEW SERVICE REQUEST</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="background-color:#c9a15a;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

      <!-- Intro -->
      <tr>
        <td style="padding:32px 32px 8px 32px;">
          <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#c9a15a;font-weight:bold;">GET IN TOUCH</div>
          <h1 style="font-family:Georgia,serif;font-size:26px;line-height:1.25;color:#0e3b29;margin:8px 0 0 0;">New staffing request from ${esc(data.company_name)}</h1>
          <p style="font-family:Georgia,serif;font-size:14px;color:#555;margin:12px 0 0 0;line-height:1.6;">
            A new service request just came in through the website. Confirm the roster and send a quotation within one business day.
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
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">CONTACT PERSON</div>
                      <div>${esc(data.contact_person)}${data.job_title ? ` (${esc(data.job_title)})` : ''}</div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">ORGANIZATION</div>
                      <div>${esc(data.company_name)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">PHONE</div>
                      <div><a href="tel:${esc(data.phone_number)}" style="color:#ffffff;text-decoration:none;">${esc(data.phone_number)}</a></div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">WHATSAPP</div>
                      <div>${esc(data.whatsapp_number)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">EMAIL</div>
                      <div><a href="mailto:${esc(data.email)}" style="color:#ffffff;text-decoration:none;">${esc(data.email)}</a></div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">CITY</div>
                      <div>${esc(data.city)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">EVENT DATE</div>
                      <div>${esc(data.event_date)}</div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">TIME</div>
                      <div>${esc(data.start_time)} - ${esc(data.end_time)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">VENUE</div>
                      <div>${esc(data.event_venue)}</div>
                    </td>
                    <td style="padding:0 0 14px 0;width:50%;vertical-align:top;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">GUESTS</div>
                      <div>${esc(data.number_of_guests)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 14px 0;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">SERVICE TYPE</div>
                      <div>${esc(serviceTypesText)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 14px 0;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">POSITIONS REQUESTED</div>
                      <div>${esc(positionsText)}</div>
                    </td>
                  </tr>
                  <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;"></td></tr>
                  <tr>
                    <td colspan="2" style="padding:0;">
                      <div style="color:#c9a15a;font-size:10px;letter-spacing:1.5px;margin-bottom:4px;">ROLES NEEDED &amp; HEADCOUNT</div>
                      <div>${esc(staffBreakdownText)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Additional details -->
      <tr>
        <td style="padding:0 32px 8px 32px;">
          <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;color:#c9a15a;font-weight:bold;margin-bottom:6px;">REQUIREMENTS</div>
          <p style="font-family:Georgia,serif;font-size:14px;color:#333;line-height:1.6;margin:0;background-color:#f6f1e7;padding:16px 18px;border-radius:6px;border-left:3px solid #c9a15a;">
            ${esc(data.requirements_description)}
          </p>
        </td>
      </tr>

      <!-- Special instructions -->
      <tr>
        <td style="padding:8px 32px 8px 32px;">
          <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;color:#c9a15a;font-weight:bold;margin-bottom:6px;">SPECIAL INSTRUCTIONS / DRESS CODE</div>
          <p style="font-family:Georgia,serif;font-size:14px;color:#333;line-height:1.6;margin:0;background-color:#f6f1e7;padding:16px 18px;border-radius:6px;border-left:3px solid #c9a15a;">
            ${esc(data.special_instructions)}
          </p>
        </td>
      </tr>

      <!-- Payment -->
      <tr>
        <td style="padding:8px 32px 8px 32px;">
          <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;color:#c9a15a;font-weight:bold;margin-bottom:6px;">PREFERRED PAYMENT METHOD</div>
          <p style="font-family:Arial,sans-serif;font-size:13px;color:#333;margin:0;">${esc(data.preferred_payment_method)}</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:28px 32px;">
          <a href="mailto:${esc(data.email)}" style="display:inline-block;background-color:#0e3b29;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-decoration:none;padding:14px 28px;border-radius:4px;">
            REPLY TO ${esc(data.contact_person)} &rarr;
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color:#f6f1e7;padding:20px 32px;border-top:1px solid #e8ddc8;">
          <p style="font-family:Arial,sans-serif;font-size:11px;color:#999;margin:0;letter-spacing:0.5px;">
            This request was submitted via the Yalon customer service registration form.
          </p>
        </td>
      </tr>

    </table>
  </div>
  `;

  return { subject, html };
}