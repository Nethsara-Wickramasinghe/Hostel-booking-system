const router = require('express').Router();
const { body, param } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const c = require('../controllers/rooms');

const idRule = param('id').isMongoId().withMessage('Invalid room id');
const rules = (isUpdate) => {
  const f = (chain) => (isUpdate ? chain.optional() : chain.exists({ checkFalsy: true }).withMessage('Required').bail());
  return [
    f(body('roomNumber')).trim().isLength({ max: 10 }).withMessage('Room number must be 10 characters or fewer'),
    f(body('roomType')).isIn(['Single', 'Double', 'Triple']).withMessage('Room type must be Single, Double or Triple'),
    f(body('pricePerMonth')).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    f(body('capacity')).isInt({ min: 1, max: 10 }).withMessage('Capacity must be a whole number from 1 to 10'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be 500 characters or fewer'),
  ];
};

router.use(protect);
router.get('/', c.list);
router.get('/:id', idRule, validate, c.getOne);
router.post('/', adminOnly, upload.single('image'), rules(false), validate, c.create);
router.put('/:id', adminOnly, idRule, upload.single('image'), rules(true), validate, c.update);
router.delete('/:id', adminOnly, idRule, validate, c.remove);
module.exports = router;
