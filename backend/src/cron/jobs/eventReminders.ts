import { supabase } from '../../config/supabase.js';
import { sendEmail } from '../../services/email.js';

export async function sendEventReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id, title, start_date, location, online_url,
      event_registrations(user_id, profiles(email, full_name))
    `)
    .gte('start_date', tomorrow.toISOString())
    .lt('start_date', dayAfter.toISOString())
    .eq('status', 'upcoming');

  if (error) throw error;

  let remindersSent = 0;

  for (const event of events || []) {
    for (const registration of event.event_registrations || []) {
      const profile = registration.profiles as { email: string; full_name: string } | null;
      if (!profile?.email) continue;

      await sendEmail({
        to: profile.email,
        subject: `Reminder: ${event.title} is tomorrow!`,
        type: 'event_reminder',
        data: {
          eventTitle: event.title,
          eventDate: new Date(event.start_date).toLocaleString('en-GB', {
            dateStyle: 'full',
            timeStyle: 'short',
          }),
          location: event.location || 'Online',
          onlineUrl: event.online_url,
        },
      });
      remindersSent++;
    }
  }

  console.log(`Sent ${remindersSent} event reminders`);
}
