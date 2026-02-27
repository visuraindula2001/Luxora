const app = require('./server'); // This executes server.js
const cloudinary = require('./config/cloudinary');

console.log('Cloud Name:', cloudinary.config().cloud_name);
console.log('API Key:', cloudinary.config().api_key);
