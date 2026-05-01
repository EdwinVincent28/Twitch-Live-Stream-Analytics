const express = require('express');
const router = express.Router();
const { validateSearchQuery } = require('../middleware/validate');
const { searchChat } = require('../controllers/searchController');

router.post('/', validateSearchQuery, searchChat);

module.exports = router;