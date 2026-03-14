"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/roaster-detail/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roaster-detail/index!./src/pages/roaster-detail/index.tsx":
/*!**********************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roaster-detail/index!./src/pages/roaster-detail/index.tsx ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ RoasterDetailPage; }
/* harmony export */ });
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_BeanCard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../components/BeanCard */ "./src/components/BeanCard/index.tsx");
/* harmony import */ var _components_EmptyState__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../components/EmptyState */ "./src/components/EmptyState/index.tsx");
/* harmony import */ var _components_Icon__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../components/Icon */ "./src/components/Icon/index.tsx");
/* harmony import */ var _services_api__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../services/api */ "./src/services/api.ts");
/* harmony import */ var _utils_auth__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/auth */ "./src/utils/auth.ts");
/* harmony import */ var _utils_storage__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../utils/storage */ "./src/utils/storage.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);














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
function formatLinkLabel(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
function RoasterDetailPage() {
  var _router$params$id, _roaster$description;
  var router = (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_5__.useRouter)();
  var id = (_router$params$id = router.params.id) !== null && _router$params$id !== void 0 ? _router$params$id : '';
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(null),
    _useState2 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState, 2),
    roaster = _useState2[0],
    setRoaster = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(true),
    _useState4 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(''),
    _useState6 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState5, 2),
    error = _useState6[0],
    setError = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false),
    _useState8 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState7, 2),
    favorited = _useState8[0],
    setFavorited = _useState8[1];
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(function () {
    if (!id) return;
    (0,_services_api__WEBPACK_IMPORTED_MODULE_9__.getRoasterById)(id).then(/*#__PURE__*/function () {
      var _ref = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee(data) {
        var favorites;
        return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              setRoaster(data);
              _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().setNavigationBarTitle({
                title: data.name
              });
              if (!(0,_utils_auth__WEBPACK_IMPORTED_MODULE_10__.isLoggedIn)()) {
                _context.n = 2;
                break;
              }
              _context.n = 1;
              return (0,_services_api__WEBPACK_IMPORTED_MODULE_9__.getFavorites)().catch(function () {
                return [];
              });
            case 1:
              favorites = _context.v;
              setFavorited(favorites.some(function (favorite) {
                return favorite.target_type === 'roaster' && favorite.target_id === data.id;
              }));
              _context.n = 3;
              break;
            case 2:
              setFavorited((0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.isRoasterFavorite)(data.id));
            case 3:
              return _context.a(2);
          }
        }, _callee);
      }));
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }()).catch(function (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }).finally(function () {
      return setLoading(false);
    });
  }, [id]);
  var handleFavorite = /*#__PURE__*/function () {
    var _ref2 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee2() {
      var added, _t;
      return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (roaster) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            if (!(0,_utils_auth__WEBPACK_IMPORTED_MODULE_10__.isLoggedIn)()) {
              _context2.n = 9;
              break;
            }
            _context2.p = 2;
            if (!favorited) {
              _context2.n = 4;
              break;
            }
            _context2.n = 3;
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_9__.removeFavorite)('roaster', roaster.id);
          case 3:
            setFavorited(false);
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: '已取消收藏',
              icon: 'none',
              duration: 1500
            });
            _context2.n = 6;
            break;
          case 4:
            _context2.n = 5;
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_9__.addFavorite)('roaster', roaster.id);
          case 5:
            setFavorited(true);
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: '已收藏烘焙商',
              icon: 'none',
              duration: 1500
            });
          case 6:
            _context2.n = 8;
            break;
          case 7:
            _context2.p = 7;
            _t = _context2.v;
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: '操作失败',
              icon: 'none'
            });
          case 8:
            return _context2.a(2);
          case 9:
            added = (0,_utils_storage__WEBPACK_IMPORTED_MODULE_11__.toggleRoasterFavorite)(toRoasterSnapshot(roaster));
            setFavorited(added);
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: added ? '已收藏烘焙商' : '已取消收藏',
              icon: 'none',
              duration: 1500
            });
          case 10:
            return _context2.a(2);
        }
      }, _callee2, null, [[2, 7]]);
    }));
    return function handleFavorite() {
      return _ref2.apply(this, arguments);
    };
  }();
  var handleCopy = function handleCopy(label, value) {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().setClipboardData({
      data: value,
      success: function success() {
        _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
          title: "".concat(label, "\u5DF2\u590D\u5236"),
          icon: 'none'
        });
      }
    });
  };
  if (loading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "roaster-detail",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_7__["default"], {
        message: "\u6B63\u5728\u5C55\u5F00\u54C1\u724C\u9875..."
      })
    });
  }
  if (error || !roaster) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "roaster-detail",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_7__["default"], {
        message: error || '烘焙商不存在'
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "roaster-detail",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "roaster-detail__hero",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "roaster-detail__eyebrow",
        children: "Brand Portrait"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "roaster-detail__hero-main",
        children: [roaster.logoUrl ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Image, {
          src: roaster.logoUrl,
          mode: "aspectFit",
          className: "roaster-detail__logo"
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "roaster-detail__seal",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "roaster-detail__initial",
            children: roaster.name.charAt(0).toUpperCase()
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "roaster-detail__title-wrap",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "roaster-detail__name",
            children: roaster.name
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
            className: "roaster-detail__meta",
            children: [roaster.city ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
              className: "roaster-detail__city",
              children: roaster.city
            }) : null, roaster.beanCount != null ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
              className: "roaster-detail__meta-pill",
              children: [roaster.beanCount, " \u6B3E\u5728\u552E\u8C46\u5355"]
            }) : null]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "roaster-detail__favorite",
          onClick: handleFavorite,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_8__["default"], {
            name: favorited ? 'heart-filled' : 'heart',
            size: 20,
            color: favorited ? '#c85c3d' : '#8b5a2b'
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "roaster-detail__intro",
        children: ((_roaster$description = roaster.description) === null || _roaster$description === void 0 ? void 0 : _roaster$description.trim()) || '一份简洁的品牌索引，呈现这家烘焙商当前收录的风味线索。'
      }), roaster.websiteUrl || roaster.instagramHandle ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "roaster-detail__links",
        children: [roaster.websiteUrl ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "roaster-detail__link-chip",
          onClick: function onClick() {
            return handleCopy('官网链接', roaster.websiteUrl);
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_8__["default"], {
            name: "globe",
            size: 15,
            color: "#8B7355"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "roaster-detail__link-text",
            children: formatLinkLabel(roaster.websiteUrl)
          })]
        }) : null, roaster.instagramHandle ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "roaster-detail__link-chip",
          onClick: function onClick() {
            return handleCopy('Instagram 账号', "@".concat(roaster.instagramHandle));
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "roaster-detail__link-prefix",
            children: "@"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
            className: "roaster-detail__link-text",
            children: roaster.instagramHandle
          })]
        }) : null]
      }) : null]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "roaster-detail__section-head",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "roaster-detail__section-title",
        children: "\u5728\u552E\u76EE\u5F55"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "roaster-detail__section-sub",
        children: "Seasonal Selection"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "roaster-detail__beans",
      children: roaster.beans && roaster.beans.length > 0 ? roaster.beans.map(function (bean, index) {
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_BeanCard__WEBPACK_IMPORTED_MODULE_6__["default"], {
          bean: bean,
          index: index
        }, bean.id);
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__.jsx)(_components_EmptyState__WEBPACK_IMPORTED_MODULE_7__["default"], {
        message: "\u8FD9\u5BB6\u70D8\u7119\u5546\u6682\u672A\u4E0A\u67B6\u8C46\u6B3E"
      })
    })]
  });
}

/***/ }),

/***/ "./src/pages/roaster-detail/index.tsx":
/*!********************************************!*\
  !*** ./src/pages/roaster-detail/index.tsx ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_roaster_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roaster-detail/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/roaster-detail/index!./src/pages/roaster-detail/index.tsx");


var config = {"navigationBarTitleText":"烘焙商详情"};


var inst = Page((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_roaster_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/roaster-detail/index', {root:{cn:[]}}, config || {}))


/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_roaster_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/roaster-detail/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map