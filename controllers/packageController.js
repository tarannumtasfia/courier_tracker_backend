import PackageEvent from '../models/Package.js';

export const ingestUpdate = async (req, res) => {
  const data = req.body;
  try {
    const event = new PackageEvent(data);
    await event.save();

    req.io.emit('packageUpdate', data); // broadcast real-time update
    res.status(201).json({ message: 'Event saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
