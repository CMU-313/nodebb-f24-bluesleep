'use strict';

/**
 * Database Mock - wrapper for database.js, makes the system use a separate test DB, instead of production.
 * ATTENTION: Testing DB is flushed before every use!
 */

require('../../require-main');

const path = require('path');
const nconf = require('nconf');
const url = require('url');
const winston = require('winston');
const packageInfo = require('../../package.json');

process.env.NODE_ENV = process.env.TEST_ENV || 'production';
global.env = process.env.NODE_ENV || 'production';

// Setup Winston for logging
winston.add(new winston.transports.Console({
	format: winston.format.combine(
		winston.format.splat(),
		winston.format.simple()
	),
}));

// Load config.json
try {
	const fs = require('fs');
	const configJSON = fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf-8');
	winston.info('Config loaded successfully');
} catch (err) {
	winston.error('Error loading config.json:', err.stack);
	throw err;
}

// Load configuration using nconf
nconf.file({ file: path.join(__dirname, '../../config.json') });
nconf.defaults({
	base_dir: path.join(__dirname, '../..'),
	themes_path: path.join(__dirname, '../../node_modules'),
	upload_path: 'test/uploads',
	views_dir: path.join(__dirname, '../../build/public/templates'),
	relative_path: '',
});

// Parse URL and set up relative paths
const urlObject = url.parse(nconf.get('url'));
const relativePath = urlObject.pathname !== '/' ? urlObject.pathname : '';
nconf.set('relative_path', relativePath);
nconf.set('asset_base_url', `${relativePath}/assets`);
nconf.set('upload_path', path.join(nconf.get('base_dir'), nconf.get('upload_path')));
nconf.set('upload_url', '/assets/uploads');
nconf.set('url_parsed', urlObject);
nconf.set('base_url', `${urlObject.protocol}//${urlObject.host}`);
nconf.set('secure', urlObject.protocol === 'https:');
nconf.set('use_port', !!urlObject.port);
nconf.set('port', urlObject.port || nconf.get('port') || 4567);

// Set socket.io origins and other cluster-related settings
const domain = nconf.get('cookieDomain') || urlObject.hostname;
const origins = nconf.get('socket.io:origins') || `${urlObject.protocol}//${domain}:*`;
nconf.set('socket.io:origins', origins);

if (nconf.get('isCluster') === undefined) {
	nconf.set('isPrimary', true);
	nconf.set('isCluster', false);
	nconf.set('singleHostCluster', false);
}

// Get database type and configuration
const dbType = nconf.get('database.type');
const testDbConfig = nconf.get('test_database');
const productionDbConfig = nconf.get('database');

if (!testDbConfig) {
	winston.error('Test database configuration is missing in config.json');
	throw new Error('Test database is not defined in config.json');
}

// Check if test and production databases are the same (should not be)
if (testDbConfig.database === productionDbConfig.database &&
	testDbConfig.host === productionDbConfig.host &&
	testDbConfig.port === productionDbConfig.port) {
	winston.error('Test database configuration matches production configuration. They must differ.');
	throw new Error('Test database has the same config as production database');
}

// Set the test database configuration
nconf.set(`database.${dbType}`, testDbConfig);
winston.info('Database config loaded for testing:', dbType);
winston.info(`Environment: ${global.env}`);

// Load the database module
const db = require('../../src/database');
module.exports = db;

// Test setup and initialization
before(async function () {
	this.timeout(30000);

	// Parse relative paths and other configurations
	const urlObject = url.parse(nconf.get('url'));
	nconf.set('core_templates_path', path.join(__dirname, '../../src/views'));
	nconf.set('base_templates_path', path.join(nconf.get('themes_path'), 'nodebb-theme-persona/templates'));
	nconf.set('theme_config', path.join(nconf.get('themes_path'), 'nodebb-theme-persona', 'theme.json'));
	nconf.set('bcrypt_rounds', 1);
	nconf.set('socket.io:origins', '*:*');
	nconf.set('version', packageInfo.version);
	nconf.set('runJobs', false);
	nconf.set('jobsDisabled', false);

	// Initialize database
	await db.init();
	if (db.createIndices) {
		await db.createIndices();
	}
	await setupMockDefaults();
	await db.initSessionStore();

	// Load metadata and initialize themes
	const meta = require('../../src/meta');
	nconf.set('theme_templates_path', meta.config['theme:templates'] ? path.join(nconf.get('themes_path'), meta.config['theme:id'], meta.config['theme:templates']) : nconf.get('base_templates_path'));

	if (!nconf.get('sessionKey')) {
		nconf.set('sessionKey', 'express.sid');
	}

	await meta.dependencies.check();

	// Initialize webserver and sockets
	const webserver = require('../../src/webserver');
	const sockets = require('../../src/socket.io');
	await sockets.init(webserver.server);

	// Start background jobs
	require('../../src/notifications').startJobs();
	require('../../src/user').startJobs();

	await webserver.listen();

	// Reset defaults after each suite
	this.test.parent.suites.forEach((suite) => {
		suite.afterAll(async () => {
			await setupMockDefaults();
		});
	});
});

// Function to reset the database and mock defaults
async function setupMockDefaults() {
	const meta = require('../../src/meta');
	await db.emptydb();

	winston.info('Test database flushed');
	await setupDefaultConfigs(meta);

	await meta.configs.init();
	meta.config.postDelay = 0;
	meta.config.initialPostDelay = 0;
	meta.config.newbiePostDelay = 0;
	meta.config.autoDetectLang = 0;

	require('../../src/groups').cache.reset();
	require('../../src/posts/cache').getOrCreate().reset();
	require('../../src/cache').reset();
	require('../../src/middleware/uploads').clearCache();

	// Reset privileges and enable default plugins
	await giveDefaultGlobalPrivileges();
	await enableDefaultPlugins();

	await meta.themes.set({
		type: 'local',
		id: 'nodebb-theme-persona',
	});

	// Setup test upload directories
	const fs = require('fs');
	await fs.promises.rm('test/uploads', { recursive: true, force: true });

	const { mkdirp } = require('mkdirp');
	const folders = [
		'test/uploads',
		'test/uploads/category',
		'test/uploads/files',
		'test/uploads/system',
		'test/uploads/profile',
	];
	for (const folder of folders) {
		await mkdirp(folder); // Create necessary test directories
	}
}

// Function to setup default configurations
async function setupDefaultConfigs(meta) {
	winston.info('Populating database with default configs, if not already set...');
	const defaults = require(path.join(nconf.get('base_dir'), 'install/data/defaults.json'));
	defaults.eventLoopCheckEnabled = 0;
	defaults.minimumPasswordStrength = 0;
	await meta.configs.setOnEmpty(defaults);
}

// Function to give global privileges
async function giveDefaultGlobalPrivileges() {
	winston.info('Giving default global privileges...');
	const privileges = require('../../src/privileges');
	await privileges.global.give([
		'groups:chat', 'groups:upload:post:image', 'groups:signature', 'groups:search:content',
		'groups:search:users', 'groups:search:tags', 'groups:local:login', 'groups:view:users',
		'groups:view:tags', 'groups:view:groups',
	], 'registered-users');
	await privileges.global.give([
		'groups:view:users', 'groups:view:tags', 'groups:view:groups',
	], 'guests');
}

// Function to enable default plugins
async function enableDefaultPlugins() {
	winston.info('Enabling default plugins...');
	const testPlugins = Array.isArray(nconf.get('test_plugins')) ? nconf.get('test_plugins') : [];
	const defaultEnabled = [
		'nodebb-plugin-dbsearch',
		'nodebb-widget-essentials',
		'nodebb-plugin-composer-default',
	].concat(testPlugins);

	winston.info('Activating default plugins:', defaultEnabled);
	await db.sortedSetAdd('plugins:active', defaultEnabled);
}
