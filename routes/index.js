'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');

router.get('/', (req, res, next) => {
  Game.findAll({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: {
      privacy: 'public'
    },
    order: '"updatedAt" DESC'
  }).then((games) => {
    Stage.findAll({
    }).then((stages) => {
      const gameMap = new Map();
      games.forEach((g) => {
        const stageArray = new Array();
        stages.forEach((s) => {
          if (g.gameId === s.gameId) {
            stageArray.push([s.stageTitle, s.stageContent]);
          }
        });
        gameMap.set(g.gameId, stageArray)
        console.log(gameMap);
      });
      res.render('index', {
        user: req.user,
        games: games,
        gameMap: gameMap
      });
    });
  });
});

module.exports = router;