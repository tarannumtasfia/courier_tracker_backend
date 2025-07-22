import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  package_id: { type: String, required: true },
  status: { type: String, required: true },
  lat: Number,
  lon: Number,
  event_timestamp: { type: Date, required: true },
  received_at: { type: Date, default: Date.now },
  note: String,
  eta: Date
});

export default mongoose.model('PackageEvent', packageSchema);
