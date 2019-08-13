var ghost = require('ghost');
var express = require('express');
var urlService = require('./node_modules/ghost/core/server/services/url');
var parentApp = express();

// Run a single Ghost process
ghost()
  .then(function (ghostServer) {
    ////////////////////////////////////////////////////////////////
    // this is what you need to get subdirectories working properly!
    // e.g. https://www.website.com/blog
    parentApp.use(urlService.utils.getSubdir(), ghostServer.rootApp);
    ghostServer.start(parentApp);
    ////////////////////////////////////////////////////////////////
  })
  .catch( error => {
    console.error(`Ghost server error: ${error.message} ${error.stack}`);
    process.exit(1);
  });