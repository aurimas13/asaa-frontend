import cron from 'node-cron';
import { updateProductRatings } from './jobs/updateRatings.js';
import { sendEventReminders } from './jobs/eventReminders.js';
import { cleanupOldCarts } from './jobs/cleanupCarts.js';
import { processAbandonedCarts } from './jobs/abandonedCarts.js';

export function setupCronJobs() {
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running: Update product ratings');
    try {
      await updateProductRatings();
    } catch (err) {
      console.error('Rating update failed:', err);
    }
  });

  cron.schedule('0 9 * * *', async () => {
    console.log('Running: Send event reminders');
    try {
      await sendEventReminders();
    } catch (err) {
      console.error('Event reminders failed:', err);
    }
  });

  cron.schedule('0 3 * * *', async () => {
    console.log('Running: Cleanup old carts');
    try {
      await cleanupOldCarts();
    } catch (err) {
      console.error('Cart cleanup failed:', err);
    }
  });

  cron.schedule('0 10,18 * * *', async () => {
    console.log('Running: Process abandoned carts');
    try {
      await processAbandonedCarts();
    } catch (err) {
      console.error('Abandoned cart processing failed:', err);
    }
  });

  console.log('Cron jobs scheduled successfully');
}
