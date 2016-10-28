// ==UserScript==
// @name         autopager
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  auto pager
// @author       wangbin
// @include      http*
// @grant        none
// ==/UserScript==

import App from './src/app'

const app = new App()

window.$$autopager = app