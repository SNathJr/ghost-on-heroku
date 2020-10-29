'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('webdav'),
    createClient = _require.createClient;

var Buffer = require('buffer').Buffer;
var BaseAdapter = require('ghost-storage-base');
var Promise = require('bluebird');
var debug = require('debug')('webdav');
var fs = require('fs');
var path = require('path');
var process = require('process');

/**
 * @typedef {Object} Config Ghost storage adapter configuration object.
 * @property {string} url The remote address of the WebDAV server
 * @property {string=} username Optional username for authentication
 * @property {string=} password Optional password for authentication
 * @property {string=} pathPrefix Optional path to the root of WebDAV storage
 * @property {string=} storagePathPrefix Optional URL path that routes request to this storage adapter
 */

/**
 * @typedef {Object} Image
 * @property {string} name
 * @property {string} path
 */

/**
 * @typedef {Object} ReadOptions
 * @property {string} path
 */

class WebDavAdapter extends BaseAdapter {
  /**
   * Create a WebDAV adapter
   * @param {Config} config
   */
  constructor() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    super(config);
    if (!config.url && !process.env.WEBDAV_SERVER_URL) {
      throw new Error('A URL to the WebDAV server is required.');
    }
    this.client = createClient(process.env.WEBDAV_SERVER_URL || config.url, {
      'password': process.env.WEBDAV_PASSWORD || config.password,
      'username': process.env.WEBDAV_USERNAME || config.username
    });
    this.pathPrefix = process.env.WEBDAV_PATH_PREFIX || config.pathPrefix || '';
    this.storagePathPrefix = process.env.WEBDAV_STORAGE_PATH_PREFIX || config.storagePathPrefix || '/content/images';
  }

  /**
   * NOTE: the base implementation of `getTargetDir` returns the format this.pathPrefix/YYYY/MM
   * @param {string} filename
   * @param {string=} targetDir
   * @returns {Promise.<boolean>}
   */
  exists(filename) {
    var _this = this;

    var targetDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.pathPrefix;

    return new Promise(function (resolve, reject) {
      var filePath = path.join(targetDir, filename);
      debug(`exists - ${filePath}`);
      if (!filePath.startsWith(_this.pathPrefix)) {
        reject(new Error(`Can not check files outside of ${_this.pathPrefix}: ${filePath}`));
        return;
      }
      _this.client.stat(filePath).then(function () {
        debug(`exists - ${filePath}: true`);
        resolve(true);
      }).catch(function () {
        debug(`exists - ${filePath}: false`);
        resolve(false);
      });
    });
  }

  /**
   *
   * @param {string} targetPath
   * @private
   */
  ensureDir_(targetPath) {
    var _this2 = this;

    var targetDir = path.dirname(targetPath);
    var directories = path.relative(this.pathPrefix, targetDir).split(path.sep);
    var self = this;
    var dirPath = this.pathPrefix;
    debug(`ensureDir_ - ${targetDir} - ${directories}`);
    return new Promise(function (resolve, reject) {
      if (!targetDir.startsWith(_this2.pathPrefix)) {
        reject(new Error(`Can not create directories outside of ${_this2.pathPrefix}: ${targetDir}`));
        return;
      }
      (function loop() {
        if (directories.length) {
          dirPath = path.join(dirPath, directories.shift());
          self.exists(dirPath, '/').then(function (exists) {
            return exists || self.client.createDirectory(dirPath);
          }).then(loop).catch(function (error) {
            debug(`ensureDir_ - ${dirPath}: ${error}`);
            reject(error);
          });
        } else {
          resolve();
        }
      })();
    });
  }

  /**
   * NOTE: the base implementation of `getTargetDir` returns the format YYYY/MM
   * @param {Image} image
   * @param {string=} targetDir
   * @returns {Promise.<*>}
   */
  save(image) {
    var _this3 = this;

    var targetDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getTargetDir();

    var dirPath = path.join(this.pathPrefix, targetDir);
    debug(`save - ${dirPath} - ${JSON.stringify(image)}`);
    return new Promise(function (resolve, reject) {
      Promise.all([readFileAsync(image.path), _this3.getUniqueFileName(image, dirPath)]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            data = _ref2[0],
            filename = _ref2[1];

        return _this3.saveRaw(data, filename);
      }).then(function (uri) {
        debug(`save - ${dirPath} - ${JSON.stringify(image)}: ${uri}`);
        resolve(uri);
      }).catch(function (error) {
        debug(`save - ${dirPath} - ${JSON.stringify(image)}: ${error}`);
        reject(error);
      });
    });
  }

  /**
   * Write the image to storage, ensuring that the path to the image stats with the
   * prefix and that the target directory exists. The existance of `saveRaw` enables
   *  Ghost's automatic responsive images.
   *
   * @param {*} data
   * @param {string} targetPath
   * @returns {Promise.<string>}
   * @memberof WebDavAdapter
   */
  saveRaw(data, targetPath) {
    var _this4 = this;

    debug(`saveRaw - ${JSON.stringify(this)} - ${targetPath}`);
    if (!targetPath.startsWith(this.pathPrefix)) {
      // eslint-disable-next-line no-param-reassign
      targetPath = path.join(this.pathPrefix, targetPath);
    }
    return new Promise(function (resolve, reject) {
      _this4.ensureDir_(targetPath).then(function () {
        return _this4.client.putFileContents(targetPath, data);
      }).then(function () {
        var uri = path.join(_this4.storagePathPrefix, path.relative(_this4.pathPrefix, targetPath));
        debug(`saveRaw - ${targetPath}: ${uri}`);
        resolve(uri);
      }).error(function (error) {
        debug(`saveRaw - ${targetPath}: ${error}`);
        reject(error);
      });
    });
  }

  /**
   *
   * @returns {function(*, *, *)}
   */
  serve() {
    var _this5 = this;

    return function (req, res, next) {
      var filename = path.join(_this5.pathPrefix, req.path);
      debug(`serve - ${filename}`);
      _this5.client.createReadStream(filename).on('error', function (error) {
        debug(`serve - ${filename}: ${error}`);
        res.status(404);
        next(error);
      }).pipe(res);
    };
  }

  /**
   * NOTE: the base implementation of `getTargetDir` returns the format YYYY/MM
   * @param {string} filename
   * @param {string=} targetDir
   * @returns {Promise.<boolean>}
   */
  delete(filename) {
    var _this6 = this;

    var targetDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getTargetDir();

    return new Promise(function (resolve) {
      var filePath = path.join(_this6.pathPrefix, targetDir, filename);
      debug(`delete - ${filePath}`);
      _this6.client.deleteFile(filePath).then(function () {
        debug(`delete - ${filePath}: true`);
        resolve(true);
      }).catch(function () {
        debug(`delete - ${filePath}: false`);
        resolve(false);
      });
    });
  }

  /**
   *
   * @param {ReadOptions} options
   * @returns {Promise.<*>}
   */
  read() {
    var _this7 = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    options.path = stripTrailingSlash(options.path || '');
    options.path = path.join(this.pathPrefix, options.path);
    return new Promise(function (resolve, reject) {
      debug(`read - ${JSON.stringify(options)}`);
      _this7.client.getFileContents(options.path, options).then(function (arrayBuffer) {
        var buffer = Buffer.from(arrayBuffer);
        if (debug.enabled) {
          var tmpPath = `/tmp/${path.basename(options.path)}`;
          fs.writeFile(`${tmpPath}`, buffer, function () {
            // Do nothing
          });
          debug(`read - ${JSON.stringify(options)}: ${tmpPath} - ${buffer.byteLength} bytes`);
        }
        resolve(buffer);
      }).catch(function (error) {
        debug(`read - ${JSON.stringify(options)}: ${error}`);
        reject(error);
      });
    });
  }
}

var stripTrailingSlash = function stripTrailingSlash(s) {
  return s.replace(/\/$|\\$/, '');
};
var readFileAsync = Promise.promisify(fs.readFile);

module.exports = WebDavAdapter;
