require('dotenv').config()

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const multer = require('multer');
const { cloudinary, storage } = require('./cloudinary');
const upload = multer({ storage });
const mongoose = require('mongoose');
// const ObjectID = require('mongoose').Types.ObjectId;
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const Product = require('./models/product');
const User = require('./models/user');

const { isLoggedIn, validateProduct } = require('./middleware');

const productRoutes = require('./routes/products')

const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET
    }
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e)
});

const sessionConfig = {
    store: store,
    name: 'session_',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://cdn.jsdelivr.net/",
];
const fontSrcUrls = [
    "https://cdn.jsdelivr.net/",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxecbqbhk/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//root route
app.get('/', (req, res) => {
    res.render('dashboard');
})

//routes
app.use('/products', productRoutes);

//show register form
app.get('/register', (req, res) => {
    res.render('users/register');
})

//handle register
app.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome ${user.username}`);
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}))

//show login form
app.get('/login', (req, res) => {
    res.render('users/login');
})

//handle login
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back');
    res.redirect('/');
})

//logout route
app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    });
})

//admin route
app.get('/admins', async (req, res) => {
    const users = await User.find({})
    res.render('admins', { users });
})

//handle isAdmin
app.put('/admins', async (req, res) => {
    const user = await User.findByIdAndUpdate({ _id: req.user._id }, { runValidators: true, new: true })
    if (user) {
        const { adminCode } = req.body;
        if (user.isAdmin) {
            req.flash('success', 'You are already an admin!')
        } else {
            if (adminCode === 'secret') {
                await user.toggleIsAdmin();
                await user.save();
                req.flash('success', 'Successfully changed role!');
            } else {
                req.flash('error', 'Please try again!')
            }
        }
    }
    res.redirect('/admins');
})

//change isAdmin back to false
app.delete('/admins', async (req, res) => {
    const user = await User.findByIdAndUpdate({ _id: req.user._id }, { runValidators: true, new: true })
    if (user) {
        await user.toggleIsAdmin();
        await user.save();
        req.flash('success', 'Successfully removed role!');
    } else {
        req.flash('error', 'Cant delete admin!')
    }
    res.redirect('/admins');
})

//error class
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

//basic error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no something went wrong!';
    res.status(statusCode).render('error', { err, title: 'Page Not Found' });
});

//server
app.listen(3000, () => {
    console.log('Serving on port 3000');
});