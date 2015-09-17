# HttpDataSource

This is a Falcor DataSource which can be used to retrieve JSON Graph information from an HTTP server.

## Install
```bash
npm install falcor-http-datasource
```

## Usage

Minimalistic ES6 example, a quick dirty setup

```es6
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import user from 'app/models/user';

var model = new falcor.Model({
  source: new HttpDataSource('/model.json')
});
```
If you need some additional info for your global HTTP requests consider something like

JWT
```javascript
var source = new HttpDataSource('/model.json', {
  headers: {
    'Authorization': `bearer ' + token`
  }
});
```
Cookies
```javascript
var source = new HttpDataSource('/model.json', {
  withCredentials: true
});
// server must include the header `Access-Control-Allow-Credentials: true`
```
CORS
```javascript
var source = new HttpDataSource('/model.json', {
  crossDomain: true
});
```
or you might want to pass it to constructor as your global AppSource

```es6

export class AppSource extends HttpDataSource {
  constructor(path, token) {
    super(path, {
      headers: {
        'Authorization': `bearer ${ token }`
      }
      timeout: 20000
    })
  }

  get(...args) {
    // returns an Observable if you wanted to map/filter/reduce/etc
    return super.get(...args)
  }
  set(...args) {
    // returns an Observable if you wanted to map/filter/reduce/etc
    return super.set(...args)
  }
  call(...args) {
    // returns an Observable if you wanted to map/filter/reduce/etc
    return super.call(...args)
  }

  onBeforeRequest(config) {
    // as of now you're able to mutate the config object before we create our xhr instance
    // you would attach any url params here
    // config.url = config.url + '&something=Value'
    console.log(config);
  }
  buildQueryObject(...args) {
    // helper method to build our url for advanced implementations
    return super.buildQueryObject(...args)
  }
}

export class FalcorModel extends falcor.Model {
  constructor(cache) {
    super({
      cache: cache,
      source: new AppSource('/model.json', user.token)
    });
  }
}

```
