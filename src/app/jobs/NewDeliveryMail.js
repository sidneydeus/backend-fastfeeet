import Mail from '../../lib/Mail';

class NewDeliveryMail {
  get key() {
    return 'NewDeliveryMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Nova Encomenda',
      template: 'newdelivery',
      context: {
        deliveryid: delivery.id,
        deliveryman: delivery.deliveryman.name,
        recipient: delivery.recipient.name,
        street: delivery.recipient.street,
        housenumber: delivery.recipient.housenumber,
        complement: delivery.recipient.complement,
        city: delivery.recipient.city,
        state: delivery.recipient.state,
        zipcode: delivery.recipient.zipcode,
        product: delivery.product,
      },
    });
  }
}
export default new NewDeliveryMail();
