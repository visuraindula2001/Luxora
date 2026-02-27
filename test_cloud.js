require('dotenv').config({ path: require('path').join(__dirname, 'server', '.env') });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
    try {
        console.log('Testing Cloudinary configured with:', cloudinary.config().cloud_name);
        const res = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4AWP4zwAAAgABB5MDBQAAAABJRU5ErkJggg==');
        console.log('Upload success:', res.public_id);
    } catch (e) {
        console.error('Upload failed:', e);
    }
}

testCloudinary();
