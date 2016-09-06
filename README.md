# Chrome Extension Skeleton

## Development

### Installation

```sh
$ git clone https://github.com/redox/chrome-extension-skeleton.git

# in case you don't have Grunt yet
$ sudo npm install -g grunt-cli
```

### Build instructions

```sh
# install dependencies
$ npm install

# generate your private key (required for Chrome)
$ openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt > mykey.pem

# build it
$ grunt
```

When developing, write unit-tests, use the `dev` Grunt task to check that your JS code passes linting tests and unit-tests.

When ready to try out the extension in the browser, use default Grunt task to build it. In `build` directory you'll find develop version of the extension in `unpacked-dev` subdirectory (with source maps), and production (uglified) version in `unpacked-prod` directory.

### Grunt tasks

* `clean`: clean `build` directory
* `test`: JS-lint and mocha test, single run
* `dev`: continuous `test` loop
* default: `clean`, `test`, build step (copy all necessary files to `build`
  directory, browserify JS sources, prepare production version (using uglify) and
  pack the `crx`
