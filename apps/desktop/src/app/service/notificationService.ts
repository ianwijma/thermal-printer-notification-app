// @ts-ignore
import express, { Application, Express } from 'express'
import { connectionString, defaultPort } from "../constants";

export default class NotificationService {
  static app: Application;

  private static init() {
    NotificationService.app = express();

  }

  private static setup() {
    // Ping
    NotificationService.app.get('/ping', (_, res) => {
      res.send(connectionString);
    })

    // request connection
    const codes = {}; // TODO: Make persistent
    NotificationService.app.post('/request', (req, res) => {
      // @ts-ignore
      const clientCode: string = req?.query?.cc;

      // Check if there is a client code
      if (!clientCode) {
        res.statusCode = 400;
        res.send('Missing cc (clientCode)');
      }

      // TODO: Validate client code

      codes[clientCode] = nanoid();
    });
  }

  private static activate() {
    NotificationService.app.listen(defaultPort, () => console.log(`localhost:${defaultPort}`))
  }

  static main() {
    NotificationService.init();
    NotificationService.setup();
    NotificationService.activate();
  }
}
