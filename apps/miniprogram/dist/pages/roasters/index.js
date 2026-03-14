"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/roasters/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roasters/index!./src/pages/roasters/index.tsx":
/*!**********************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roasters/index!./src/pages/roasters/index.tsx ***!
  \**********************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ RoastersPage; }
/* harmony export */ });
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _components_EmptyState__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../components/EmptyState */ "./src/components/EmptyState/index.tsx");
/* harmony import */ var _components_RoasterCard__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../components/RoasterCard */ "./src/components/RoasterCard/index.tsx");
/* harmony import */ var _components_SearchBar__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/SearchBar */ "./src/components/SearchBar/index.tsx");
/* harmony import */ var _services_api__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../services/api */ "./src/services/api.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);













var PAGE_SIZE = 12;
var SEARCH_DEBOUNCE_MS = 260;
function mergeCities(current, incoming) {
  var next = new Set(current);
  incoming.forEach(function (roaster) {
    if (roaster.city) next.add(roaster.city);
  });
  return Array.from(next).slice(0, 8);
}
function RoastersPage() {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)([]),
    _useState2 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState, 2),
    roasters = _useState2[0],
    setRoasters = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(false),
    _useState4 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(1),
    _useState6 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState5, 2),
    page = _useState6[0],
    setPage = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(true),
    _useState8 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState7, 2),
    hasMore = _useState8[0],
    setHasMore = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(null),
    _useState0 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState9, 2),
    total = _useState0[0],
    setTotal = _useState0[1];
  var _useState1 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(''),
    _useState10 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState1, 2),
    searchQuery = _useState10[0],
    setSearchQuery = _useState10[1];
  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(''),
    _useState12 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState11, 2),
    selectedCity = _useState12[0],
    setSelectedCity = _useState12[1];
  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)([]),
    _useState14 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState13, 2),
    cityOptions = _useState14[0],
    setCityOptions = _useState14[1];
  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(''),
    _useState16 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState15, 2),
    errorMessage = _useState16[0],
    setErrorMessage = _useState16[1];
  var loadingRef = (0,react__WEBPACK_IMPORTED_MODULE_4__.useRef)(false);
  var requestVersionRef = (0,react__WEBPACK_IMPORTED_MODULE_4__.useRef)(0);
  var mountedRef = (0,react__WEBPACK_IMPORTED_MODULE_4__.useRef)(false);
  var normalizedQuery = searchQuery.trim();
  var setLoadingState = function setLoadingState(value) {
    loadingRef.current = value;
    setLoading(value);
  };
  var loadPage = /*#__PURE__*/function () {
    var _ref = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee(currentPage, options) {
      var requestVersion, _res$items, res, nextItems, message, _t;
      return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!(loadingRef.current && !(options !== null && options !== void 0 && options.ignoreLoading))) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            requestVersion = requestVersionRef.current + 1;
            requestVersionRef.current = requestVersion;
            setLoadingState(true);
            setErrorMessage('');
            _context.p = 2;
            _context.n = 3;
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_10__.getRoasters)({
              page: currentPage,
              pageSize: PAGE_SIZE,
              q: normalizedQuery || undefined,
              city: selectedCity || undefined
            });
          case 3:
            res = _context.v;
            if (!(requestVersion !== requestVersionRef.current)) {
              _context.n = 4;
              break;
            }
            return _context.a(2);
          case 4:
            nextItems = (_res$items = res.items) !== null && _res$items !== void 0 ? _res$items : [];
            setRoasters(function (prev) {
              return currentPage === 1 || options !== null && options !== void 0 && options.reset ? nextItems : [].concat((0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(prev), (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(nextItems));
            });
            setTotal(res.pageInfo.total);
            setHasMore(res.pageInfo.hasNextPage);
            setPage(currentPage + 1);
            if (!normalizedQuery) {
              setCityOptions(function (prev) {
                return mergeCities(prev, nextItems);
              });
            }
            _context.n = 7;
            break;
          case 5:
            _context.p = 5;
            _t = _context.v;
            if (!(requestVersion !== requestVersionRef.current)) {
              _context.n = 6;
              break;
            }
            return _context.a(2);
          case 6:
            message = _t instanceof Error ? _t.message : '加载失败';
            setErrorMessage(message);
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_6___default().showToast({
              title: '加载失败',
              icon: 'none'
            });
          case 7:
            _context.p = 7;
            if (requestVersion === requestVersionRef.current) {
              setLoadingState(false);
            }
            return _context.f(7);
          case 8:
            return _context.a(2);
        }
      }, _callee, null, [[2, 5, 7, 8]]);
    }));
    return function loadPage(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  var reload = function reload() {
    requestVersionRef.current += 1;
    setRoasters([]);
    setPage(1);
    setHasMore(true);
    setTotal(null);
    void loadPage(1, {
      reset: true,
      ignoreLoading: true
    });
  };
  (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(function () {
    if (!mountedRef.current) {
      mountedRef.current = true;
      void loadPage(1, {
        reset: true,
        ignoreLoading: true
      });
      return;
    }
    var timer = setTimeout(function () {
      reload();
    }, SEARCH_DEBOUNCE_MS);
    return function () {
      return clearTimeout(timer);
    };
  }, [normalizedQuery, selectedCity]);
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_6__.useReachBottom)(function () {
    if (!loadingRef.current && hasMore) {
      void loadPage(page);
    }
  });
  var countLabel = total !== null ? "\u5171\u6536\u5F55 ".concat(total, " \u5BB6\u70D8\u7119\u5546") : loading ? '正在整理品牌目录...' : roasters.length > 0 ? "\u5DF2\u5448\u73B0 ".concat(roasters.length, " \u5BB6\u70D8\u7119\u5546") : '';
  var hasFilters = Boolean(normalizedQuery || selectedCity);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
    className: "roasters-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: "roasters-page__hero",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "roasters-page__title-en",
        children: "ROASTER"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "roasters-page__title-atlas",
        children: "Index"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "roasters-page__subtitle",
        children: "\u7FFB\u9605\u5F53\u5B63\u70D8\u7119\u54C1\u724C\u518C"
      }), countLabel ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "roasters-page__count",
        children: countLabel
      }) : null]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_SearchBar__WEBPACK_IMPORTED_MODULE_9__["default"], {
      value: searchQuery,
      placeholder: "\u6309\u54C1\u724C\u540D\u6216\u57CE\u5E02\u641C\u7D22...",
      onInput: setSearchQuery
    }), cityOptions.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: "roasters-page__city-bar",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "roasters-page__city-chip ".concat(selectedCity ? '' : 'roasters-page__city-chip--active'),
        onClick: function onClick() {
          return setSelectedCity('');
        },
        children: "\u5168\u90E8\u57CE\u5E02"
      }), cityOptions.map(function (city) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "roasters-page__city-chip ".concat(selectedCity === city ? 'roasters-page__city-chip--active' : ''),
          onClick: function onClick() {
            return setSelectedCity(city);
          },
          children: city
        }, city);
      })]
    }) : null, hasFilters ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: "roasters-page__query-bar",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "roasters-page__query-text",
        children: [normalizedQuery ? "\u641C\u7D22 \u201C".concat(normalizedQuery, "\u201D") : '按城市查看品牌', selectedCity ? " \xB7 ".concat(selectedCity) : '']
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "roasters-page__query-clear",
        onClick: function onClick() {
          setSearchQuery('');
          setSelectedCity('');
        },
        children: "\u6E05\u9664"
      })]
    }) : null, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: "roasters-page__list",
      children: [errorMessage ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_7__["default"], {
        message: errorMessage
      }) : loading && roasters.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_7__["default"], {
        message: "\u6B63\u5728\u5C55\u5F00\u54C1\u724C\u76EE\u5F55..."
      }) : roasters.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_7__["default"], {
        message: "\u6682\u65F6\u8FD8\u6CA1\u6709\u5339\u914D\u7684\u70D8\u7119\u5546"
      }) : roasters.map(function (roaster, index) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_RoasterCard__WEBPACK_IMPORTED_MODULE_8__["default"], {
          roaster: roaster,
          index: index
        }, roaster.id);
      }), loading && roasters.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "roasters-page__loading",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "roasters-page__loading-text",
          children: "\u7EE7\u7EED\u7FFB\u9605\u4E2D..."
        })
      }) : null, !hasMore && roasters.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "roasters-page__end",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "roasters-page__end-text",
          children: "\u2014 \u54C1\u724C\u76EE\u5F55\u5DF2\u5230\u5E95 \u2014"
        })
      }) : null]
    })]
  });
}

/***/ }),

/***/ "./src/pages/roasters/index.tsx":
/*!**************************************!*\
  !*** ./src/pages/roasters/index.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_roasters_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roasters/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roasters/index!./src/pages/roasters/index.tsx");


var config = {"navigationBarTitleText":"烘焙商"};


var inst = Page((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_roasters_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/roasters/index', {root:{cn:[]}}, config || {}))


/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_roasters_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/roasters/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map