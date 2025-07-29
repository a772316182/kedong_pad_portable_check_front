const installer = require('electron-installer-debian');
const path = require('path');

const options = {
  src: path.join(__dirname, 'release-builds', 'kedong-linux-x64'),
  dest: path.join(__dirname, 'release-builds', 'installer'),
  arch: 'amd64',
  icon: path.join(__dirname, 'assets', 'icons', 'linux', 'icon.png'),
  categories: [
    'Utility'
  ],
  description: 'My App',
  productDescription: 'My App',
  name: 'kedong',
  version: '0.1.0',
  maintainer: 'My App Inc. <support@myapp.com>',
  homepage: '<https://myapp.com>',
  icon: path.join(__dirname, 'assets', 'icons', 'linux', 'icon.png'),
  bin: 'kedong'
};

installer(options, function (err) {
  if (err) {
    console.error(err, err.stack);
    process.exit(1);
  }

  console.log('Installer created');
  process.exit(0);
});
