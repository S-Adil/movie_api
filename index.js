const express = require('express'),
  morgan = require('morgan');

const app = express();

let topMovies = [
  {
    title: 'Captain America: The First Avenger',
    starring: 'Chris Evans, Hayley Atwell, Sebastian Stan',
    director: 'Joe Johnston'
  },
  {
    title: 'Captain Marvel',
    starring: 'Brie Larson, Samuel L. Jackson, Ben Mendelsohn',
    director: 'Anna Boden'
  },
  {
    title: 'Iron Man',
    starring: 'Robert Downey Jr., Terrence Howard, Gwyneth Paltrow',
    director: 'Jon Favreau'
  },
  {
    title: 'Iron Man 2',
    starring: 'Robert Downey Jr., Gwyneth Paltrow, Don Cheadle',
    director: 'Jon Favreau'
  },
  {
    title: 'The Incredible Hulk',
    starring: 'Edward Norton, Liv Tyler, Tim Roth',
    director: 'Louis Leterrier'
  },
  {
    title: 'Thor',
    starring: 'Chris Hemsworth, Natalie Portman, Tom Hiddleston',
    director: 'Kenneth Branagh'
  },
  {
    title: 'Marvel\'s The Avengers',
    starring: 'Robert Downey Jr., Chris Evans, Mark Ruffalo',
    director: 'Joss Whedon'
  },
  {
    title: 'Thor: The Dark World',
    starring: 'Chris Hemsworth, Natalie Portman, Tom Hiddleston',
    director: 'Alan Taylor'
  },
  {
    title: 'Iron Man 3',
    starring: 'Robert Downey Jr., Gwyneth Paltrow, Don Cheadle',
    director: 'Shane Black'
  },
  {
    title: 'Captain America: The Winter Soldier',
    starring: 'Chris Evans, Scarlett Johansson, Samuel L. Jackson',
    director: 'Russo Brothers'
  }
];

//using morgan to log information about the requests using morgan's 'common' format
app.use(morgan('common'));

//serving static files
app.use(express.static('public'));

//GET requests

app.get('/', (req, res) => {
  res.send('Welcome to my myFlix app! You\'ll find my top 10 movies here :D');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//error handling function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
