const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();
app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Kim",
    favouriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    favouriteMovies: ["The Fountain"]
  },
]

let topMovies = [
  {
    "Title": "Captain America: The First Avenger",
    "Description": "It is 1941 and the world is in the throes of war. Steve Rogers (Chris Evans) wants to do his part and join America's armed forces, but the military rejects him because of his small stature. Finally, Steve gets his chance when he is accepted into an experimental program that turns him into a supersoldier called Captain America. Joining forces with Bucky Barnes (Sebastian Stan) and Peggy Carter (Hayley Atwell), Captain America leads the fight against the Nazi-backed HYDRA organization.(Summary courtesy of Rotten Tomatoes)",
    "Genre":{
      "Name":"Action",
      "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats(Definition courtesy of Wikipedia)"
    },
    "Director":{
      "Name":"Joe Johnston",
      "Bio":"Started his career on the visual effects team working with George Lucas on Star Wars, who encouraged him to try his hand at directing. He enrolled in a film-making program while continuing to work with Lucas and Spielberg. ",
      "Birth":1950,
      "Death":"N/A"
    },
    "ImageURL":"https://www.rottentomatoes.com/m/captain_america_the_first_avenger",
    "Featured": false
  },
  {
    "Title": "Captain Marvel",
    "Description": "Captain Marvel is an extraterrestrial Kree warrior who finds herself caught in the middle of an intergalactic battle between her people and the Skrulls. Living on Earth in 1995, she keeps having recurring memories of another life as U.S. Air Force pilot Carol Danvers. With help from Nick Fury, Captain Marvel tries to uncover the secrets of her past while harnessing her special superpowers to end the war with the evil Skrulls.(Summary courtesy of Rotten Tomatoes)",
    "Genre":{
      "Name":"Action",
      "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats(Definition courtesy of Wikipedia)"
    },
    "Director":{
      "Name":"Anna Boden",
      "Bio":"Attended Columbia University to study film. One of her highest movies is Sugar (2008)",
      "Birth":1979,
      "Death":"N/A"
    },
    "ImageURL":"https://www.rottentomatoes.com/m/captain_marvel",
    "Featured": false
  },
  {
    "Title": "Iron Man",
    "Description": "A billionaire industrialist and genius inventor, Tony Stark (Robert Downey Jr.), is conducting weapons tests overseas, but terrorists kidnap him to force him to build a devastating weapon. Instead, he builds an armored suit and upends his captors. Returning to America, Stark refines the suit and uses it to combat crime and terrorism.(Summary courtesy of Rotten Tomatoes)",
    "Genre":{
      "Name":"Action",
      "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats(Definition courtesy of Wikipedia)"
    },
    "Director":{
      "Name":"Jon Favreau",
      "Bio":"Actor, producer, writer, and director, Jon Favreau shot to fame upon the surprise success of \"Swinger's\" (1996) in which he co-starred along with his best friend Vince Vaughn. He was more eager to direct though, and has since directed many hit movies, including the Iron Man movies.",
      "Birth":1966,
      "Death":"N/A"
    },
    "ImageURL":"https://www.rottentomatoes.com/m/iron_man",
    "Featured": false
  },
  {
    "Title": "Iron Man 2",
    "Description": "With the world now aware that he is Iron Man, billionaire inventor Tony Stark (Robert Downey Jr.) faces pressure from all sides to share his technology with the military. He is reluctant to divulge the secrets of his armored suit, fearing the information will fall into the wrong hands. With Pepper Potts (Gwyneth Paltrow) and \"Rhodey\" Rhodes (Don Cheadle) by his side, Tony must forge new alliances and confront a powerful new enemy.(Summary courtesy of Rotten Tomatoes)",
    "Genre":{
      "Name":"Action",
      "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats(Definition courtesy of Wikipedia)"
    },
    "Director":{
      "Name":"Jon Favreau",
      "Bio":"Actor, producer, writer, and director, Jon Favreau shot to fame upon the surprise success of \"Swinger's\" (1996) in which he co-starred along with his best friend Vince Vaughn. He was more eager to direct though, and has since directed many hit movies, including the Iron Man movies.",
      "Birth":1966,
      "Death":"N/A"
    },
    "ImageURL":"https://www.rottentomatoes.com/m/iron_man_2",
    "Featured": false
  }



  // {
  //   title: 'Iron Man 2',
  //   starring: 'Robert Downey Jr., Gwyneth Paltrow, Don Cheadle',
  //   director: 'Jon Favreau'
  // },
  // {
  //   title: 'The Incredible Hulk',
  //   starring: 'Edward Norton, Liv Tyler, Tim Roth',
  //   director: 'Louis Leterrier'
  // },
  // {
  //   title: 'Thor',
  //   starring: 'Chris Hemsworth, Natalie Portman, Tom Hiddleston',
  //   director: 'Kenneth Branagh'
  // },
  // {
  //   title: 'Marvel\'s The Avengers',
  //   starring: 'Robert Downey Jr., Chris Evans, Mark Ruffalo',
  //   director: 'Joss Whedon'
  // },
  // {
  //   title: 'Thor: The Dark World',
  //   starring: 'Chris Hemsworth, Natalie Portman, Tom Hiddleston',
  //   director: 'Alan Taylor'
  // },
  // {
  //   title: 'Iron Man 3',
  //   starring: 'Robert Downey Jr., Gwyneth Paltrow, Don Cheadle',
  //   director: 'Shane Black'
  // },
  // {
  //   title: 'Captain America: The Winter Soldier',
  //   starring: 'Chris Evans, Scarlett Johansson, Samuel L. Jackson',
  //   director: 'Russo Brothers'
  // }
];

//using morgan to log information about the requests using morgan's 'common' format
app.use(morgan('common'));

//serving static files
app.use(express.static('public'));

//GET requests

app.get('/', (req, res) => {
  res.send('Welcome to my myFlix app! You\'ll find my top 10 movies here :D');
});

app.get('/topMovies', (req, res) => {
  res.json(topMovies);
});

//error handling function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Setting up our endpoints
//CREATE
app.post('/users', (req,res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  }else{
    res.status(400).send('Users need names.');
  }
});


//CREATE
app.post('/users/:id/:movieTitle', (req,res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if(user) {
    user.favouriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  }else{
    res.status(400).send('Movie could not be added to favourites.');
  }
});

//READ
app.get('/topMovies', (req,res) => {
  res.status(200).json(topMovies);
});

//READ
app.get('/topMovies/:title', (req,res) => {
  const { title } = req.params;
  const movie = topMovies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  }else{
    res.status(400).send('no such movie exists')
  }
});

//READ
app.get('/topMovies/genre/:genreName', (req,res) => {
  const { genreName } = req.params;
  const genre = topMovies.find( movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  }else{
    res.status(400).send('no such genre')
  }
});

//READ
app.get('/topMovies/directors/:directorName', (req,res) => {
  const { directorName } = req.params;
  const director = topMovies.find( movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  }else{
    res.status(400).send('no such director')
  }
});

//UPDATE
app.put('/users/:id', (req,res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if(user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  }else{
    res.status(400).send('No such user');
  }
});

//DELETE
app.delete('/users/:id/:movieTitle', (req,res) => {
  const { id,movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if(user) {
    user.favouriteMovies = user.favouriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been deleted from user ${id}'s array`);
  }else{
    res.status(400).send('Movie could not be deleted.');
  }
});

//DELETE
app.delete('/users/:id', (req,res) => {
  const { id} = req.params;

  let user = users.find( user => user.id == id );

  if(user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`User ${id} has been deleted.`);
  }else{
    res.status(400).send('Movie could not be deleted.');
  }
});




//listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
