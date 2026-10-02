const router = require('express').Router();
const { body, param } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const c = require('../controllers/bookings');

const idRule = param('id').isMongoId().withMessage('Invalid booking id');
const todayUTC = () => new Date().setUTCHours(0, 0, 0, 0);
const dateRules = [
  body('startDate').isISO8601().withMessage('Start date must be YYYY-MM-DD').bail()
    .custom((v) => new Date(v) >= todayUTC()).withMessage('Start date cannot be in the past'),
  body('endDate').isISO8601().withMessage('End date must be YYYY-MM-DD').bail()
    .custom((v, { req }) => new Date(v) > new Date(req.body.startDate)).withMessage('End date must be after the start date'),
];

router.use(protect);
router.post('/', [body('roomId').isMongoId().withMessage('Invalid room id'), ...dateRules], validate, c.create);
router.get('/mine', c.mine);
router.get('/', adminOnly, c.all);
router.get('/:id', idRule, validate, c.getOne);
router.put('/:id', idRule, dateRules, validate, c.update);
router.patch('/:id/status', adminOnly, idRule, body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected'), validate, c.setStatus);
router.patch('/:id/cancel', idRule, validate, c.cancel);
router.delete('/:id', idRule, validate, c.remove);
module.exports = router;
