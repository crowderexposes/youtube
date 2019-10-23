require('dotenv').config();

const captureWebsite  = require('capture-website');
const fs              = require('fs');
const moment          = require('moment');
const path            = require('path');
const tr              = require('tor-request');

const queryStrings    = require('./queryStrings');

// Requires TOR installed/running w/ ControlPort enabled (/etc/tor/torrc)
// Optionally: Enable HashedControlPassword (generate w/ /usr/bin/tor --hash-password <passwd>)
tr.TorControlPort.password = process.env.TOR_PASSWORD

const mkdirSync = (p) => {
  if (!fs.existsSync(p)) {
    console.log(`mkdir ${p}`);
    const parent = path.dirname(p);
    if (!fs.existsSync(parent)) {
      mkdirSync(parent);
    }
    fs.mkdirSync(p);
  }
}
const newTorSession = () => new Promise((resolve, reject) => {
  console.log('Creating new TOR session');
  tr.renewTorSession((error) => {
    if (error) {
      console.error(`Unable to create session: ${error}`);
      return reject(error);
    }
    console.log('New session created');
    resolve();
  });
});
const sleep = async (seconds) => {
  console.log(`Sleeping ${seconds} seconds...`);
  await new Promise((resolve, _reject) => {
    setTimeout(resolve, seconds * 1000);
  });
}
const whatDoISee = async (url, file) => {
  const options = {
    launchOptions: {
      args: [
        `--proxy-server=${process.env.TOR_PROXY||'socks5://127.0.0.1:9050'}`,
        '--proxy-bypass-list=<-loopback>',
      ],
    },
  };
  console.log(`Saving ${url} as ${file}`)
  try {
    await captureWebsite.file(url, file, options);
  } catch (ex) {
    console.error(`Error fetching ${url}: ${ex}`);
  }
}
const whereAmI = () => new Promise((resolve, reject) => {
  console.log('Discovering where I am...');
  const accessToken = process.env.IPSTACK_ACCESSTOKEN;
  tr.request(`http://api.ipstack.com/check?access_key=${accessToken}&format=1`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const json = JSON.parse(body);

      const {
        ip,
        city,
        region_name,
        country_name,
      } = json;
      console.log(`  ${ip}: ${city}, ${region_name}, ${country_name}`);

      return resolve(json);
    }
    console.error(`Unable to determine location: ${error}`);
    reject(error);
  });
});

(async () => {
  //for (let i = 0; i < 100; i++) {
  //  if (i > 0) {
  //    await sleep(10);
  //  }

    await newTorSession()
    const {
      city,
      region_name,
      country_name,
    } = await whereAmI();

    queryStrings.forEach((query) => {
      const url  = `https://youtube.com/search?q=${encodeURIComponent(query)}`;
      const filePath = path.join(__dirname, 'screenshots', country_name, region_name, city, query);
      mkdirSync(filePath);

      const fileName = path.join(filePath, `${moment().format('YYYYMMDD')}.png`);
      if (fs.existsSync(fileName)) {
        console.log(`Skipping ${fileName}, already exists.`);
        return;
      }
      
      whatDoISee(url, fileName);
    });
  //}
})();
