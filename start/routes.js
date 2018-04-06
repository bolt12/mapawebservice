'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route')

/*
Route.get('/', ({ request }) => {
  return { greeting: 'Hello world in JSON' }
});
*/

Route.post('login', 'AuthController.login').prefix('api/v1');


Route.group(() => {

  /* User endpoints */
  Route.resource('user', 'UserController');

  /* Device endpoints */
  Route.resource('device', 'DeviceController');

  /* Job endpoints */
  Route.resource('job', 'JobController');

  /* File endpoints */
  Route.resource('file', 'FileController');
  Route.get('file/uploaded/:folder', 'FileController.fromFolder');
  Route.get('file/folders/get', 'FileController.folders');

  /* List endpoints */
  Route.resource('list', 'ListController');
  Route.post('list/:id/add', 'ListController.addTask');
  Route.put('task/:id', 'ListController.editTask');
  Route.delete('task/:id', 'ListController.deleteTask');

  /* Scan a device endpoint */
  Route.post('device/scan', 'DeviceController.scan');

  /* Smart TV endpoints */
  Route.post('tv/displayKey', 'SmartTvController.displayKey');
  Route.post('tv/getSessionId', 'SmartTvController.getSessionId');
  Route.post('tv/handleCommand', 'SmartTvController.handleCommand');
  /* Smart LED Light Bulb endpoints */
  Route.post('led/handleCommand', 'SmartLedController.handleCommand');
  /* Print a file endpoint */
  Route.post('printer/print', 'PrinterController.print');
  /* Torrent endpoints */
  Route.post('torrent/add', 'TorrentController.add');
  Route.get('torrent/all', 'TorrentController.all');
  Route.post('torrent/check', 'TorrentController.check');
  Route.post('torrent/pause', 'TorrentController.pause');
  Route.post('torrent/resume', 'TorrentController.resume');

  /* Logout user endpoint */
  Route.post('logout', 'AuthController.logout');

}).prefix('api/v1').middleware(['auth']);

