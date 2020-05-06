import { Op } from 'sequelize';
import Deliverymen from '../models/Deliverymen';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

class DeliveriesController {
  async index(req, res) {
    const { id } = req.params;
    const filter = req.query.filter || null;

    const deliveryman = await Deliverymen.findByPk(id);

    if (!deliveryman) {
      res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    if (filter === 'canceled') {
      const deliveries_canceled = await Delivery.findAll({
        where: {
          deliveryman_id: id,
          canceled_at: {
            [Op.not]: null,
          },
        },
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'id',
              'name',
              'street',
              'housenumber',
              'complement',
              'city',
              'state',
              'zipcode',
            ],
          },
        ],
      });
      return res.json(deliveries_canceled);
    }

    if (filter === 'delivered') {
      const deliveries_delivered = await Delivery.findAll({
        where: {
          deliveryman_id: id,
          end_date: {
            [Op.not]: null,
          },
        },
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'id',
              'name',
              'street',
              'housenumber',
              'complement',
              'city',
              'state',
              'zipcode',
            ],
          },
        ],
      });
      return res.json(deliveries_delivered);
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: {
          [Op.is]: null,
        },
        // end_date: {
        //   [Op.is]: null,
        // },
      },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'housenumber',
            'complement',
            'city',
            'state',
            'zipcode',
          ],
        },
      ],
    });
    return res.json(deliveries);
  }
}

export default new DeliveriesController();
