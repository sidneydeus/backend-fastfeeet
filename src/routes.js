import { Router } from 'express';
import Multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymenController from './app/controllers/DeliverymenController';
import AvatarController from './app/controllers/AvatarController';
import SignatureController from './app/controllers/SignatureController';
import DeliveryController from './app/controllers/DeliveryController';
import StatusDeliveryController from './app/controllers/StatusDeliveryController';
import DeliveriesController from './app/controllers/DeliveriesController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';
import SessionController from './app/controllers/SessionController';
import SessionDeliverymenController from './app/controllers/SessionDeliverymenController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = new Multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.post('/sessionsDeliverymen', SessionDeliverymenController.store);

routes.get('/deliveryman/:id/deliveries', DeliveriesController.index);
routes.get('/delivery/problems', DeliveryProblemsController.index);

/* check token */
routes.use(authMiddleware);
routes.post('/recipients', RecipientController.store);
routes.get('/recipient/:id', RecipientController.index);
routes.get('/recipients', RecipientController.index);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.get('/deliverymen', DeliverymenController.index);
routes.post('/deliveryman', DeliverymenController.store);
routes.put('/deliveryman/:id', DeliverymenController.update);
routes.delete('/deliveryman/:id', DeliverymenController.delete);
routes.get('/deliveryman/:id', DeliverymenController.index);

routes.post('/avatars', upload.single('file'), AvatarController.store);
routes.post('/signatures', upload.single('file'), SignatureController.store);

routes.get('/delivery/:id', DeliveryController.index);
routes.get('/deliveries', DeliveryController.index);
routes.post('/delivery', DeliveryController.store);
routes.delete('/delivery/:id', DeliveryController.delete);
routes.put('/delivery/:id', DeliveryController.update);

routes.put('/status-delivery/:id', StatusDeliveryController.update);

routes.get('/delivery/:id/problems', DeliveryProblemsController.index);
routes.post('/delivery/problems', DeliveryProblemsController.store);
routes.put('/problem/:id/cancel-delivery', DeliveryProblemsController.update);
routes.delete('/delivery-problem/:id', DeliveryProblemsController.delete);

export default routes;
