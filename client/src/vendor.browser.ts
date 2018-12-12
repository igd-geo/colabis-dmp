// For vendors for example jQuery, Lodash, angular2-jwt just import them here unless you plan on
// chunking vendors files for async loading. You would need to import the async loaded vendors
// at the entry point of the async loaded file. Also see custom-typings.d.ts as you also need to
// run `typings install x` where `x` is your module

// Angular 2
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/forms';
import '@angular/http';
import '@angular/router';

// RxJS
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';

// Custom operator
import './rx/add/operator/firstIf';

// UIKit
import 'uikit/dist/js/uikit.js';
import 'uikit/dist/css/uikit.almost-flat.css';
import 'uikit/dist/js/components/accordion.js';
import 'uikit/dist/js/components/upload.js';
import 'uikit/dist/css/components/accordion.almost-flat.css';
import 'uikit/dist/css/components/upload.almost-flat.css';
import 'uikit/dist/css/components/form-file.almost-flat.css';
import 'uikit/dist/css/components/placeholder.almost-flat.css';
import 'uikit/dist/js/components/tooltip.js';
import 'uikit/dist/css/components/tooltip.almost-flat.css';
