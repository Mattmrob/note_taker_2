const express = require('express');
const noteData = require('./db/db.json');
const path = require('path');
const uuid = require('./helpers/uuid')
const { readAndAppend, writeToFile, readFromFile } = require('./helpers/fsUtils');
// importing path for routing, uuid helpers for id creation, fsUtils for reading and writing to file

// looks for hiroku port?
const PORT = process.env.PORT || 3001;

const app = express();

// express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set route default to public
app.use(express.static('public'));

// ROUTES ----- VIEW
// Index route
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);
// note route
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/pages/notes.html'))
);

// ROUTES ----- API
// Retreive database info on GET
app.get('/api/notes', (req, res) => {
  try {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
  } catch (error) {
    res.status(500).json(error);
  }
});

// On POST to database... destructure note info from html, making sure not null or 0, then create uuid ->
// <- read and append new note information to database then create a response
app.post('/api/notes', async (req, res) => {
  try {
    console.log('Submission Received...');
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
        title,
        text,
        id: uuid(),
      };

      await readAndAppend(newNote, './db/db.json');

      const response = {
        status: 'success',
        body: newNote,
      };
  
      console.log(response);
      await res.status(201).json(response);
    }
    
    } catch (error) {
      res.status(500).json(error);
    }
  });

  // on DELETE to database... compare item set to delete to items in database
  // If an id does not match, add to a new array : if it does match, do not add to array
  // New array overwrites database, does not have the item that was selected for deletion
  app.delete(`/api/notes/:id`, async (req, res) => {
    if (req.params.id) {
        const selectedId = req.params.id;
        const newDb = [];
        
         for (let i = 0; i < noteData.length; i++) {
            
              if (selectedId !== noteData[i].id) {
              // pushing everything but item selected for deletion to new db array
              newDb.push(noteData[i]);
              } else {
                console.log(`${noteData[i]} has been selected for deletion `)
              }
         }
        //  writing updated Db to database file + response
        await writeToFile('./db/db.json', newDb)
        await res.status(200).json(noteData)
    } else {
        res.status(500).json('Delete request failed? Oh no!')
      }
  });

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${port}`)
);