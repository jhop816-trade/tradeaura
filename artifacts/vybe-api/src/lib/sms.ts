import twilio from "twilio";

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const FROM = process.env.TWILIO_PHONE_NUMBER ?? "";

export async function sendSms(to: string, body: string) {
  if (!client || !FROM) return; // SMS disabled if no keys
  try {
    await client.messages.create({ from: FROM, to, body });
  } catch (e) {
    console.error("SMS failed:", e);
  }
}

export const SMS = {
  newBooking: (providerPhone: string, clientName: string, serviceName: string, date: string) =>
    sendSms(providerPhone, `VYBE: New booking! ${clientName} booked ${serviceName} on ${date}. Open your dashboard to accept.`),

  bookingConfirmed: (clientPhone: string, providerName: string, serviceName: string, date: string) =>
    sendSms(clientPhone, `VYBE: Confirmed! Your ${serviceName} with ${providerName} on ${date} is confirmed.`),

  bookingDeclined: (clientPhone: string, providerName: string) =>
    sendSms(clientPhone, `VYBE: ${providerName} declined your booking request. Browse other providers at vybe.app`),
};
