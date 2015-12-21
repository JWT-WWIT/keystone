/**
 * Returns an Express Router with bindings for the Admin UI static resources,
 * i.e files, less and browserified scripts.
 *
 * Should be included before other middleware (e.g. session management,
 * logging, etc) for reduced overhead.
 */

var browserify = require('./browserify');
var express = require('express');
var less = require('less-middleware');
var path = require('path');

/**
 * Return the static express router.
 * @param {String} contextPath The application's admin base URL. Can be null
 *     to default to /admin
 * @return {Router}
 */
exports = module.exports = function (contextPath) {
	contextPath = contextPath || '/admin'
	var router = express.Router();

	/* Prepare browserify bundles */

	var bundles = {
		fields: browserify('fields.js', 'FieldTypes'),
		home: browserify('views/home.js'),
		item: browserify('views/item.js'),
		list: browserify('views/list.js')
	};

	router.prebuild = function() {
		bundles.fields.build();
		bundles.home.build();
		bundles.item.build();
		bundles.list.build();
	};

	/* Prepare LESS options */

	var reactSelectPath = path.join(path.dirname(require.resolve('react-select')), '..');

	var lessOptions = {
		render: {
			modifyVars: {
				reactSelectPath: JSON.stringify(reactSelectPath),
				contextPath: "'" + contextPath + "'"
			},
		}
	};

	/* Configure router */

	router.use('/styles', less(__dirname + '../../public/styles', lessOptions));
	router.use(express.static(__dirname + '../../public'));
	router.get('/js/fields.js', bundles.fields.serve);
	router.get('/js/home.js', bundles.home.serve);
	router.get('/js/item.js', bundles.item.serve);
	router.get('/js/list.js', bundles.list.serve);

	return router;
};
