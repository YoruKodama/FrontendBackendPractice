const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// ======================
// Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (для первого задания)
app.use(express.static(path.join(__dirname, 'public')));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ======================
// База данных (в памяти)
// ======================
let products = [
    { id: 1, name: 'Смартфон XYZ Pro', price: 29990 },
    { id: 2, name: 'Ноутбук UltraBook', price: 59990 },
    { id: 3, name: 'Наушники Wireless Pro', price: 4990 }
];

// ======================
// Главная страница
// ======================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>API Товаров</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 20px;
                    background: #f5f7fa;
                }
                h1 { color: #3498db; }
                .endpoint {
                    background: white;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .method {
                    font-weight: bold;
                    padding: 4px 8px;
                    border-radius: 4px;
                    color: white;
                }
                .method.get { background: #3498db; }
                .method.post { background: #2ecc71; }
                .method.patch { background: #f39c12; }
                .method.delete { background: #e74c3c; }
            </style>
        </head>
        <body>
            <h1>📦 API для управления товарами</h1>
            <p>Добро пожаловать! Ниже представлены доступные эндпоинты:</p>
            
            <div class="endpoint">
                <span class="method get">GET</span> /products - Просмотр всех товаров
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /products/:id - Просмотр товара по ID
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /products - Добавление товара
            </div>
            <div class="endpoint">
                <span class="method patch">PATCH</span> /products/:id - Редактирование товара
            </div>
            <div class="endpoint">
                <span class="method delete">DELETE</span> /products/:id - Удаление товара
            </div>
            
            <h2>📝 Примеры запросов:</h2>
            <pre>
# Получить все товары
curl http://localhost:3000/products

# Добавить товар
curl -X POST http://localhost:3000/products \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Монитор 24\"", "price": 12990}'

# Обновить товар
curl -X PATCH http://localhost:3000/products/1 \\
  -H "Content-Type: application/json" \\
  -d '{"price": 27990}'
            </pre>
        </body>
        </html>
    `);
});

// ======================
// CREATE - Добавление товара
// ======================
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    // Валидация данных
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ 
            success: false,
            error: 'Название товара обязательно и должно быть строкой' 
        });
    }
    
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Цена товара обязательна и должна быть положительным числом' 
        });
    }
    
    // Создание нового товара
    const newProduct = {
        id: Date.now(),
        name: name.trim(),
        price: Math.round(price * 100) / 100 // Округление до 2 знаков
    };
    
    products.push(newProduct);
    
    res.status(201).json({
        success: true,
        message: 'Товар успешно добавлен',
        product: newProduct
    });
});

// ======================
// READ - Просмотр всех товаров
// ======================
app.get('/products', (req, res) => {
    res.json({
        success: true,
        count: products.length,
        products: products
    });
});

// ======================
// READ - Просмотр товара по ID
// ======================
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
        return res.status(400).json({ 
            success: false,
            error: 'ID должен быть числом' 
        });
    }
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return res.status(404).json({ 
            success: false,
            error: `Товар с ID ${productId} не найден` 
        });
    }
    
    res.json({
        success: true,
        product: product
    });
});

// ======================
// UPDATE - Редактирование товара
// ======================
app.patch('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
        return res.status(400).json({ 
            success: false,
            error: 'ID должен быть числом' 
        });
    }
    
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            success: false,
            error: `Товар с ID ${productId} не найден` 
        });
    }
    
    const { name, price } = req.body;
    const updatedFields = {};
    
    // Обновление названия
    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ 
                success: false,
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
                success: false,
                error: 'Цена должна быть положительным числом' 
            });
        }
        products[productIndex].price = Math.round(price * 100) / 100;
        updatedFields.price = products[productIndex].price;
    }
    
    if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Нет данных для обновления' 
        });
    }
    
    res.json({
        success: true,
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
    
    if (isNaN(productId)) {
        return res.status(400).json({ 
            success: false,
            error: 'ID должен быть числом' 
        });
    }
    
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            success: false,
            error: `Товар с ID ${productId} не найден` 
        });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
        success: true,
        message: 'Товар успешно удалён',
        product: deletedProduct
    });
});

// ======================
// Обработчик 404
// ======================
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Маршрут не найден' 
    });
});

// ======================
// Запуск сервера
// ======================
app.listen(port, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log(`║  🚀 Сервер запущен на http://localhost:${port}            ║`);
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n📊 Доступные эндпоинты:');
    console.log('   GET    /products          - Все товары');
    console.log('   GET    /products/:id      - Товар по ID');
    console.log('   POST   /products          - Добавить товар');
    console.log('   PATCH  /products/:id      - Обновить товар');
    console.log('   DELETE /products/:id      - Удалить товар');
    console.log('\n💡 Тестовые товары в базе:');
    products.forEach(p => console.log(`   • [${p.id}] ${p.name} - ${p.price} ₽`));
});