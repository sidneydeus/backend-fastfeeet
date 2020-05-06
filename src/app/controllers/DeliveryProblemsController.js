import * as Yup from 'yup';
import { zonedTimeToUtc } from 'date-fns-tz';
import DeliveryProblems from '../models/DeliveryProblems';
import Delivery from '../models/Delivery';
import Deliverymen from '../models/Deliverymen';

import CancelDeliveryMail from '../jobs/CancelDeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async index(req, res) {
    if (req.params.id) {
      const { id } = req.params;
      const deliveries = await DeliveryProblems.findAll({
        where: { delivery_id: id },
      });
      return res.json(deliveries);
    }

    const deliveries = await DeliveryProblems.findAll();
    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      delivery_id: Yup.number().required(),
      description: Yup.string()
        .min(5)
        .max(200)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery_problem = await DeliveryProblems.create(req.body);
    return res.json(delivery_problem);
  }

  async update(req, res) {
    const { id } = req.params;

    const existsDelivery = await DeliveryProblems.findByPk(id);

    if (existsDelivery) {
      const today_utc = zonedTimeToUtc(new Date(), 'America/Sao_Paulo');

      const delivery_canceled = await Delivery.update(
        { canceled_at: today_utc },
        { where: { id: existsDelivery.delivery_id } }
      );

      if (delivery_canceled) {
        const delivery = await Delivery.findByPk(existsDelivery.delivery_id, {
          include: [
            {
              model: Deliverymen,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
            },
          ],
        });

        await Queue.add(CancelDeliveryMail.key, { delivery });

        return res.json(delivery);
      }
    }

    return res.status(400).json({ error: ' Valid problem ID is required' });
  }

  async delete(req, res) {
    const { id } = req.params;

    const existsDelivery = await DeliveryProblems.findByPk(id);

    if (existsDelivery) {
      await DeliveryProblems.destroy({ where: { id } });

      const deliveries = await DeliveryProblems.findAll();
      return res.json(deliveries);
    }

    return res.json({ mensagem: 'Problem not found' });
  }
}
export default new DeliveryProblemsController();
