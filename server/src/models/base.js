import mongoose from 'mongoose';

export const oid = (ref, extra = {}) => ({ type: mongoose.Schema.Types.ObjectId, ref, ...extra });

// Every document carries an `owner`, so adding more users later needs no schema change.
export function make(name, definition) {
  const schema = new mongoose.Schema(
    { owner: oid('User', { required: true, index: true }), ...definition },
    { timestamps: true }
  );
  return mongoose.model(name, schema);
}
