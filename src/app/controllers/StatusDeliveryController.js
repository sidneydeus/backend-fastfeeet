import * as Yup from 'yup';
import { Op } from 'sequelize';
import { getHours, format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

import Delivery from '../models/Delivery';

class StatusDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveryExists = await Delivery.findOne({
      where: { id: req.params.id },
    });

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    // check valid daily limit
    const today = format(new Date(), 'yyyy-MM-dd', {
      timeZone: 'America/Sao_Paulo',
    });

    const amountDeliveriesByDay = await Delivery.count({
      where: {
        recipient_id: deliveryExists.recipient_id,
        start_date: {
          [Op.gte]: today,
        },
      },
    });

    // console.log(amountOrdersByDay);

    if (amountDeliveriesByDay > 5) {
      return res.status(400).json({ error: 'Daily limit exceeded' });
    }

    // check valid time
    const hour_now = getHours(zonedTimeToUtc(new Date(), 'America/Sao_Paulo'));

    if (hour_now >= 0 && hour_now < 18) {
      if (deliveryExists.start_date === null && !req.body.start_date) {
        return res.status(400).json({ error: 'Start date is required' });
      }

      if (deliveryExists.start_date === null && req.body.start_date) {
        const today_utc = zonedTimeToUtc(
          req.body.start_date,
          'America/Sao_Paulo'
        );

        await Delivery.update(
          { start_date: today_utc },
          { where: { id: req.params.id } }
        );
      }

      if (deliveryExists.start_date !== null && req.body.signature_id) {
        const today_utc = zonedTimeToUtc(new Date(), 'America/Sao_Paulo');

        await Delivery.update(
          { end_date: today_utc, signature_id: req.body.signature_id },
          { where: { id: req.params.id } }
        );
      }

      const delivery_updated = await Delivery.findOne({
        where: { id: req.params.id },
      });

      return res.json(delivery_updated);
    }

    return res.status(400).json({ error: 'Time is invalid' });
  }
}

export default new StatusDeliveryController();
