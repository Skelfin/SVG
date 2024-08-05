<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Repository\PhotoRepository;
use App\Repository\UserRepository;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Exception\ResourceNotFoundException;
use Symfony\Component\Routing\Loader\YamlFileLoader;
use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\RouteCollection;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$config = include __DIR__ . '/../src/Config/config.php';

$pdo = $config['pdo'];
$jwtKey = $config['jwt_key'];
$encryptionKey = $config['encryption_key'];

$routes = new RouteCollection();

$fileLocator = new FileLocator([__DIR__ . '/../src/Config']);
$loader = new YamlFileLoader($fileLocator);
$routes = $loader->load('routes.yaml');

$context = new RequestContext('/');
$matcher = new UrlMatcher($routes, $context);

$request = Request::createFromGlobals();
$context->fromRequest($request);

$userRepository = new UserRepository($pdo);
$photoRepository = new PhotoRepository($pdo);

try {
    $parameters = $matcher->match($context->getPathInfo());

    $controller = $parameters['_controller'];
    list($class, $method) = explode('::', $controller);

    $controllerInstance = new $class(
        $class === 'App\Controller\UserController' ? $userRepository : $photoRepository,
        $jwtKey,
        $encryptionKey
    );

    $response = call_user_func_array([$controllerInstance, $method], [$request]);
} catch (ResourceNotFoundException $e) {
    $response = new Response('Not Found', 404);
} catch (Exception $e) {
    $response = new Response('An error occurred: ' . $e->getMessage(), 500);
}

$response->send();
