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

let auth = require('./auth')(app); // the app argument here ensures that Express is available in your "auth.js" file as well.

//need to require passport module and import passport.js file
const passport = require('passport');
require('./passport');


mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


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
  Users.findOne({Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) => {res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
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

app.put('/users/:Username', passport.authenticate('jwt', { session: false}), (req,res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
