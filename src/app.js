const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const ProductRouter = require('./routers/ProductRouter');
const CartRouter = require('./routers/CartRouter');
const ChatRouter = require('./routers/ChatRouter');
const SessionRouterLocal = require('./routers/SessionLocalRouter')
const SessionGithubRouter = require('./routers/SessionGithubRouter')
const LoginRouter = require('./routers/LoginRouter')
const userRouter = require('./routers/userRouter')
const ProductService = require('./repository/product.service');
const MessageDao = require('./dao/messageDao');
const CartService = require('./repository/cart.service');
const sessions = require('express-session')
const mongoStore = require('connect-mongo')
const passport = require('passport')
const ClientRouter = require('./routers/ClientRouter')
const initPassportGithub = require('./config/passport/config.passportGithub')
const inicializarPassport = require('./config/passport/config.passportLocal')
const config = require('./config/config');
const generateMockProducts = require('./mocks/product.mocks');
const { errorHandler } = require('./middleware/errorHandler');
const { middLogg, logger } = require('./utils/winston');

const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")



const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = config.port || 3000;


const options = {
    definition:{
        openapi:"3.0.0",
        info:{
            title: "Documentacion API",
            version: "1.0.0",
            description: "Documentacion sobre los productos y carrito del proyecto"
        }
    },
    apis: ["./docs/*.yaml"]
}

const specs = swaggerJsdoc(options)



app.use(sessions(
    {
        secret: config.sessionSecret,
        resave: true, saveUninitialized: true,
        store: mongoStore.create(
            {
                mongoUrl: config.mongoURI,
                mongoOptions: { dbName: "ecommerce" },
                ttl: 3600,
            }
        )
    }
))
inicializarPassport()
initPassportGithub()
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session && req.session.isAuthenticated || false;
    req.io = io;
    next();
});
app.use(errorHandler)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

app.get('/', (req, res) => {
    const isAuthenticated = req.session.usuario;

    if (!isAuthenticated) {
        return res.redirect('/login');
    }


    res.render('home');
});

const viewsPath = path.join(__dirname, 'views');
app.engine('handlebars', engine({ extname: '.handlebars' }));
app.set('view engine', 'handlebars');
app.set('views', viewsPath);

app.use(middLogg)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', LoginRouter(io))
app.use('/api/sessions', SessionRouterLocal(io))
app.use('/api/github', SessionGithubRouter(io))
app.use('/api/clientes', ClientRouter(io))


app.use('/api/products', ProductRouter(io));
app.use('/api/carts', CartRouter(io));
app.use('/api/users', userRouter(io));
app.use('/chat', ChatRouter(io, MessageDao));


app.get('/views/carts/:cid', async (req, res) => {
    const cid = req.params.cid;
    try {
        const cart = await CartService.getCartById(cid);
        if (cart) {
            res.render('cart', { cart });
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        logger.error(`Error al obtener el carrito con ID ${cid}:`, error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductService.getProducts({ limit: req.query.limit, page: req.query.page, sort: req.query.sort, query: req.query.query });
        res.render('realtimeproducts', { products });
    } catch (error) {
        req.logger.error('Error al obtener productos para la vista:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/views/products', async (req, res) => {
    try {
        let usuario = req.session.usuario
        const products = await ProductService.getProducts({ limit: 10, page: req.query.page, sort: req.query.sort, query: req.query.query });
        res.render('products', { products, usuario });
    } catch (error) {
        req.logger.error('Error al obtener productos para la vista:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/mokingproducts', (req, res) => {
    const mockProducts = generateMockProducts();
    res.render('mocks', { products: mockProducts });
});

app.get('/purchase', async (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    try {
        const cartId = req.session.usuario.cartID;

        const cart = await CartService.getCartById(cartId);


        res.status(200).render('purchase', { cart, cartId });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/loggerTest', (req, res) => {
    req.logger.debug('Debug test');
    req.logger.http('HTTP test');
    req.logger.info('Info test');
    req.logger.warning('Warning test');
    req.logger.error('Error test');
    req.logger.fatal('Fatal test');
    res.send('Logs created');
});


io.on('connection', async (socket) => {

    const products = await ProductService.getProducts({ limit: 50 });
    socket.emit('products', products);

    socket.on('addToCart', async ({ productId, productName, userRole }) => {
        try {


            const quantity = 1;

            await CartService.addProductToCart(userRole, productId, quantity);

            logger.info(`Producto "${productName}" agregado al carrito`);

        } catch (error) {
            logger.error('Error al agregar el producto al carrito:', error);
        }
    });
});

server.listen(port, () => {
    logger.info(`Servidor en linea, puerto ${port}`);
});


try {
    mongoose.connect(config.mongoURI, { dbName: "ecommerce" });
    logger.http("DB online...!!!");
} catch (error) {
    logger.fatal(error.message);
}