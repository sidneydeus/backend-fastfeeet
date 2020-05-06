import * as Yup from 'yup';
import { Op } from 'sequelize';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

import Recipient from '../models/Recipient';
import Deliverymen from '../models/Deliverymen';
import Avatar from '../models/Avatar';
import Signature from '../models/Signature';

import Delivery from '../models/Delivery';

import NewDeliveryMail from '../jobs/NewDeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { q } = req.query;
    const { id } = req.params;

    if (req.params.id) {
      const delivery_by_param = await Delivery.findOne({
        where: { id, canceled_at: null },
        attributes: ['id', 'recipient_id', 'deliveryman_id', 'product'],
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

      return res.json(delivery_by_param);
    }

    if (req.query.q) {
      const deliveries_filtered = await Delivery.findAll({
        where: {
          product: {
            [Op.iLike]: `%${q}%`,
          },
          canceled_at: null,
        },
        attributes: [
          'id',
          'recipient_id',
          'deliveryman_id',
          'signature_id',
          'product',
          'canceled_at',
          'start_date',
          'end_date',
        ],
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
          {
            model: Deliverymen,
            as: 'deliveryman',
            attributes: ['id', 'name', 'email', 'avatar_id'],
            include: [
              {
                model: Avatar,
                as: 'avatar',
                attributes: ['id', 'name', 'path', 'url'],
              },
            ],
          },
        ],
      });

      if (deliveries_filtered.length > 0) {
        return res.json(deliveries_filtered);
      }
    }

    const deliveries = await Delivery.findAll({
      where: {
        canceled_at: null,
      },
      order: [['id', 'ASC']],
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: Signature,
          as: 'signature',
          attributes: ['id', 'name', 'path', 'url'],
        },
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
        {
          model: Deliverymen,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email', 'avatar_id'],
          include: [
            {
              model: Avatar,
              as: 'avatar',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery_create = await Delivery.create(req.body);

    if (delivery_create) {
      const delivery = await Delivery.findByPk(delivery_create.id, {
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
          {
            model: Deliverymen,
            as: 'deliveryman',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      await Queue.add(NewDeliveryMail.key, { delivery });

      return res.json(delivery);
    }

    return res.status(400).json({ error: 'Delivery cannot be created' });
  }

  async update(req, res) {
    const deliveryExists = await Delivery.findByPk(req.params.id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const delivery = await Delivery.update(req.body, {
      where: { id: req.params.id },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery update has failed' });
    }

    const deliveryAll = await Delivery.findAll({
      attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
    });

    return res.json(deliveryAll);
  }

  async delete(req, res) {
    const deliveryExists = await Delivery.findOne({
      where: { id: req.params.id },
    });

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const today = format(new Date(), 'yyyy-MM-dd HH:m:ss', {
      timeZone: 'America/Sao_Paulo',
    });

    const today_utc = zonedTimeToUtc(today, 'America/Sao_Paulo');

    const deliveryDelete = await Delivery.update(
      { canceled_at: today_utc },
      {
        where: { id: req.params.id },
      }
    );

    if (!deliveryDelete) {
      return res.status(400).json({ error: 'Delete order has failed' });
    }

    const deliveries = await Delivery.findAll({
      where: {
        canceled_at: null,
      },
      order: [['id', 'DESC']],
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
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
        {
          model: Deliverymen,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email', 'avatar_id'],
          include: [
            {
              model: Avatar,
              as: 'avatar',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(deliveries);
  }
}

export default new DeliveryController();
