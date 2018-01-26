'use strict';
const express = require('express');
const router = express.Router();
const util = require('./util.js');
const loader = require('../models/sequelize-loader');
const sequelize = loader.database;
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Like = require('../models/like');
const Comment = require('../models/comment');

// 公開ゲーム一覧
router.get('/', (req, res, next) => {
  if (process.env.DATABASE_URL && req.headers['x-forwarded-proto'] === 'http') {
    res.redirect('https://www.shakyo-typing.com');
  }
  const favoriteMap = new Map();
  const likeMap = new Map();
  const likeCountMap = new Map();
  let storedGames = null;
  if (req.user) {
    Game.findAll({
      include: [{
        model: Comment,
        attributes: ['commentId']
      }],
      where: { privacy: 1 }, // 公開ゲーム
      order: '"updatedAt" DESC'
    }).then((games) => {
      storedGames = games;
      return Favorite.findAll({
        where: { userId: req.user.id }
      });
    }).then((favorites) => {
      util.createFavoriteMap(favorites, favoriteMap)
      return Like.findAll({
        where: { userId: req.user.id }
      });
    }).then((likes) => {
      util.createLikeMap(likes, likeMap);
      return Like.findAll({
        attributes: ['gameId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
        group: ['gameId'],
        where: { likeState: 1 }
      });
    }).then((likeCount) => {
      util.createLikeCountMap(likeCount, likeCountMap);
      res.render('index', {
        user: req.user,
        games: storedGames,
        favoriteMap: favoriteMap,
        likeMap: likeMap,
        likeCountMap: likeCountMap
      });
    });
  } else {
    Game.findAll({
      include: [{
        model: Comment,
        attributes: ['commentId']
      }],
      where: { privacy: 1 }, // 公開ゲーム
      order: '"updatedAt" DESC'
    }).then((games) => {
      storedGames = games
      return Like.findAll({
        attributes: ['gameId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
        group: ['gameId'],
        where: { likeState: 1 }
      });
    }).then((likeCount) => {
      util.createLikeCountMap(likeCount, likeCountMap);
      res.render('index', {
        user: req.user,
        games: storedGames,
        likeCountMap: likeCountMap
      });
    });
  }
});

module.exports = router;