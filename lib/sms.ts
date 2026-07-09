import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSms(to: string, body: string) {
  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });
    return { success: true };
  } catch (error) {
    console.error("SMS error:", error);
    return { success: false, error: String(error) };
  }
}

export async function sendAppointmentReminder(
  phone: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string
) {
  const body = `Rappel SantéauMaroc : Votre RDV avec ${doctorName} est le ${date} à ${time}. Pour annuler, contactez le cabinet.`;
  return sendSms(phone, body);
}
