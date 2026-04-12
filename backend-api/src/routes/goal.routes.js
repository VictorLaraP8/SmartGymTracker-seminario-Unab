const express = require('express');
const router = express.Router();

const goalController = require('../controllers/goal.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, goalController.createGoal);
router.get('/me', verifyToken, goalController.getMyGoal);
router.put('/:id', verifyToken, goalController.updateGoal);

module.exports = router;