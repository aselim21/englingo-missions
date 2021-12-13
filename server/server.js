const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
const logger = require('./logger');
app.use(express.static("src"));
const MongodbURI = "mongodb+srv://englingo-admin:admin123@cluster0.enlfp.mongodb.net/englingo-missions?retryWrites=true&w=majority";
const Log = require('./models/log-model.js');
const Mission = require('./models/mission-model.js');
const datamuse = require('datamuse');
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    const corsWhitelist = [
        'https://webrtc-englingo.herokuapp.com',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'https://englingo.herokuapp.com'
    ];
    if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Cookie, Set-Cookie, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
    next();
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~Missions~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/', (req, res) => {
    res.send('Welcome to Englingo Missions Service');
});

app.get('/missions', (req, res) => {
    Mission.find()
        .then((result) => {
            res.send(result);
        }).catch(err => {
            res.status(400).json("Error: " + err);
            logger.error(err);
        });
});

app.get('/missions/:id', (req, res) => {
    const the_mission_id = req.params.id;
    Mission.findById(the_mission_id).then((the_mission) => {
        res.send(the_mission);
    }).catch(err => {
        res.status(400).json("Error: " + err);
        logger.error(err);
    });
});
app.get('/missions/match/:id', (req, res) => {
    const the_match_id = req.params.id;
    Mission.find({ match_id: the_match_id }).then((the_mission) => {
        res.send(the_mission);
    }).catch(err => {
        res.status(400).json("Error: " + err);
        logger.error(err);
    });
});

app.post('/missions', (req, res) => {

    const the_topic = req.body.topic;
    const the_user1 = req.body.user1_id;
    const the_user2 = req.body.user2_id;
    const the_matchId = req.body.match_id;
    //generate a topic(word) from second level associated words
    //level1

    datamuse.request('/words?rel_trg=' + the_topic).then((datajson) => {
        let words_level1 = JSON.parse(JSON.stringify(datajson));

        //choose one word randomly from the associated words with the topic
        let random = Math.floor(Math.random() * words_level1.length);
        let topic2 = words_level1[random];

        //search for associated words with the topic2 (from second level)
        //topic2 becomes our main topic for the mission
        datamuse.request('/words?rel_trg=' + topic2.word).then((datajson_level2) => {
            let words_level2 = JSON.parse(JSON.stringify(datajson_level2));

            //get 5 words randomly from the associated words with topic2
            let mission_words_level2 = [];
            for (let i = 0; i < 5; i++) {
                let random = Math.floor(Math.random() * words_level2.length);
                mission_words_level2.push(words_level2[random].word);
            }

            //create a new mission
            new Mission({
                'topic_level2': topic2.word,
                'words': mission_words_level2,
                'user1_id': the_user1,
                'user2_id': the_user2,
                'match_id': the_matchId
            }).save().then((result) => {
                logger.info(`POST-participant => ${result}`);

                //return the ID of the new Mission
                res.location(`/missions/${result._id}`);
                res.send(result._id);
            }).catch(err => {
                res.status(400).json("Error: " + err);
                logger.error("Error saving the new Purchase", err);
            });
        })
    });
});

//----------------------LOGS-------------------
//get all logs of the service
app.get('/logs', (req, res) => {
    Log.find()
        .then((result) => {
            res.send(result);
        }).catch(err => {
            res.status(400).json("Error: " + err);
            logger.error(err);
        })
});

//connect with DB and start the server
mongoose.connect(MongodbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(PORT, () => {
        logger.info(`Listening on port ${PORT}...`);
    }))
    .catch(err => {
        logger.error(err);
        res.status(400).json("Error: " + err)
    });