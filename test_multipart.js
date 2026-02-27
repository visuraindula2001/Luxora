async function testMultipart() {
    try {
        // 1. log in
        const authRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@luxora.com', password: 'admin123' })
        });
        const auth = await authRes.json();
        const token = auth.token;

        // 2. get category
        const catsRes = await fetch('http://localhost:5000/api/categories');
        const cats = await catsRes.json();
        const catId = cats[0]._id;

        // 3. create product with multipart
        const fd = new FormData();
        fd.append('name', 'Multipart Test');
        fd.append('description', 'Testing multipart');
        fd.append('price', '25.99');
        fd.append('stock', '15');
        fd.append('category', catId);
        fd.append('isActive', 'true');

        const prodRes = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        });

        let prodText = await prodRes.text();
        console.log('Create Response:', prodRes.status, prodText);

        const prod = JSON.parse(prodText);

        // 4. delete the product
        const delRes = await fetch(`http://localhost:5000/api/products/${prod._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Delete Response:', delRes.status, await delRes.text());

    } catch (e) {
        console.error('Error:', e);
    }
}

testMultipart();
