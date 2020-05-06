import Mail from '../../lib/Mail';

class CancelDeliveryMail {
  get key() {
    return 'CancelDeliveryMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Cancelamento Encomenda',
      template: 'canceldelivery',
      context: {
        delivery: delivery.id,
        deliveryman: delivery.deliveryman.name,
        message: 'Encomenda cancelada.',
      },
    });
  }
}
export default new CancelDeliveryMail();
