import { Router } from 'express';
import { body } from 'express-validator';
import { ClientController } from '../controllers/clientController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

const validateClient = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

router.post('/', validateClient, ClientController.create);
router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getById);
router.put('/:id', validateClient, ClientController.update);
router.delete('/:id', ClientController.delete);

export default router;

