import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { q } = req.query;
    const { id } = req.params;

    if (req.params.id) {
      const recipient = await Recipient.findOne({
        where: { id: req.params.id },
      });
      return res.json(recipient);
    }

    if (req.query.q) {
      const recipient_filtered = await Recipient.findAll({
        where: {
          name: {
            [Op.iLike]: `%${req.query.q}%`,
          },
        },
        attributes: [
          'id',
          'name',
          'complement',
          'street',
          'housenumber',
          'city',
          'state',
          'zipcode',
        ],
      });

      if (recipient_filtered.length > 0) {
        return res.json(recipient_filtered);
      }
    }

    // search all
    const recipient_all = await Recipient.findAll({
      attributes: [
        'id',
        'name',
        'complement',
        'street',
        'housenumber',
        'city',
        'state',
        'zipcode',
      ],
    });

    return res.send(recipient_all);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      housenumber: Yup.string().required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string()
        .length(2)
        .required(),
      zipcode: Yup.string()
        .length(8)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, name } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      housenumber: Yup.string().required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string()
        .length(2)
        .required(),
      zipcode: Yup.string()
        .length(8)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipientExists = await Recipient.findByPk(req.params.id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const recipient = await Recipient.update(req.body, {
      where: { id: req.params.id },
    });

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient update has failed' });
    }

    const recipients = await Recipient.findAll({
      attributes: [
        'id',
        'street',
        'housenumber',
        'complement',
        'city',
        'state',
        'zipcode',
      ],
    });

    return res.json(recipients);
  }

  async delete(req, res) {
    const recipientExists = await Recipient.findOne({
      where: { id: req.params.id },
    });

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    const recipientDelete = await Recipient.destroy({
      where: { id: req.params.id },
    });

    if (!recipientDelete) {
      return res.status(400).json({ error: 'Recipient delete has failed' });
    }

    const recipients = await Recipient.findAll({
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
    });

    return res.json(recipients);
  }
}
export default new RecipientController();
