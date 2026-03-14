"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/index/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./src/pages/index/index.tsx":
/*!****************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./src/pages/index/index.tsx ***!
  \****************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Index; }
/* harmony export */ });
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _components_SearchBar__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../components/SearchBar */ "./src/components/SearchBar/index.tsx");
/* harmony import */ var _components_BeanCard__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../components/BeanCard */ "./src/components/BeanCard/index.tsx");
/* harmony import */ var _components_EmptyState__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../components/EmptyState */ "./src/components/EmptyState/index.tsx");
/* harmony import */ var _services_api__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../services/api */ "./src/services/api.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);













var CONTINENTS = [{
  id: 'asia',
  name: '亚洲',
  icon: '🌏',
  color: '#E07A5F',
  countries: ['云南', '印尼', '越南', '泰国', '印度', '也门']
}, {
  id: 'africa',
  name: '非洲',
  icon: '🌍',
  color: '#F2CC8F',
  countries: ['埃塞俄比亚', '肯尼亚', '卢旺达', '坦桑尼亚', '乌干达']
}, {
  id: 'americas',
  name: '美洲',
  icon: '🌎',
  color: '#81B29A',
  countries: ['哥伦比亚', '巴西', '危地马拉', '哥斯达黎加', '巴拿马', '秘鲁', '洪都拉斯', '尼加拉瓜', '萨尔瓦多', '墨西哥', '厄瓜多尔', '玻利维亚']
}];
var CONTINENT_PATHS = {
  americas: 'M 15,5 C 35,-5 60,5 65,15 C 68,25 55,35 52,45 C 50,55 65,60 70,70 C 75,85 60,98 52,95 C 45,90 38,75 35,65 C 32,55 25,50 22,40 C 18,30 5,15 15,5 Z',
  africa: 'M 42,12 C 55,10 75,18 85,32 C 95,45 88,60 80,72 C 70,85 62,95 52,95 C 45,95 40,85 35,75 C 25,60 12,50 15,38 C 18,28 28,25 32,22 C 35,18 38,15 42,12 Z',
  asia: 'M 35,15 C 60,5 88,10 92,30 C 95,45 85,60 80,75 C 75,90 60,95 50,85 C 40,75 32,70 25,60 C 15,50 12,35 18,25 C 22,18 28,18 35,15 Z'
};
var COUNTRY_PATHS = {
  '云南': 'M 45,15 C 60,12 75,18 82,30 C 88,40 82,55 75,70 C 68,85 55,92 45,88 C 30,82 20,70 18,55 C 15,40 18,25 30,18 C 35,15 40,16 45,15 Z',
  '印尼': 'M 15,45 C 25,40 35,50 45,45 C 55,40 65,48 75,45 C 85,42 92,55 88,62 C 80,68 70,62 60,65 C 50,68 40,60 30,65 C 20,70 10,60 15,45 Z',
  '越南': 'M 45,10 C 60,12 65,25 60,40 C 55,55 68,70 65,85 C 62,95 48,95 42,85 C 38,75 48,60 45,45 C 42,30 35,15 45,10 Z',
  '泰国': 'M 35,15 C 55,10 75,20 75,35 C 75,45 65,55 60,70 C 55,85 52,95 45,95 C 38,95 38,80 42,65 C 45,55 35,45 28,35 C 22,25 25,18 35,15 Z',
  '印度': 'M 35,15 C 55,12 75,25 80,40 C 85,55 70,75 60,88 C 55,95 45,95 40,88 C 30,75 15,55 20,40 C 25,25 25,18 35,15 Z',
  '也门': 'M 25,45 C 45,40 70,42 85,55 C 90,65 75,80 60,85 C 45,90 25,85 15,70 C 10,60 15,50 25,45 Z',
  '埃塞俄比亚': 'M 45,15 C 65,18 85,30 90,45 C 95,60 80,75 65,85 C 50,95 35,85 25,70 C 15,55 25,35 35,22 C 38,18 42,16 45,15 Z',
  '肯尼亚': 'M 35,20 C 55,15 75,25 82,45 C 88,65 75,85 55,90 C 35,95 20,75 18,55 C 15,35 25,25 35,20 Z',
  '卢旺达': 'M 50,25 C 70,25 80,45 75,65 C 70,85 45,90 30,75 C 15,60 25,35 50,25 Z',
  '坦桑尼亚': 'M 40,15 C 65,15 85,30 82,55 C 80,80 60,95 40,90 C 20,85 15,60 22,40 C 25,25 30,18 40,15 Z',
  '乌干达': 'M 45,20 C 65,22 75,40 70,60 C 65,80 45,90 30,75 C 15,60 20,35 45,20 Z',
  '哥伦比亚': 'M 35,15 C 55,10 75,25 80,45 C 85,65 70,85 55,92 C 40,98 25,80 20,60 C 15,40 20,20 35,15 Z',
  '巴西': 'M 40,10 C 65,8 85,25 92,45 C 98,65 80,85 60,95 C 40,105 25,80 18,60 C 12,40 20,15 40,10 Z',
  '危地马拉': 'M 40,15 C 65,15 75,35 70,55 C 65,75 45,90 25,80 C 15,75 20,45 30,25 C 35,18 38,16 40,15 Z',
  '哥斯达黎加': 'M 20,30 C 40,25 65,45 80,60 C 85,65 80,80 65,85 C 50,90 25,70 15,50 C 10,40 15,35 20,30 Z',
  '巴拿马': 'M 15,45 C 35,35 65,35 85,45 C 95,50 85,65 70,65 C 50,65 25,75 15,60 C 8,50 10,48 15,45 Z',
  '秘鲁': 'M 35,15 C 55,20 70,40 75,60 C 80,80 65,95 45,90 C 25,85 15,65 18,45 C 20,25 25,18 35,15 Z',
  '洪都拉斯': 'M 20,30 C 45,25 75,30 85,45 C 90,55 75,70 55,75 C 35,80 15,65 12,50 C 10,40 15,35 20,30 Z',
  '尼加拉瓜': 'M 25,30 C 50,25 75,35 82,50 C 88,65 70,80 50,82 C 30,85 12,70 10,52 C 8,40 15,35 25,30 Z',
  '萨尔瓦多': 'M 20,35 C 45,28 75,38 85,55 C 88,65 70,78 48,80 C 28,82 12,68 12,52 C 12,42 15,38 20,35 Z',
  '墨西哥': 'M 15,20 C 40,12 70,18 88,35 C 95,48 85,65 65,75 C 45,85 20,72 12,55 C 5,40 8,28 15,20 Z',
  '厄瓜多尔': 'M 35,20 C 60,18 78,35 75,55 C 72,75 52,88 32,82 C 15,75 12,55 18,38 C 22,25 28,22 35,20 Z',
  '玻利维亚': 'M 30,18 C 55,15 78,28 82,50 C 85,72 65,90 42,88 C 20,85 12,65 15,45 C 18,28 22,20 30,18 Z'
};
var FALLBACK_PATH = 'M 40,15 C 65,10 85,30 80,55 C 75,80 55,90 35,85 C 15,80 10,60 15,40 C 20,20 25,18 40,15 Z';
var COUNTRY_DETAILS = {
  '云南': {
    icon: '🍃',
    flavors: '茶感·木质·甘蔗甜'
  },
  '印尼': {
    icon: '🌴',
    flavors: '泥土·药草·醇厚'
  },
  '越南': {
    icon: '☕',
    flavors: '浓郁·苦甜·平衡'
  },
  '泰国': {
    icon: '🏝️',
    flavors: '水果·酸甜·明亮'
  },
  '印度': {
    icon: '🌺',
    flavors: '香料·巧克力·醇厚'
  },
  '也门': {
    icon: '🕌',
    flavors: '红酒果香·复杂·神秘'
  },
  '埃塞俄比亚': {
    icon: '🌸',
    flavors: '柑橘·花香·莓果'
  },
  '肯尼亚': {
    icon: '🍅',
    flavors: '番茄·黑醋栗·明亮酸'
  },
  '卢旺达': {
    icon: '💐',
    flavors: '花香·柠檬·蜂蜜'
  },
  '坦桑尼亚': {
    icon: '🏔️',
    flavors: '黑莓·巧克力·明亮'
  },
  '乌干达': {
    icon: '🦍',
    flavors: '泥土·果香·醇厚'
  },
  '哥伦比亚': {
    icon: '🏔️',
    flavors: '坚果·巧克力·焦糖'
  },
  '巴西': {
    icon: '☕',
    flavors: '巧克力·坚果·平衡'
  },
  '危地马拉': {
    icon: '🏕️',
    flavors: '蜂蜜·可可·柔和酸'
  },
  '哥斯达黎加': {
    icon: '🌋',
    flavors: '柑橘·蜂蜜·明亮'
  },
  '巴拿马': {
    icon: '🌴',
    flavors: '茉莉花香·佛手柑·茶感'
  },
  '秘鲁': {
    icon: '🏞️',
    flavors: '坚果·柑橘·平衡'
  },
  '洪都拉斯': {
    icon: '🌾',
    flavors: '焦糖·坚果·柔和'
  },
  '尼加拉瓜': {
    icon: '🏔️',
    flavors: '巧克力·香料·醇厚'
  },
  '萨尔瓦多': {
    icon: '🌺',
    flavors: '柑橘·花香·优雅'
  },
  '墨西哥': {
    icon: '🌵',
    flavors: '坚果·巧克力·温和'
  },
  '厄瓜多尔': {
    icon: '🦙',
    flavors: '柑橘·红糖·明亮'
  },
  '玻利维亚': {
    icon: '🏔️',
    flavors: '花香·水果·稀有'
  }
};
function makeSvgUri(path, color) {
  var isLarge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var inner = isLarge ? "<path d=\"".concat(path, "\" fill=\"none\" stroke=\"").concat(color, "\" stroke-width=\"0.8\" transform=\"scale(0.8) translate(12,12)\" opacity=\"0.4\" stroke-dasharray=\"3 3\"/>") : '';
  var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"".concat(path, "\" fill=\"").concat(color, "\" opacity=\"0.25\" transform=\"translate(0,4)\"/><path d=\"").concat(path, "\" fill=\"").concat(color, "15\" stroke=\"").concat(color, "\" stroke-width=\"").concat(isLarge ? '1.5' : '2.5', "\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>").concat(inner, "</svg>");
  return "data:image/svg+xml,".concat(encodeURIComponent(svg));
}
function Index() {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)('discover'),
    _useState2 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState, 2),
    activeTab = _useState2[0],
    setActiveTab = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(null),
    _useState4 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState3, 2),
    selectedContinent = _useState4[0],
    setSelectedContinent = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(null),
    _useState6 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState5, 2),
    selectedCountry = _useState6[0],
    setSelectedCountry = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(''),
    _useState8 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState7, 2),
    searchQuery = _useState8[0],
    setSearchQuery = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)([]),
    _useState0 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState9, 2),
    beans = _useState0[0],
    setBeans = _useState0[1];
  var _useState1 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(false),
    _useState10 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState1, 2),
    loading = _useState10[0],
    setLoading = _useState10[1];
  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(''),
    _useState12 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState11, 2),
    errorMessage = _useState12[0],
    setErrorMessage = _useState12[1];
  (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(function () {
    loadBeans();
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(function () {
    if (activeTab !== 'discover' && beans.length === 0) loadBeans();
  }, [activeTab]);
  var loadBeans = /*#__PURE__*/function () {
    var _ref = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])().m(function _callee() {
      var _res$items, res, message, _t;
      return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!loading) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            setLoading(true);
            setErrorMessage('');
            _context.p = 2;
            _context.n = 3;
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_10__.getBeans)({
              pageSize: 50
            });
          case 3:
            res = _context.v;
            setBeans((_res$items = res.items) !== null && _res$items !== void 0 ? _res$items : []);
            _context.n = 5;
            break;
          case 4:
            _context.p = 4;
            _t = _context.v;
            message = _t instanceof Error ? _t.message : '加载失败';
            setErrorMessage(message);
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_6___default().showToast({
              title: '加载失败',
              icon: 'none'
            });
          case 5:
            _context.p = 5;
            setLoading(false);
            return _context.f(5);
          case 6:
            return _context.a(2);
        }
      }, _callee, null, [[2, 4, 5, 6]]);
    }));
    return function loadBeans() {
      return _ref.apply(this, arguments);
    };
  }();
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_6__.useReachBottom)(function () {
    if (activeTab !== 'discover' && !loading) loadBeans();
  });
  var filteredBeans = (0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)(function () {
    var result = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(beans);
    if (activeTab === 'new') result = result.filter(function (b) {
      return b.isNewArrival;
    });else if (activeTab === 'sales') result.sort(function (a, b) {
      return b.salesCount - a.salesCount;
    });
    if (searchQuery.trim()) {
      var q = searchQuery.toLowerCase();
      result = result.filter(function (b) {
        return b.name.toLowerCase().includes(q) || b.originCountry.toLowerCase().includes(q) || b.roasterName.toLowerCase().includes(q);
      });
    }
    return result;
  }, [beans, activeTab, searchQuery]);
  var countryBeans = function countryBeans(name) {
    return beans.filter(function (b) {
      var _b$originCountry, _b$name;
      return ((_b$originCountry = b.originCountry) === null || _b$originCountry === void 0 ? void 0 : _b$originCountry.includes(name)) || ((_b$name = b.name) === null || _b$name === void 0 ? void 0 : _b$name.includes(name));
    });
  };
  var continentBeanCount = function continentBeanCount(cont) {
    return beans.filter(function (b) {
      return cont.countries.some(function (c) {
        var _b$originCountry2;
        return (_b$originCountry2 = b.originCountry) === null || _b$originCountry2 === void 0 ? void 0 : _b$originCountry2.includes(c);
      });
    }).length;
  };
  var activeCont = CONTINENTS.find(function (c) {
    return c.id === selectedContinent;
  });
  var handleBack = function handleBack() {
    if (selectedCountry) setSelectedCountry(null);else setSelectedContinent(null);
  };
  var handleTabChange = function handleTabChange(tab) {
    setActiveTab(tab);
    setSelectedContinent(null);
    setSelectedCountry(null);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
    className: "index-page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: "index-page__header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "index-page__title-en",
        children: "COFFEE"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "index-page__title-atlas",
        children: "Atlas"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
        className: "index-page__subtitle",
        children: "\u63A2\u7D22\u7CBE\u54C1\u5496\u5561\u4E0E\u5168\u7403\u98CE\u5473"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_SearchBar__WEBPACK_IMPORTED_MODULE_7__["default"], {
      value: searchQuery,
      placeholder: "\u6309\u70D8\u7119\u5546\u3001\u4EA7\u5730\u6216\u8C46\u79CD\u641C\u7D22...",
      onInput: setSearchQuery
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: "index-page__tabs",
      children: ['discover', 'sales', 'new'].map(function (tab) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "index-page__tab ".concat(activeTab === tab ? 'index-page__tab--active' : ''),
          onClick: function onClick() {
            return handleTabChange(tab);
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "index-page__tab-text",
            children: tab === 'discover' ? '发现' : tab === 'sales' ? '销量' : '新品'
          })
        }, tab);
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
      className: "index-page__content",
      children: [errorMessage && activeTab === 'discover' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "index-page__notice",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "index-page__notice-label",
          children: "\u5F00\u53D1\u63D0\u793A"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
          className: "index-page__notice-text",
          children: errorMessage
        })]
      }) : null, activeTab === 'discover' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "discover",
        children: [(selectedContinent || selectedCountry) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "discover__nav",
          onClick: handleBack,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
            className: "discover__nav-back",
            children: "\u2190"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
            className: "discover__nav-info",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              className: "discover__nav-title",
              children: selectedCountry !== null && selectedCountry !== void 0 ? selectedCountry : activeCont === null || activeCont === void 0 ? void 0 : activeCont.name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
              className: "discover__nav-sub",
              children: selectedCountry ? '选择咖啡豆' : '选择产区'
            })]
          })]
        }), !selectedContinent && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "discover__continents",
          children: CONTINENTS.map(function (cont, index) {
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
              className: "continent-card",
              hoverClass: "continent-card-active",
              hoverStartTime: 20,
              hoverStayTime: 70,
              style: {
                animationDelay: "".concat(index * 0.1, "s")
              },
              onClick: function onClick() {
                return setSelectedContinent(cont.id);
              },
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
                className: "continent-card__map",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Image, {
                  src: makeSvgUri(CONTINENT_PATHS[cont.id], cont.color),
                  className: "continent-card__svg",
                  mode: "aspectFit"
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
                className: "continent-card__body",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
                  className: "continent-card__name",
                  children: cont.name
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
                  className: "continent-card__meta",
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
                    className: "continent-card__dot",
                    style: {
                      backgroundColor: cont.color
                    }
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
                    className: "continent-card__count",
                    children: [continentBeanCount(cont), " \u6B3E"]
                  })]
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
                className: "continent-card__arrow",
                children: "\u203A"
              })]
            }, cont.id);
          })
        }), selectedContinent && !selectedCountry && activeCont && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "discover__countries",
          children: activeCont.countries.map(function (country, index) {
            var _COUNTRY_PATHS$countr, _COUNTRY_DETAILS$coun, _COUNTRY_DETAILS$coun2, _COUNTRY_DETAILS$coun3;
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
              className: "country-card",
              hoverClass: "country-card-active",
              hoverStartTime: 20,
              hoverStayTime: 70,
              style: {
                animationDelay: "".concat(0.05 + index * 0.07, "s")
              },
              onClick: function onClick() {
                return setSelectedCountry(country);
              },
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
                className: "country-card__map",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Image, {
                  src: makeSvgUri((_COUNTRY_PATHS$countr = COUNTRY_PATHS[country]) !== null && _COUNTRY_PATHS$countr !== void 0 ? _COUNTRY_PATHS$countr : FALLBACK_PATH, activeCont.color, true),
                  className: "country-card__svg",
                  mode: "aspectFit"
                })
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
                className: "country-card__body",
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
                  className: "country-card__icon",
                  children: (_COUNTRY_DETAILS$coun = (_COUNTRY_DETAILS$coun2 = COUNTRY_DETAILS[country]) === null || _COUNTRY_DETAILS$coun2 === void 0 ? void 0 : _COUNTRY_DETAILS$coun2.icon) !== null && _COUNTRY_DETAILS$coun !== void 0 ? _COUNTRY_DETAILS$coun : '☕'
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
                  className: "country-card__name",
                  children: country
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.Text, {
                  className: "country-card__flavors",
                  children: (_COUNTRY_DETAILS$coun3 = COUNTRY_DETAILS[country]) === null || _COUNTRY_DETAILS$coun3 === void 0 ? void 0 : _COUNTRY_DETAILS$coun3.flavors
                })]
              })]
            }, country);
          })
        }), selectedCountry && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
          className: "discover__beans",
          children: countryBeans(selectedCountry).length > 0 ? countryBeans(selectedCountry).map(function (bean) {
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_BeanCard__WEBPACK_IMPORTED_MODULE_8__["default"], {
              bean: bean
            }, bean.id);
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_9__["default"], {
            message: "\u8BE5\u4EA7\u533A\u6682\u65E0\u6536\u5F55\u8C46\u6B3E"
          })
        })]
      }), activeTab !== 'discover' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__.View, {
        className: "index-page__list",
        children: errorMessage ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_9__["default"], {
          message: errorMessage
        }) : loading && beans.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_9__["default"], {
          message: "\u52A0\u8F7D\u4E2D..."
        }) : filteredBeans.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_9__["default"], {
          message: "\u672A\u627E\u5230\u5496\u5561\u8C46"
        }) : filteredBeans.map(function (bean) {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_BeanCard__WEBPACK_IMPORTED_MODULE_8__["default"], {
            bean: bean
          }, bean.id);
        })
      })]
    })]
  });
}

/***/ }),

/***/ "./src/pages/index/index.tsx":
/*!***********************************!*\
  !*** ./src/pages/index/index.tsx ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/index/index!./src/pages/index/index.tsx");


var config = {"navigationBarTitleText":"咖啡豆探索","enableShareAppMessage":true};

_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].enableShareAppMessage = true
var inst = Page((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/index/index', {root:{cn:[]}}, config || {}))


/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_index_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/index/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map