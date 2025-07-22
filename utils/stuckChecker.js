// utils/stuckChecker.js
import PackageEvent from '../models/Package.js';
import Alert from '../models/alert.js';

export const checkForStuckPackages = async (io) => {
  const now = new Date();
  const THIRTY_MIN_AGO = new Date(now.getTime() - 30 * 60 * 1000);

  // Get most recent event per package
  const recentEvents = await PackageEvent.aggregate([
    {
      $match: {
        status: { $nin: ['DELIVERED', 'CANCELLED'] },
        event_timestamp: { $lte: THIRTY_MIN_AGO }
      }
    },
    { $sort: { event_timestamp: -1 } },
    {
      $group: {
        _id: '$package_id',
        package_id: { $first: '$package_id' },
        status: { $first: '$status' },
        last_seen: { $first: '$event_timestamp' },
        lat: { $first: '$lat' },
        lon: { $first: '$lon' }
      }
    }
  ]);

  for (const stuck of recentEvents) {
    const alreadyAlerted = await Alert.findOne({ package_id: stuck.package_id });

    if (!alreadyAlerted) {
      // Save alert to avoid duplicate
      await Alert.create({
        package_id: stuck.package_id,
        status: stuck.status,
        last_seen: stuck.last_seen
      });

      // Emit alert to dashboard
      io.emit('package_stuck', {
        ...stuck,
        alert_type: 'STUCK',
        triggered_at: now
      });

      console.log(`🚨 Stuck alert: ${stuck.package_id} last seen at ${stuck.last_seen}`);
    }
  }
};
