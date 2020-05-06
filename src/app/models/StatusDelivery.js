import Sequelize, { Model } from 'sequelize';

class StatusDelivery extends Model {
  static init(sequelize) {
    super.init(
      {
        signature_id: Sequelize.INTEGER,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default StatusDelivery;
