"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/debug/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/debug/index!./src/pages/debug/index.tsx":
/*!****************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/debug/index!./src/pages/debug/index.tsx ***!
  \****************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ DebugPage; }
/* harmony export */ });
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _services_api__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../services/api */ "./src/services/api.ts");
/* harmony import */ var _utils_auth__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/auth */ "./src/utils/auth.ts");
/* harmony import */ var _utils_storage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/storage */ "./src/utils/storage.ts");
/* harmony import */ var _utils_api_config__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/api-config */ "./src/utils/api-config.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);












var MAX_PREVIEW_LENGTH = 2800;
function formatPayload(value) {
  var serialized = JSON.stringify(value, null, 2);
  if (serialized.length <= MAX_PREVIEW_LENGTH) {
    return serialized;
  }
  return "".concat(serialized.slice(0, MAX_PREVIEW_LENGTH), "\n...");
}
function getModeLabel(mode) {
  if (mode === 'cloud') return '云端';
  if (mode === 'local') return '本地';
  return '未配置';
}
function DebugPage() {
  var _ref, _storedUser$nickname;
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)((0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getApiBaseUrlState)()),
    _useState2 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState, 2),
    apiState = _useState2[0],
    setApiState = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(apiState.baseUrl),
    _useState4 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState3, 2),
    draftUrl = _useState4[0],
    setDraftUrl = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(''),
    _useState6 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState5, 2),
    runningKey = _useState6[0],
    setRunningKey = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(null),
    _useState8 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState7, 2),
    probeResult = _useState8[0],
    setProbeResult = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)((0,_utils_storage__WEBPACK_IMPORTED_MODULE_8__.getStoredUser)()),
    _useState0 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState9, 2),
    storedUser = _useState0[0],
    setStoredUser = _useState0[1];
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_5__.useDidShow)(function () {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().setNavigationBarTitle({
      title: 'API 联调'
    });
    var nextState = (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getApiBaseUrlState)();
    setApiState(nextState);
    setDraftUrl(nextState.baseUrl);
    setStoredUser((0,_utils_storage__WEBPACK_IMPORTED_MODULE_8__.getStoredUser)());
  });
  function runProbe(_x, _x2) {
    return _runProbe.apply(this, arguments);
  }
  function _runProbe() {
    _runProbe = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee(title, task) {
      var startedAt, payload, _t;
      return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            setRunningKey(title);
            startedAt = Date.now();
            _context.p = 1;
            _context.n = 2;
            return task();
          case 2:
            payload = _context.v;
            setProbeResult({
              title: title,
              durationMs: Date.now() - startedAt,
              payload: formatPayload(payload),
              error: null
            });
            _context.n = 4;
            break;
          case 3:
            _context.p = 3;
            _t = _context.v;
            setProbeResult({
              title: title,
              durationMs: Date.now() - startedAt,
              payload: '',
              error: _t instanceof Error ? _t.message : '请求失败'
            });
          case 4:
            _context.p = 4;
            setRunningKey('');
            return _context.f(4);
          case 5:
            return _context.a(2);
        }
      }, _callee, null, [[1, 3, 4, 5]]);
    }));
    return _runProbe.apply(this, arguments);
  }
  function handleApplyUrl() {
    var nextState = (0,_utils_api_config__WEBPACK_IMPORTED_MODULE_9__.setApiBaseUrlOverride)(draftUrl);
    setApiState(nextState);
    setDraftUrl(nextState.baseUrl);
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
      title: nextState.baseUrl ? '已保存联调地址' : '已清空联调地址',
      icon: 'none'
    });
  }
  function handleResetUrl() {
    var nextState = (0,_utils_api_config__WEBPACK_IMPORTED_MODULE_9__.clearApiBaseUrlOverride)();
    setApiState(nextState);
    setDraftUrl(nextState.baseUrl);
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
      title: '已恢复编译配置',
      icon: 'none'
    });
  }
  var loginLabel = (0,_utils_auth__WEBPACK_IMPORTED_MODULE_7__.isLoggedIn)() ? (_ref = (_storedUser$nickname = storedUser === null || storedUser === void 0 ? void 0 : storedUser.nickname) !== null && _storedUser$nickname !== void 0 ? _storedUser$nickname : storedUser === null || storedUser === void 0 ? void 0 : storedUser.id) !== null && _ref !== void 0 ? _ref : '已登录' : '未登录';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "debug-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "debug-page__hero",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__eyebrow",
        children: "Cloud Debug"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__title",
        children: "\u5C0F\u7A0B\u5E8F API \u8054\u8C03\u9762\u677F"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__subtitle",
        children: "\u5728\u5FAE\u4FE1\u5F00\u53D1\u8005\u5DE5\u5177\u91CC\u628A\u5730\u5740\u5207\u5230\u4E91\u7AEF\u57DF\u540D\uFF0C\u76F4\u63A5\u9A8C\u8BC1\u5065\u5EB7\u68C0\u67E5\u3001\u5217\u8868\u548C\u767B\u5F55\u6001\u3002"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "debug-page__card",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "debug-page__card-head",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "debug-page__card-title",
          children: "\u5F53\u524D\u5730\u5740"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "debug-page__badge debug-page__badge--".concat(apiState.mode),
          children: getModeLabel(apiState.mode)
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__value",
        children: apiState.baseUrl || '未配置，建议填写你的云端 HTTPS 域名'
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__meta",
        children: apiState.source === 'runtime' ? '来源：本机覆盖配置' : '来源：编译配置 TARO_APP_API_URL'
      }), apiState.warning ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__warning",
        children: apiState.warning
      }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Input, {
        className: "debug-page__input",
        value: draftUrl,
        placeholder: "https://your-cloud-domain.com",
        onInput: function onInput(event) {
          return setDraftUrl(event.detail.value);
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "debug-page__actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "debug-page__button debug-page__button--primary",
          onClick: handleApplyUrl,
          children: "\u4FDD\u5B58\u8054\u8C03\u5730\u5740"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "debug-page__button",
          onClick: handleResetUrl,
          children: "\u6062\u590D\u7F16\u8BD1\u914D\u7F6E"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "debug-page__card",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__card-title",
        children: "\u767B\u5F55\u72B6\u6001"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__value",
        children: loginLabel
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__meta",
        children: (0,_utils_auth__WEBPACK_IMPORTED_MODULE_7__.isLoggedIn)() ? '可继续测试 /api/v1/me 和收藏接口。' : '先去“我的”页登录，再回来验证个人信息和收藏接口。'
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "debug-page__card",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__card-title",
        children: "\u5FEB\u901F\u63A2\u9488"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "debug-page__probe-grid",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "debug-page__probe-button",
          loading: runningKey === 'health',
          onClick: function onClick() {
            return runProbe('health', function () {
              return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getApiHealth)();
            });
          },
          children: "\u5065\u5EB7\u68C0\u67E5"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "debug-page__probe-button",
          loading: runningKey === 'beans',
          onClick: function onClick() {
            return runProbe('beans', function () {
              return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getBeans)({
                page: 1,
                pageSize: 3
              });
            });
          },
          children: "\u8C46\u6B3E\u5217\u8868"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "debug-page__probe-button",
          loading: runningKey === 'roasters',
          onClick: function onClick() {
            return runProbe('roasters', function () {
              return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getRoasters)({
                page: 1,
                pageSize: 3
              });
            });
          },
          children: "\u70D8\u7119\u5546\u5217\u8868"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "debug-page__probe-button",
          loading: runningKey === 'me',
          onClick: function onClick() {
            return runProbe('me', function () {
              return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getMe)();
            });
          },
          children: "\u5F53\u524D\u7528\u6237"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "debug-page__probe-button",
          loading: runningKey === 'favorites',
          onClick: function onClick() {
            return runProbe('favorites', function () {
              return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getFavorites)();
            });
          },
          children: "\u6536\u85CF\u5217\u8868"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "debug-page__card",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__card-title",
        children: "\u6700\u8FD1\u4E00\u6B21\u7ED3\u679C"
      }), probeResult ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "debug-page__result",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "debug-page__result-title",
          children: [probeResult.title, " \xB7 ", probeResult.durationMs, "ms"]
        }), probeResult.error ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "debug-page__result-error",
          children: probeResult.error
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "debug-page__result-code",
          children: probeResult.payload
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "debug-page__meta",
        children: "\u8FD8\u6CA1\u6709\u6267\u884C\u63A2\u9488\u3002\u5EFA\u8BAE\u5148\u6D4B\u5065\u5EB7\u68C0\u67E5\uFF0C\u518D\u6D4B\u8C46\u6B3E/\u70D8\u7119\u5546\u5217\u8868\u3002"
      })]
    })]
  });
}

/***/ }),

/***/ "./src/pages/debug/index.tsx":
/*!***********************************!*\
  !*** ./src/pages/debug/index.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_debug_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/debug/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/debug/index!./src/pages/debug/index.tsx");


var config = {};


var inst = Page((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_debug_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/debug/index', {root:{cn:[]}}, config || {}))


/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_debug_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/debug/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map