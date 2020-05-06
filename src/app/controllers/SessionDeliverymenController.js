import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import Deliverymen from '../models/Deliverymen';
import authConfig from '../../config/auth';

class SessionDeliverymenController {
  async store(req, res) {
    const { id } = req.body;
    const deliveryman = await Deliverymen.findOne({ where: { id } });

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found' });
    }

    return res.json({
      user: deliveryman,
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}
export default new SessionDeliverymenController();
