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

Route.get('/csrf', 'PageController.csrf');
Route.get('/base', 'PageController.base');
Route.get('/', 'PageController.home');
Route.post('/signup', 'AuthController.signup');
Route.route('*', 'PageController.obscure');

/*Route.group(() => {
  Route.get('/resend', 'PageController.resend')
  Route.get('/forgot', 'PageController.forgot')
  Route.get('/reset/:token', 'PageController.reset')
  Route.get('/login', 'PageController.login')
}).middleware(['authenticated'])
Route.get('/dash', 'PageController.dash').middleware(['auth']).as('dash')
Route.get('/', 'PageController.home')
Route.get('*', 'PageController.obscure')

Route.group(() => {
  Route.post('signup', 'AuthController.signup')
  Route.post('resend', 'AuthController.resend')
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout')
  Route.post('forgot', 'AuthController.forgot')
  Route.post('reset', 'AuthController.reset')
  Route.get('confirm/:token', 'AuthController.confirm')
}).prefix('/api/')*/
