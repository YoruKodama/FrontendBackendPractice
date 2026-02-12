const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

let products = [
    { id: 1, name: 'Смартфон XYZ Pro', price: 29990 },
    { id: 2, name: 'Ноутбук UltraBook', price: 59990 },
    { id: 3, name: 'Наушники Wireless Pro', price: 4990 }
];

app.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в API для управления товарами!',
        endpoints: {
            'GET /products': 'Просмотр всех товаров',
            'GET /products/:id': 'Просмотр товара по ID',
            'POST /products': 'Добавление товара',
            'PATCH /products/:id': 'Редактирование товара',
            'DELETE /products/:id': 'Удаление товара'
        }
    });
});


app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ 
            error: 'Название товара обязательно и должно быть строкой' 
        });
    }
    
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ 
            error: 'Цена товара обязательна и должна быть положительным числом' 
        });
    }
    
    
    const newProduct = {
        id: Date.now(),
        name: name.trim(),
        price: Math.round(price * 100) / 100 
    };
    
    products.push(newProduct);
    
    res.status(201).json({
        message: 'Товар успешно добавлен',
        product: newProduct
    });
});


app.get('/products', (req, res) => {
    res.json({
        count: products.length,
        products: products
    });
});


app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return res.status(404).json({ 
            error: `Товар с ID ${productId} не найден` 
        });
    }
    
    res.json(product);
});

// ======================
// UPDATE - Редактирование товара
// ======================
app.patch('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            error: `Товар с ID ${productId} не найден` 
        });
    }
    
    const { name, price } = req.body;
    const updatedFields = {};
    
    // Обновление названия
    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ 
                error: 'Название должно быть непустой строкой' 
            });
        }
        products[productIndex].name = name.trim();
        updatedFields.name = name.trim();
    }
    
    // Обновление цены
    if (price !== undefined) {
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ 
                error: 'Цена должна быть положительным числом' 
            });
        }
        products[productIndex].price = Math.round(price * 100) / 100;
        updatedFields.price = products[productIndex].price;
    }
    
    if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ 
            error: 'Нет данных для обновления' 
        });
    }
    
    res.json({
        message: 'Товар успешно обновлён',
        product: products[productIndex],
        updatedFields: updatedFields
    });
});

// ======================
// DELETE - Удаление товара
// ======================
app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            error: `Товар с ID ${productId} не найден` 
        });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
        message: 'Товар успешно удалён',
        product: deletedProduct
    });
});

// ======================
// Обработчик 404
// ======================
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Маршрут не найден' 
    });
});


app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
    console.log(`📊 Доступные эндпоинты:`);
    console.log(`   GET    http://localhost:${port}/`);
    console.log(`   GET    http://localhost:${port}/products`);
    console.log(`   GET    http://localhost:${port}/products/:id`);
    console.log(`   POST   http://localhost:${port}/products`);
    console.log(`   PATCH  http://localhost:${port}/products/:id`);
    console.log(`   DELETE http://localhost:${port}/products/:id`);
});