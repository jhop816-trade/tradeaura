import { Resend } from 'resend'

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
}

export async function sendBookingConfirmation(booking: {
  client_name: string
  client_email: string
  vehicle_name: string
  start_date: string
  end_date: string
  deposit_amount: number
}) {
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: booking.client_email,
    subject: `Booking Confirmed — ${booking.vehicle_name}`,
    html: `
      <h2>Your booking is confirmed!</h2>
      <p>Hi ${booking.client_name},</p>
      <p>Your rental of the <strong>${booking.vehicle_name}</strong> has been confirmed and your payment has been received.</p>
      <p><strong>Dates:</strong> ${booking.start_date} → ${booking.end_date}</p>
      <p>We'll reach out shortly to confirm pickup logistics.</p>
      <p>Questions? Reply to this email or DM us on Instagram.</p>
    `,
  })
}

export async function sendOwnerAlert(booking: {
  client_name: string
  client_email: string
  client_phone: string
  vehicle_name: string
  start_date: string
  end_date: string
  deposit_amount: number
}) {
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.OWNER_EMAIL!,
    subject: `New Booking — ${booking.vehicle_name} (${booking.start_date})`,
    html: `
      <h2>New Booking Received</h2>
      <p><strong>Vehicle:</strong> ${booking.vehicle_name}</p>
      <p><strong>Dates:</strong> ${booking.start_date} → ${booking.end_date}</p>
      <p><strong>Client:</strong> ${booking.client_name}</p>
      <p><strong>Email:</strong> ${booking.client_email}</p>
      <p><strong>Phone:</strong> ${booking.client_phone}</p>
      <p><strong>Deposit:</strong> $${booking.deposit_amount}</p>
    `,
  })
}
