const express = require('express'),
app = express(),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
mongoose = require('mongoose'),
Models = require('./models.js'),
Movies = Models.Movie,
Users = Models.User;

//body-parser middleware module allows you to read the “body” of HTTP requests within your request handlers simply by using the code req.body
app.use(bodyParser.json());

const cors n= require('cors');
// app.use(cors());

// To allow certain origins to be given access to make requests

let allowedOrigins = [ 'http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) { //If a specific origin isn't found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

const { check, validationResult } = require('express-validator');

let auth = require('./auth')(app); // the app argument here ensures that Express is available in your "auth.js" file as well.

//need to require passport module and import passport.js file
const passport = require('passport');
require('./passport');


// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });



//using morgan to log information about the requests using morgan's 'common' format
app.use(morgan('common'));

//serving static files
app.use(express.static('public'));

//GET requests

app.get('/', (req, res) => {
  res.send('Welcome to my myFlix app! You\'ll find my top 10 movies here :D');
});


//error handling function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Setting up our endpoints

//CREATE

//Add a user
/*We'll expect JSON in this format
{
ID: Integer,
Username: String,
Password: String,
Email: String,
Birthday: Date
}*/
app.post('/users', (req, res) => {
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req,res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashedPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
    .then((user) => {
      if (user) {
        // If the user is found, send a response that it already exists
        return res.status(400).send(req.body.Username + ' already exists');
      }else {
        Users
        .create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) => { res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });

  //READ

  // Get all users
  app.get('/users', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  // Get a user by username
  app.get('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOne({ Username: req.params.Username })
    .then((user) => {res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  // get JSON object when /movies (returns all movies)
  app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
    Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });

  //READ get movie info by title
  app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), (req,res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });

  //READ get information on genre by name
  app.get('/genre/:Name', passport.authenticate('jwt', { session: false}), (req,res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });


  //READ GET data about a director (bio, birth year, death year) by name
  app.get('/director/:Name', passport.authenticate('jwt', { session: false}), (req,res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });

  //UPDATE

  // Update a user's info, by username
  /*We'll expect  JSON in this format
  {
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}
*/

app.put('/users/:Username', passport.authenticate('jwt', { session: false}),[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req,res) => {
  let hashedPassword = Users.hashedPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, {$set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// Add a movie to a user's list of favourites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavouriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }else {
      res.status(201).send('Movie was added to Favourites.');    }
    });
  });

  //DELETE

  //Allow user to delete movie title from FavouriteMovies collection
  app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $pull: { FavouriteMovies: req.params.MovieID }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      }else {

        res.status(201).send('Movie has been removed from Favourites.');
      }
    });
  });


  //DELETE a user by username
  app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username }).then((user) => {
      if(!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else{
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });




  //listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
