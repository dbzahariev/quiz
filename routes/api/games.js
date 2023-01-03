const express = require('express');
const router = express.Router();

const Games = require('../../models/Games');

const validateAddQuestion = require('../../utils/validation/addQuestion');

// Add new Games Point
// @route POST /api/game
// @desc add question
// @access Private
router.post('/game', (req, res) => {
  // const { errors, isValid } = validateAddQuestion(req.body);

  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

  const game = new Games({
    nameHuman: req.body.nameHuman,
    gameName: req.body.gameName,
    points: req.body.points,
  });

  game.save()
    .then(game => {
      console.log("Add Game Point", game)
      return res.json(game)
    })
    .catch(err => console.log(err));
});


// Gets all quiz questions
// @route GET /api/all
// @desc get questions
// @access Private
router.get('/all', (req, res) => {
  console.log("getAllGames", req.query.gameName)
  let nameHuman = req.query.nameHuman
  let gameName = req.query.gameName

  let filter = {}
  if (nameHuman) {
    filter.nameHuman = nameHuman
  }
  if (gameName) {
    filter.gameName = gameName
  }

  Games.find(filter)
    .then(games => res.json(games))
    .catch(err => console.log(err));
});


router.post("/update", (req, res) => {
  const data = req.body || {};
  const newPoint = req.body.newPoint

  if (!data.nameHuman) {
    return res.status(404).json({ msg: `Not found nameHuman (${data.nameHuman})` });
  }

  if (!data.gameName) {
    return res.status(404).json({ msg: `Not found gameName (${data.gameName})` });
  }

  Games.find({
    nameHuman: data.nameHuman,
    gameName: data.gameName
  }).then((oneGame) => {
    if (!oneGame[0]) {
      const game = new Games({
        nameHuman: req.body.nameHuman,
        gameName: req.body.gameName,
        points: [{ ...newPoint, id: 0, date: (new Date()).toISOString() }],
      });

      game.save()
        .then((el) => {
          return res.status(201).json({ msg: "New user saved!", data: el.points[0] })
        })
        .catch(err => console.log(err));

      return
    }

    oneGame = oneGame[0]
    let id = oneGame._id;

    if (!id) {
      res.status(404).json({ msg: `Not found id (${id})` });
      return;
    }

    let newId = ((oneGame.points.sort((a, b) => b.id - a.id)[0] || { id: -1 }).id) + 1
    oneGame.points.push({ ...newPoint, id: newId, date: (new Date()).toISOString() })

    let newPoints = oneGame.points

    Games.findOneAndUpdate(
      { _id: id },
      { points: newPoints },
      { useFindAndModify: false, returnDocument: "after" }
    ).then((el) => {
      let newPoint = newPoints.sort((a, b) => b.id - a.id)[0]
      return res.status(201).json({ msg: "New point is saved successfully!", data: newPoint });
    }).catch(() => {
      return res.status(500);
    });
  })
    .catch((el) => {
      console.log("err", el)
      res.status(500)
      return
    })
});

module.exports = router;