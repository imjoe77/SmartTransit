const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log('Testing connection to:', process.env.MONGODB_URI?.split('@')[1]); // Log host part only
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ SUCCESSFULLY CONNECTED TO MONGODB');
    process.exit(0);
  } catch (err) {
    console.error('❌ CONNECTION FAILED');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    process.exit(1);
  }
}

test();
