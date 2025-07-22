// models/Alert.js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  package_id: { type: String, required: true, unique: true },
  status: { type: String },
  last_seen: { type: Date },
  triggered_at: { type: Date, default: Date.now },
});

export default mongoose.model('Alert', alertSchema);
