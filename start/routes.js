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
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.get('/', 'MainController.home');
Route.get('/csrf', 'MainController.csrf');
Route.get('/captcha', 'MainController.captcha');

Route.get('/gen/script', 'GenerationController.script');
Route.get('/gen/style', 'GenerationController.style');
Route.get('/gen/home', 'GenerationController.home');
Route.get('/gen/login', 'GenerationController.login');

Route.route('*', 'MainController.obscure');