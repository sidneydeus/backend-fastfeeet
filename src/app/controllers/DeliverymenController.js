import * as Yup from 'yup';
import { Op } from 'sequelize';
import Deliverymen from '../models/Deliverymen';
import Avatar from '../models/Avatar';

class DeliverymenController {
  async index(req, res) {
    const { q } = req.query;
    const { id } = req.params;

    // If exist query string q
    const deliveryman_filtered = await Deliverymen.findAll({
      where: {
        name: {
          [Op.iLike]: `%${q}%`,
        },
      },
      include: [
        {
          model: Avatar,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
      order: [
        ['id', 'DESC'],
        ['name', 'ASC'],
      ],
    });

    if (deliveryman_filtered.length > 0) {
      return res.json(deliveryman_filtered);
    }

    // If exist param ID
    if (id) {
      const deliveryman = await Deliverymen.findOne({
        where: { id },
        include: [
          {
            model: Avatar,
            as: 'avatar',
            attributes: ['id', 'name', 'path', 'url'],
          },
        ],
        order: [
          ['id', 'DESC'],
          ['name', 'ASC'],
        ],
      });

      return res.json(deliveryman);
    }

    const deliverymen = await Deliverymen.findAll({
      include: [
        {
          model: Avatar,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
      order: [
        ['id', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const [deliveryman, created] = await Deliverymen.findOrCreate({
      where: { email: req.body.email },
      defaults: req.body,
    });

    if (created === false) {
      return res.status(400).json({ error: 'Delivery man already exists' });
    }

    return res.json(deliveryman);
  }

  async update(req, res) {
    const deliverymenExists = await Deliverymen.findByPk(req.params.id);

    if (!deliverymenExists) {
      return res.status(400).json({ error: 'Delivery man does not exists' });
    }

    const deliverymen = await Deliverymen.update(req.body, {
      where: { id: req.params.id },
    });

    if (!deliverymen) {
      return res.status(400).json({ error: 'Delivery man update has failed' });
    }

    const deliveryman = await Deliverymen.findAll({
      attributes: ['id', 'name', 'avatar_id', 'email'],
    });

    return res.json(deliveryman);
  }

  async delete(req, res) {
    const deliverymanExists = await Deliverymen.findOne({
      where: { id: req.params.id },
    });

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const deliverymanDelete = await Deliverymen.destroy({
      where: { id: req.params.id },
    });

    if (!deliverymanDelete) {
      return res.status(400).json({ error: 'Deliveryman delete has failed' });
    }

    const deliverymen = await Deliverymen.findAll({
      include: [
        {
          model: Avatar,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymen);
  }
}
export default new DeliverymenController();
