import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://shadracnyamweya_db_user:shadrack1247@mindfultech.ucovvzi.mongodb.net/mindfultech?retryWrites=true&w=majority')
  .then(() => { console.log('✅ Connected!'); process.exit(0); })
  .catch(e => { console.log('❌ Error:', e.message); process.exit(1); });