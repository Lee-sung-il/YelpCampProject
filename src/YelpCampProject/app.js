if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require("connect-mongo");





const dbUrl = process.env.DB_URL ||'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Database Connected');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

const secret = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto : {
    secret: secret,
  }
})

store.on('error', function (err) {
  console.log("SESSION STORE ERROR:", err);
})

const sessionConfig = {
  store: store,
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    // secure: process.env.NODE_ENV === 'production', // 🔥 환경에 따라 자동 적용
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};



const scriptSrcUrls = [
  "https://cdn.jsdelivr.net",             // Bootstrap JS
  "https://unpkg.com/",                   // Leaflet & MarkerCluster
  "https://cdnjs.cloudflare.com/",       // Fallback libs
  "https://kit.fontawesome.com/",        // FontAwesome
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net",             // Bootstrap CSS
  "https://unpkg.com/",                   // Leaflet CSS
  "https://fonts.googleapis.com/",        // Google Fonts
  "https://use.fontawesome.com/",         // FontAwesome
];
const connectSrcUrls = []; // Leaflet은 connect 요청 거의 없음
const fontSrcUrls = [
  "https://fonts.gstatic.com/",           // Google Fonts
];

app.use(session(sessionConfig));
app.use(flash());
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/dtxe4jqbf/",  // ✅ 너의 Cloudinary 계정 이름
          "https://images.unsplash.com/",           // ✅ Unsplash
          "https://unpkg.com/leaflet@1.9.4/dist/images/",
          "https://a.tile.openstreetmap.org/",
          "https://b.tile.openstreetmap.org/",
          "https://c.tile.openstreetmap.org/",
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
});

app.get('/', (req, res) => {
  res.render('home');
});
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';

  console.log(err.message);
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
