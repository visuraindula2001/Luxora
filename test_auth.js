const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').join(__dirname, 'server', '.env') });
const mongoose = require('mongoose');
const User = require('./server/models/User');

async function testAuth() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({ email: 'admin@luxora.com' });
        console.log('DB User ID:', user._id.toString());

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('Generated Token Payload:', jwt.decode(token));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Verified Payload:', decoded);

        const foundUser = await User.findById(decoded.id);
        console.log('Found User via ID lookup:', foundUser ? 'YES' : 'NO');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        mongoose.disconnect();
    }
}
testAuth();
