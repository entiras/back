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

/*Route.post('/signup', 'AuthController.signup');
Route.post('/signup/confirm', 'AuthController.confirm');
Route.post('/signup/resend', 'AuthController.resend');
Route.post('/login', 'AuthController.login');
Route.post('/login/forgot', 'AuthController.forgot');
Route.post('/login/reset', 'AuthController.reset');
Route.post('/logout', 'AuthController.logout');*/

Route.route('*', 'MainController.obscure');