const express = require('express');
const cs = require('cookie-session');
const createError = require('http-errors');
const bodyParser = require('body-parser');

const path = require('path');
const routes = require('./routes');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

const app = express();
const port = 3000;

// setup cookie session
app.set('trust proxy', 1);
app.use(
  cs({
    name: 'session',
    keys: ['CookieNumeroUno', 'CookieNumeroDos'],
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

// setup ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// app also has locals (variabes)
app.locals.siteName = 'ROUX Meetups';

app.use(express.static(path.join(__dirname, './static')));

// defining a variable that is available to ALL templates
app.use(async (req, res, next) => {
  try {
    const names = await speakersService.getNames();
    res.locals.speakerNames = names;
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use(
  '/',
  routes({
    feedbackService,
    speakersService,
  })
);

app.use((req, res, next) => {
  next(createError(404, 'The page you requested was not found.'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  const status = err.status || 500;
  res.locals.status = status;
  res.status(status);
  res.render('error');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}!`);
});
