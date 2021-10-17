import mongoose from 'mongoose';
import { MONGO_URL } from './constants';

const Site = mongoose.model('Site', new mongoose.Schema({
  url: String,
  online: {
    type: Boolean,
    default: true,
  },
  alerted: {
    type: Boolean,
    default: false,
  }
}));

const url = 'CHANGE ME!';

(async () => {
  await mongoose.connect(MONGO_URL);
  const t = new Site({ url });
  const saved = await t.save();
  console.log('saved');
  await mongoose.disconnect();
})()