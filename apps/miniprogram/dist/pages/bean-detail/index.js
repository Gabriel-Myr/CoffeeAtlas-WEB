"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/bean-detail/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/bean-detail/index!./src/pages/bean-detail/index.tsx":
/*!****************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/bean-detail/index!./src/pages/bean-detail/index.tsx ***!
  \****************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ BeanDetail; }
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
/* harmony import */ var _utils_formatters__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/formatters */ "./src/utils/formatters.ts");
/* harmony import */ var _utils_storage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/storage */ "./src/utils/storage.ts");
/* harmony import */ var _utils_auth__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/auth */ "./src/utils/auth.ts");
/* harmony import */ var _components_Icon__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../components/Icon */ "./src/components/Icon/index.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);













function BeanDetail() {
  var _bean$tastingNotes$le, _bean$tastingNotes, _bean$tastingNotes2;
  var router = (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_5__.useRouter)();
  var id = router.params.id;
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(null),
    _useState2 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState, 2),
    bean = _useState2[0],
    setBean = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(true),
    _useState4 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_3__.useState)(false),
    _useState6 = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState5, 2),
    favorited = _useState6[0],
    setFavorited = _useState6[1];
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(function () {
    if (!id) return;
    (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getBeanById)(id).then(/*#__PURE__*/function () {
      var _ref = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee(data) {
        var favs;
        return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              setBean(data);
              if (!(0,_utils_auth__WEBPACK_IMPORTED_MODULE_9__.isLoggedIn)()) {
                _context.n = 2;
                break;
              }
              _context.n = 1;
              return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.getFavorites)().catch(function () {
                return [];
              });
            case 1:
              favs = _context.v;
              setFavorited(favs.some(function (favorite) {
                return favorite.target_type === 'bean' && favorite.target_id === data.id;
              }));
              _context.n = 3;
              break;
            case 2:
              setFavorited((0,_utils_storage__WEBPACK_IMPORTED_MODULE_8__.isBeanFavorite)(data.id));
            case 3:
              (0,_utils_storage__WEBPACK_IMPORTED_MODULE_8__.addToHistory)({
                id: data.id,
                name: data.name,
                roasterName: data.roasterName,
                imageUrl: data.imageUrl,
                originCountry: data.originCountry,
                process: data.process,
                price: data.price
              });
            case 4:
              return _context.a(2);
          }
        }, _callee);
      }));
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }()).catch(function () {
      return _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
        title: '加载失败',
        icon: 'none'
      });
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
            if (bean) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            if (!(0,_utils_auth__WEBPACK_IMPORTED_MODULE_9__.isLoggedIn)()) {
              _context2.n = 9;
              break;
            }
            _context2.p = 2;
            if (!favorited) {
              _context2.n = 4;
              break;
            }
            _context2.n = 3;
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.removeFavorite)('bean', bean.id);
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
            return (0,_services_api__WEBPACK_IMPORTED_MODULE_6__.addFavorite)('bean', bean.id);
          case 5:
            setFavorited(true);
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: '已收藏',
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
            _context2.n = 10;
            break;
          case 9:
            added = (0,_utils_storage__WEBPACK_IMPORTED_MODULE_8__.toggleBeanFavorite)({
              id: bean.id,
              name: bean.name,
              roasterName: bean.roasterName,
              imageUrl: bean.imageUrl,
              originCountry: bean.originCountry,
              process: bean.process,
              price: bean.price
            });
            setFavorited(added);
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_5___default().showToast({
              title: added ? '已收藏' : '已取消收藏',
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
  if (loading) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "bean-detail bean-detail--loading",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "bean-detail__loading-text",
        children: "\u52A0\u8F7D\u4E2D..."
      })
    });
  }
  if (!bean) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "bean-detail bean-detail--loading",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "bean-detail__loading-text",
        children: "\u672A\u627E\u5230\u8BE5\u5496\u5561\u8C46"
      })
    });
  }
  var salesLabel = (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_7__.formatSalesCount)(bean.salesCount);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
    className: "bean-detail",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "bean-detail__image-wrap",
      children: [bean.imageUrl ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Image, {
        src: bean.imageUrl,
        mode: "aspectFill",
        className: "bean-detail__image"
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__image-placeholder",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_10__["default"], {
          name: "coffee",
          size: 80,
          color: "rgba(139,90,43,0.25)"
        })
      }), bean.isNewArrival && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__badge",
        children: "\u65B0\u54C1"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__actions",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "bean-detail__action-btn",
          onClick: handleFavorite,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_components_Icon__WEBPACK_IMPORTED_MODULE_10__["default"], {
            name: favorited ? 'heart-filled' : 'heart',
            size: 20,
            color: favorited ? '#c85c3d' : '#8b5a2b'
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
      className: "bean-detail__body",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__roaster",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "bean-detail__roaster-name",
          children: bean.roasterName
        }), bean.city && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "bean-detail__city",
          children: bean.city
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
        className: "bean-detail__name",
        children: bean.name
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__price-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "bean-detail__price",
          children: ["\xA5", bean.price]
        }), salesLabel && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "bean-detail__sales",
          children: [salesLabel, " \u5DF2\u552E"]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__divider"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__info-grid",
        children: [{
          label: '产地',
          value: [bean.originCountry, bean.originRegion].filter(Boolean).join(' · ')
        }, {
          label: '处理法',
          value: bean.process
        }, {
          label: '烘焙度',
          value: bean.roastLevel
        }, {
          label: '品种',
          value: bean.variety
        }, {
          label: '庄园',
          value: bean.farm
        }].filter(function (item) {
          return item.value;
        }).map(function (item) {
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
            className: "bean-detail__info-item",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
              className: "bean-detail__info-label",
              children: item.label
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
              className: "bean-detail__info-value",
              children: item.value
            })]
          }, item.label);
        })
      }), ((_bean$tastingNotes$le = (_bean$tastingNotes = bean.tastingNotes) === null || _bean$tastingNotes === void 0 ? void 0 : _bean$tastingNotes.length) !== null && _bean$tastingNotes$le !== void 0 ? _bean$tastingNotes$le : 0) > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
        className: "bean-detail__notes",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
          className: "bean-detail__notes-title",
          children: "\u98CE\u5473\u63CF\u8FF0"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.View, {
          className: "bean-detail__notes-tags",
          children: (_bean$tastingNotes2 = bean.tastingNotes) === null || _bean$tastingNotes2 === void 0 ? void 0 : _bean$tastingNotes2.map(function (note) {
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_4__.Text, {
              className: "bean-detail__note-tag",
              children: note
            }, note);
          })
        })]
      })]
    })]
  });
}

/***/ }),

/***/ "./src/pages/bean-detail/index.tsx":
/*!*****************************************!*\
  !*** ./src/pages/bean-detail/index.tsx ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_bean_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/bean-detail/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@3.6.30_@swc+helpers@0.5.15_@tarojs+runtime@3.6.30_@tarojs+shared@3.6.30___zvk4cn4bol7pc6swockffza6ja/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/bean-detail/index!./src/pages/bean-detail/index.tsx");


var config = {"navigationBarTitleText":"咖啡豆详情"};


var inst = Page((0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_bean_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/bean-detail/index', {root:{cn:[]}}, config || {}))


/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_3_6_30_swc_helpers_0_5_15_tarojs_runtime_3_6_30_tarojs_shared_3_6_30_zvk4cn4bol7pc6swockffza6ja_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_bean_detail_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/bean-detail/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map