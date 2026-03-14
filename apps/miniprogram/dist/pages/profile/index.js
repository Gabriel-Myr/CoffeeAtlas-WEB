"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/profile/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx":
/*!********************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx ***!
  \********************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Profile; }
/* harmony export */ });
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_Icon__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../components/Icon */ "./src/components/Icon/index.tsx");
/* harmony import */ var _components_RoasterCard__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../components/RoasterCard */ "./src/components/RoasterCard/index.tsx");
/* harmony import */ var _services_api__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/api */ "./src/services/api.ts");
/* harmony import */ var _utils_auth__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/auth */ "./src/utils/auth.ts");
/* harmony import */ var _utils_api_config__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/api-config */ "./src/utils/api-config.ts");
/* harmony import */ var _utils_storage__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../utils/storage */ "./src/utils/storage.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);














function toBeanSnapshot(bean) {
  return {
    id: bean.id,
    name: bean.name,
    roasterName: bean.roasterName,
    imageUrl: bean.imageUrl,
    originCountry: bean.originCountry,
    process: bean.process,
    price: bean.price
  };
}
function toRoasterSnapshot(roaster) {
  return {
    id: roaster.id,
    name: roaster.name,
    city: roaster.city,
    description: roaster.description,
    logoUrl: roaster.logoUrl,
    beanCount: roaster.beanCount
  };
}
function formatHistoryTime(viewedAt) {
  var diffMs = Date.now() - viewedAt;
  var diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return "".concat(diffMinutes, " \u5206\u949F\u524D");
  var diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return "".concat(diffHours, " \u5C0F\u65F6\u524D");
  var diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '昨天浏览';
  if (diffDays < 7) return "".concat(diffDays, " \u5929\u524D");
  var date = new Date(viewedAt);
  return "".concat(date.getMonth() + 1, "/").concat(date.getDate(), " \u6D4F\u89C8");
}
function BeanRow(_ref) {
  var bean = _ref.bean,
    note = _ref.note,
    onFavoriteToggle = _ref.onFavoriteToggle;
  var handleTap = function handleTap() {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().navigateTo({
      url: "/pages/bean-detail/index?id=".concat(bean.id)
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "profile-bean-row",
    onClick: handleTap,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "profile-bean-row__image",
      children: bean.imageUrl ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Image, {
        src: bean.imageUrl,
        mode: "aspectFill",
        className: "profile-bean-row__img",
        lazyLoad: true
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "profile-bean-row__placeholder",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_6__["default"], {
          name: "coffee",
          size: 28,
          color: "rgba(139,90,43,0.2)"
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "profile-bean-row__info",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "profile-bean-row__name",
        children: bean.name
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "profile-bean-row__meta",
        children: [bean.roasterName, bean.originCountry, bean.process].filter(Boolean).join(' · ')
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "profile-bean-row__side",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "profile-bean-row__price",
        children: ["\xA5", bean.price]
      }), onFavoriteToggle ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "profile-bean-row__action",
        onClick: function onClick(event) {
          event.stopPropagation();
          onFavoriteToggle();
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_6__["default"], {
          name: "heart-filled",
          size: 15,
          color: "#c85c3d"
        })
      }) : note ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "profile-bean-row__note",
        children: note
      }) : null]
    })]
  });
}
function EmptyPane(_ref2) {
  var icon = _ref2.icon,
    message = _ref2.message;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "profile__empty",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_6__["default"], {
      name: icon,
      size: 48,
      color: "rgba(139,90,43,0.2)"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
      className: "profile__empty-text",
      children: message
    })]
  });
}
function Profile() {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)('beans'),
    _useState2 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState, 2),
    activeTab = _useState2[0],
    setActiveTab = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(null),
    _useState4 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState3, 2),
    user = _useState4[0],
    setUser = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false),
    _useState6 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState5, 2),
    loggedIn = _useState6[0],
    setLoggedIn = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)((0,_utils_api_config__WEBPACK_IMPORTED_MODULE_10__.getApiBaseUrlState)()),
    _useState8 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState7, 2),
    apiState = _useState8[0],
    setApiState = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]),
    _useState0 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState9, 2),
    localBeanFavorites = _useState0[0],
    setLocalBeanFavorites = _useState0[1];
  var _useState1 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]),
    _useState10 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState1, 2),
    localRoasterFavorites = _useState10[0],
    setLocalRoasterFavorites = _useState10[1];
  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]),
    _useState12 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState11, 2),
    cloudFavorites = _useState12[0],
    setCloudFavorites = _useState12[1];
  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)([]),
    _useState14 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState13, 2),
    history = _useState14[0],
    setHistory = _useState14[1];
  var _useState15 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false),
    _useState16 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState15, 2),
    loginLoading = _useState16[0],
    setLoginLoading = _useState16[1];
  (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_5__.useDidShow)(function () {
    var authed = (0,_utils_auth__WEBPACK_IMPORTED_MODULE_9__.isLoggedIn)();
    setLoggedIn(authed);
    setUser(authed ? (0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getStoredUser)() : null);
    setApiState((0,_utils_api_config__WEBPACK_IMPORTED_MODULE_10__.getApiBaseUrlState)());
    setLocalBeanFavorites((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getBeanFavorites)());
    setLocalRoasterFavorites((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getRoasterFavorites)());
    setHistory((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getHistory)());
    if (authed) {
      void loadCloudFavorites();
    } else {
      setCloudFavorites([]);
    }
  });
  var loadCloudFavorites = /*#__PURE__*/function () {
    var _ref3 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee() {
      var favorites, _t;
      return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            _context.p = 0;
            _context.n = 1;
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_8__.getFavorites)();
          case 1:
            favorites = _context.v;
            setCloudFavorites(favorites);
            _context.n = 3;
            break;
          case 2:
            _context.p = 2;
            _t = _context.v;
          case 3:
            return _context.a(2);
        }
      }, _callee, null, [[0, 2]]);
    }));
    return function loadCloudFavorites() {
      return _ref3.apply(this, arguments);
    };
  }();
  var beanFavorites = (0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)(function () {
    if (!loggedIn) {
      return localBeanFavorites.map(function (bean) {
        return {
          bean: bean
        };
      });
    }
    return cloudFavorites.flatMap(function (favorite) {
      if (favorite.target_type !== 'bean' || !favorite.bean) return [];
      return [{
        favorite: favorite,
        bean: toBeanSnapshot(favorite.bean)
      }];
    });
  }, [cloudFavorites, localBeanFavorites, loggedIn]);
  var roasterFavorites = (0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)(function () {
    if (!loggedIn) {
      return localRoasterFavorites.map(function (roaster) {
        return {
          roaster: roaster
        };
      });
    }
    return cloudFavorites.flatMap(function (favorite) {
      if (favorite.target_type !== 'roaster' || !favorite.roaster) return [];
      return [{
        favorite: favorite,
        roaster: toRoasterSnapshot(favorite.roaster)
      }];
    });
  }, [cloudFavorites, localRoasterFavorites, loggedIn]);
  var handleLogin = /*#__PURE__*/function () {
    var _ref4 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee2() {
      var authUser, _t2;
      return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            setLoginLoading(true);
            _context2.p = 1;
            _context2.n = 2;
            return (0,_utils_auth__WEBPACK_IMPORTED_MODULE_9__.login)();
          case 2:
            authUser = _context2.v;
            setUser(authUser);
            setLoggedIn(true);
            _context2.n = 3;
            return loadCloudFavorites();
          case 3:
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: '登录成功',
              icon: 'success'
            });
            _context2.n = 5;
            break;
          case 4:
            _context2.p = 4;
            _t2 = _context2.v;
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: _t2 instanceof Error ? _t2.message : '登录失败',
              icon: 'none'
            });
          case 5:
            _context2.p = 5;
            setLoginLoading(false);
            return _context2.f(5);
          case 6:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 4, 5, 6]]);
    }));
    return function handleLogin() {
      return _ref4.apply(this, arguments);
    };
  }();
  var handleLogout = function handleLogout() {
    (0,_utils_auth__WEBPACK_IMPORTED_MODULE_9__.logout)();
    setLoggedIn(false);
    setUser(null);
    setCloudFavorites([]);
    setLocalBeanFavorites((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getBeanFavorites)());
    setLocalRoasterFavorites((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getRoasterFavorites)());
  };
  var handleUnfavoriteLocalBean = function handleUnfavoriteLocalBean(bean) {
    (0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.toggleBeanFavorite)(bean);
    setLocalBeanFavorites((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getBeanFavorites)());
  };
  var handleUnfavoriteLocalRoaster = function handleUnfavoriteLocalRoaster(roaster) {
    (0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.toggleRoasterFavorite)(roaster);
    setLocalRoasterFavorites((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.getRoasterFavorites)());
  };
  var handleUnfavoriteCloud = /*#__PURE__*/function () {
    var _ref5 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee3(favorite) {
      var _t3;
      return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            _context3.p = 0;
            _context3.n = 1;
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_8__.removeFavorite)(favorite.target_type, favorite.target_id);
          case 1:
            setCloudFavorites(function (prev) {
              return prev.filter(function (item) {
                return item.id !== favorite.id;
              });
            });
            _context3.n = 3;
            break;
          case 2:
            _context3.p = 2;
            _t3 = _context3.v;
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: '操作失败',
              icon: 'none'
            });
          case 3:
            return _context3.a(2);
        }
      }, _callee3, null, [[0, 2]]);
    }));
    return function handleUnfavoriteCloud(_x) {
      return _ref5.apply(this, arguments);
    };
  }();
  var totalSaved = beanFavorites.length + roasterFavorites.length;
  var summaryLabel = loggedIn ? '已同步至云端' : '本地收藏，登录后自动同步';
  var heroName = (user === null || user === void 0 ? void 0 : user.nickname) || (loggedIn ? '咖啡爱好者' : '你的咖啡私藏');
  var heroInitial = heroName.charAt(0).toUpperCase();
  var apiModeLabel = apiState.mode === 'cloud' ? '云端' : apiState.mode === 'local' ? '本地' : '未配置';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "profile",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "profile__hero",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "profile__hero-top",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "profile__identity",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__eyebrow",
            children: "Private Shelf"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__name",
            children: heroName
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__status",
            children: summaryLabel
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "profile__seal",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__seal-text",
            children: heroInitial
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "profile__hero-actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "profile__summary-pill",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__summary-pill-text",
            children: "\u5DF2\u6536\u85CF ".concat(totalSaved, " \u9879")
          })
        }), loggedIn ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "profile__logout",
          onClick: handleLogout,
          children: "\u9000\u51FA\u767B\u5F55"
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          className: "profile__login-btn",
          loading: loginLoading,
          onClick: handleLogin,
          children: "\u5FAE\u4FE1\u4E00\u952E\u767B\u5F55"
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "profile__stats",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "profile__stat",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__stat-num",
            children: beanFavorites.length
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__stat-label",
            children: "\u8C46\u6B3E\u6536\u85CF"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "profile__stat",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__stat-num",
            children: roasterFavorites.length
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__stat-label",
            children: "\u70D8\u7119\u5546"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "profile__stat",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__stat-num",
            children: history.length
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__stat-label",
            children: "\u6700\u8FD1\u6D4F\u89C8"
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "profile__debug-card",
      onClick: function onClick() {
        return _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().navigateTo({
          url: '/pages/debug/index'
        });
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "profile__debug-copy",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "profile__debug-title",
          children: "API \u8054\u8C03"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "profile__debug-desc",
          children: apiState.baseUrl || '点击配置云端联调地址'
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "profile__debug-pill profile__debug-pill--".concat(apiState.mode),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "profile__debug-pill-text",
          children: apiModeLabel
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "profile__tabs",
      children: [{
        key: 'beans',
        label: '豆款收藏'
      }, {
        key: 'roasters',
        label: '烘焙商收藏'
      }, {
        key: 'history',
        label: '最近浏览'
      }].map(function (tab) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "profile__tab ".concat(activeTab === tab.key ? 'profile__tab--active' : ''),
          onClick: function onClick() {
            return setActiveTab(tab.key);
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "profile__tab-text",
            children: tab.label
          })
        }, tab.key);
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "profile__list",
      children: [activeTab === 'beans' ? beanFavorites.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(EmptyPane, {
        icon: "heart",
        message: "\u5148\u6311\u51E0\u6B3E\u559C\u6B22\u7684\u8C46\u5B50\uFF0C\u79C1\u85CF\u5939\u4F1A\u6162\u6162\u6210\u5F62\u3002"
      }) : beanFavorites.map(function (item) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(BeanRow, {
          bean: item.bean,
          onFavoriteToggle: function onFavoriteToggle() {
            if (loggedIn && item.favorite) {
              void handleUnfavoriteCloud(item.favorite);
            } else {
              handleUnfavoriteLocalBean(item.bean);
            }
          }
        }, item.bean.id);
      }) : null, activeTab === 'roasters' ? roasterFavorites.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(EmptyPane, {
        icon: "heart",
        message: "\u628A\u559C\u6B22\u7684\u70D8\u7119\u54C1\u724C\u7559\u4E0B\u6765\uFF0C\u65E5\u540E\u4F1A\u66F4\u597D\u56DE\u770B\u3002"
      }) : roasterFavorites.map(function (item, index) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_RoasterCard__WEBPACK_IMPORTED_MODULE_7__["default"], {
          roaster: item.roaster,
          index: index,
          hideArrow: true,
          trailing: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
            className: "profile__fav-action",
            onClick: function onClick(event) {
              event.stopPropagation();
              if (loggedIn && item.favorite) {
                void handleUnfavoriteCloud(item.favorite);
              } else {
                handleUnfavoriteLocalRoaster(item.roaster);
              }
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_6__["default"], {
              name: "heart-filled",
              size: 15,
              color: "#c85c3d"
            })
          })
        }, item.roaster.id);
      }) : null, activeTab === 'history' ? history.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(EmptyPane, {
        icon: "coffee",
        message: "\u6700\u8FD1\u8FD8\u6CA1\u6709\u6D4F\u89C8\u8BB0\u5F55\uFF0C\u53BB\u7FFB\u7FFB\u65B0\u7684\u8C46\u5355\u5427\u3002"
      }) : history.map(function (item) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(BeanRow, {
          bean: item,
          note: formatHistoryTime(item.viewedAt)
        }, item.id);
      }) : null]
    })]
  });
}

/***/ }),

/***/ "./src/pages/profile/index.tsx":
/*!*************************************!*\
  !*** ./src/pages/profile/index.tsx ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx");


var config = {"navigationBarTitleText":"我的"};


var inst = Page((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/profile/index', {root:{cn:[]}}, config || {}))


/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/profile/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map