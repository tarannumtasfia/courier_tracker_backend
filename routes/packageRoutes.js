import express from 'express';
import PackageEvent from '../models/Package.js';
import Alert from '../models/alert.js'; // ✅ Add this import

const router = express.Router();

//
// 🔁 POST /api/packages/update (Courier updates go here)
//
// Example backend route to get latest package events regardless of status
router.get('/all', async (req, res) => {
  try {
    const packages = await PackageEvent.aggregate([
      { $sort: { event_timestamp: -1 } },
      {
        $group: {
          _id: "$package_id",
          package_id: { $first: "$package_id" },
          status: { $first: "$status" },
          lat: { $first: "$lat" },
          lon: { $first: "$lon" },
          eta: { $first: "$eta" },
          last_updated: { $first: "$event_timestamp" },
        }
      }
    ]);
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { package_id, status, lat, lon, timestamp, note, eta } = req.body;

    // ✅ Check if this exact event already exists (idempotency)
    const existing = await PackageEvent.findOne({
      package_id,
      status,
      event_timestamp: timestamp
    });

    if (existing) {
      return res.status(200).json({ message: 'Duplicate event ignored' });
    }

    const event = new PackageEvent({
      package_id,
      status,
      lat,
      lon,
      note,
      eta,
      event_timestamp: timestamp,
      received_at: new Date()
    });

    await event.save();

    // ✅ Clear any previous stuck alert
    await Alert.deleteOne({ package_id });

    // 🔥 Emit real-time update to all dispatchers
    req.io.emit('package_updated', {
      package_id,
      status,
      lat,
      lon,
      eta,
      event_timestamp: timestamp
    });

    res.status(200).json({ message: 'Package update received' });
  } catch (error) {
    console.error('Error in /update:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//
// ✅ GET /api/packages/active
//
router.get('/active', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activePackages = await PackageEvent.aggregate([
  {
    $match: {
      status: { $nin: ['DELIVERED', 'CANCELLED'] },
      event_timestamp: { $gte: twentyFourHoursAgo }
    }
  },
  { $sort: { event_timestamp: -1 } },
  {
    $group: {
      _id: "$package_id",
      latestEvent: { $first: "$$ROOT" }  // pick entire document as latestEvent
    }
  },
  {
    $replaceRoot: { newRoot: "$latestEvent" } // replace root with latestEvent document
  }
]);


    res.json(activePackages);
  } catch (err) {
    console.error('Error fetching active packages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//
// ✅ GET /api/packages/:package_id/history
//
router.get('/:package_id/history', async (req, res) => {
  const { package_id } = req.params;

  try {
    const history = await PackageEvent.find({ package_id }).sort({ event_timestamp: 1 });

    if (!history.length) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(history);
  } catch (err) {
    console.error(`Error fetching history for package ${package_id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//
// ✅ POST /api/packages/create
// Use this to add a new package (first tracking entry)
//
router.post('/create', async (req, res) => {
  try {
    const { package_id, lat, lon, eta, note } = req.body;

    // Initial status is usually "PICKED_UP" or "IN_TRANSIT"
    const status = "PICKED_UP";
    const timestamp = new Date();

    // Avoid duplicate creation
    const existing = await PackageEvent.findOne({
      package_id,
      status,
      event_timestamp: timestamp
    });

    if (existing) {
      return res.status(409).json({ message: "Package already exists" });
    }

    const newEvent = new PackageEvent({
      package_id,
      status,
      lat,
      lon,
      eta,
      note,
      event_timestamp: timestamp,
      received_at: new Date()
    });

    await newEvent.save();

    // No alert needed on creation

    // 🔥 Emit real-time update
    req.io.emit('package_updated', {
      package_id,
      status,
      lat,
      lon,
      eta,
      event_timestamp: timestamp
    });

    res.status(201).json({ message: "Package created", package_id });
  } catch (err) {
    console.error("Error creating package:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
