import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(cors());
    /* acesso ao link das imagens diretamente */
    this.server.use(
      '/avatars',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
    this.server.use(
      '/signatures',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
