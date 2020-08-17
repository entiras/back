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

Route.get('/gen/script', 'GenerationController.script');
Route.get('/gen/style', 'GenerationController.style');
Route.get('/gen/home', 'GenerationController.home');
Route.get('/gen/obscure', 'GenerationController.obscure');
Route.get('/gen/login', 'GenerationController.login');
Route.get('/gen/login/forgot', 'GenerationController.login_forgot');
Route.get('/gen/signup', 'GenerationController.signup');
Route.get('/gen/signup/confirm', 'GenerationController.signup_confirm');
Route.get('/gen/signup/resend', 'GenerationController.signup_resend');

Route.post('/login', 'LoginController.login');
Route.post('/logout', 'LoginController.logout');
Route.post('/signup', 'SignupController.signup');
Route.post('/signup/confirm', 'SignupController.signup_confirm');
Route.post('/signup/resend', 'SignupController.signup_resend');

Route.get('/', 'MainController.home');
Route.get('/csrf', 'MainController.csrf');
Route.get('/captcha', 'MainController.captcha');

Route.route('*', 'MainController.obscure');