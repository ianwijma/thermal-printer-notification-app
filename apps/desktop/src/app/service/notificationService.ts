// @ts-ignore
import express, { Application, Express } from 'express'
import { defaultPort } from "../constants";
import { connectedString } from "../constants";
import { disconnectedString } from "../constants";
// @ts-ignore
import { printer as Printer, types as Types }  from "node-thermal-printer";
import PrinterDriver from 'printer';

export default class NotificationService {
  static app: Application;
  static printer: Printer;

  private static init() {
    NotificationService.app = express();

    NotificationService.printer = new Printer({
      type: Types.EPSON,                                  // Printer type: 'star' or 'epson'
      interface: 'printer:auto',                       // Printer interface
      driver: PrinterDriver,
      characterSet: 'SLOVENIA',                                 // Printer character set - default: SLOVENIA
      removeSpecialCharacters: false,                           // Removes special characters - default: false
      lineCharacter: "=",                                       // Set character for lines - default: "-"
      options:{                                                 // Additional options
        timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
      }
    });
  }

  private static setup() {
    // request connection
    const codes = {
      'memes': 'dreams'
    }; // TODO: Make persistent

    NotificationService.app.get('/', (_, res) => {
      res.send("Don't let your dreams be memes!~")
    });

    // Ping
    NotificationService.app.get('/ping', (req, res) => {
      const clientSecret = req?.query?.cs as string;

      res.send(codes[clientSecret] ? connectedString : disconnectedString);
    })

    NotificationService.app.get('/client-secret', (req, res) => {
      const clientCode: string = req?.query?.cc as string;

      // Check if there is a client code
      if (!clientCode) {
        res.statusCode = 400;
        res.send('Missing cc (clientCode)');
      }

      let clientSecret = codes[clientCode];
      if (!clientSecret) {
        clientSecret = 'some-random-id'; // TODO: Generate random ID
      }

      codes[clientCode] = clientSecret;

      res.json({ clientSecret });
    });

    // Print
    NotificationService.app.get('/notify', async (req, res) => {
      const {
        cc: clientCode,
        cs: clientSecret,
        msg: message
      } = req?.query as {cc: string, cs: string, msg: string}

      // @ts-ignore
      if (codes[clientCode] && codes[clientCode] === clientSecret) {
        res.statusCode = 400;
        res.send('Invalid cc (clientCode) or cs (clientSecret)');
      }

      if (!message) {
        res.statusCode = 400;
        res.send('Missing msg (message)');
      }

      let isConnected = await NotificationService.printer.isPrinterConnected();
      console.log(isConnected);
      console.log(message);
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
