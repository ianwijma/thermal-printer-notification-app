const {Printer, Image} = require('@node-escpos/core');
const USB = require('@node-escpos/usb-adapter');

module.exports = {
    getPrinter: async function() {
        return new Promise((resolve, reject) => {
            const device = new USB();
            device.open((err) => {
                if (err) reject(err);

                const options = { encoding: "GB18030" /* default */ }
                resolve(new Printer(device, options));
            })
        });
    },
}
