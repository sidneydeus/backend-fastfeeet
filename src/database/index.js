import Sequelize from 'sequelize';
import User from '../app/models/User';
import Recipient from '../app/models/Recipient';
import Deliverymen from '../app/models/Deliverymen';
import Avatar from '../app/models/Avatar';
import Signature from '../app/models/Signature';
import Delivery from '../app/models/Delivery';
import DeliveryProblems from '../app/models/DeliveryProblems';
import StatusDelivery from '../app/models/StatusDelivery';
import databaseConfig from '../config/database';

const models = [
  User,
  Recipient,
  Deliverymen,
  Avatar,
  Signature,
  Delivery,
  DeliveryProblems,
  StatusDelivery,
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
