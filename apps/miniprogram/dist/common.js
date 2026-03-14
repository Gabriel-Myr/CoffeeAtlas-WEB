"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["common"],{

/***/ "./src/components/BeanCard/index.tsx":
/*!*******************************************!*\
  !*** ./src/components/BeanCard/index.tsx ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ BeanCard; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_formatters__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/formatters */ "./src/utils/formatters.ts");
/* harmony import */ var _Icon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Icon */ "./src/components/Icon/index.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);






function BeanCard(_ref) {
  var _bean$discountedPrice;
  var bean = _ref.bean,
    _ref$index = _ref.index,
    index = _ref$index === void 0 ? 0 : _ref$index;
  var salesLabel = (0,_utils_formatters__WEBPACK_IMPORTED_MODULE_2__.formatSalesCount)(bean.salesCount);
  var line1 = [bean.roasterName, bean.originCountry].filter(Boolean).join(' · ');
  var line2 = [bean.originRegion, bean.farm, bean.variety].filter(Boolean).join(' · ');
  var displayPrice = (_bean$discountedPrice = bean.discountedPrice) !== null && _bean$discountedPrice !== void 0 ? _bean$discountedPrice : bean.price;
  var handleTap = function handleTap() {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().navigateTo({
      url: "/pages/bean-detail/index?id=".concat(bean.id)
    });
  };
  var delayStyle = index < 5 ? {
    animationDelay: "".concat(index * 0.05, "s")
  } : {};
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
    className: "bean-card",
    style: delayStyle,
    hoverClass: "bean-card-active",
    hoverStartTime: 20,
    hoverStayTime: 70,
    onClick: handleTap,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
      className: "bean-card__image",
      children: [bean.imageUrl ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Image, {
        src: bean.imageUrl,
        mode: "aspectFill",
        lazyLoad: true,
        className: "bean-card__img"
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
        className: "bean-card__placeholder",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_Icon__WEBPACK_IMPORTED_MODULE_3__["default"], {
          name: "coffee",
          size: 64,
          color: "rgba(139,90,43,0.2)"
        })
      }), bean.isNewArrival && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
        className: "bean-card__badge",
        children: "\u65B0\u54C1"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
      className: "bean-card__body",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
        className: "bean-card__meta",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
          className: "bean-card__titles",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
            className: "bean-card__line1",
            children: line1
          }), line2 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
            className: "bean-card__line2",
            children: line2
          }) : null]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
          className: "bean-card__tags",
          children: [salesLabel && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
            className: "bean-card__tag bean-card__tag--sales",
            children: salesLabel
          }), displayPrice > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
            className: "bean-card__tag bean-card__tag--price",
            children: ["\xA5", displayPrice]
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
        className: "bean-card__footer",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
          className: "bean-card__label",
          children: "\u5904\u7406\u6CD5"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
          className: "bean-card__value",
          children: bean.process || '-'
        })]
      })]
    })]
  });
}

/***/ }),

/***/ "./src/components/EmptyState/index.tsx":
/*!*********************************************!*\
  !*** ./src/components/EmptyState/index.tsx ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ EmptyState; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _Icon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Icon */ "./src/components/Icon/index.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);




function EmptyState(_ref) {
  var _ref$message = _ref.message,
    message = _ref$message === void 0 ? '暂无数据' : _ref$message;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
    className: "empty-state",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_Icon__WEBPACK_IMPORTED_MODULE_1__["default"], {
      name: "coffee",
      size: 64,
      color: "rgba(139,90,43,0.25)",
      className: "empty-state__icon"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
      className: "empty-state__text",
      children: message
    })]
  });
}

/***/ }),

/***/ "./src/components/Icon/index.tsx":
/*!***************************************!*\
  !*** ./src/components/Icon/index.tsx ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Icon; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);


var ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  'chevron-up': '<polyline points="18 15 12 9 6 15"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  'heart-filled': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'
};
function Icon(_ref) {
  var name = _ref.name,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 24 : _ref$size,
    _ref$color = _ref.color,
    color = _ref$color === void 0 ? '#8b5a2b' : _ref$color,
    className = _ref.className;
  var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"".concat(color, "\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">").concat(ICON_PATHS[name], "</svg>");
  var src = "data:image/svg+xml,".concat(encodeURIComponent(svg));
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Image, {
    src: src,
    style: {
      width: "".concat(size, "px"),
      height: "".concat(size, "px"),
      display: 'block',
      flexShrink: 0
    },
    className: className
  });
}

/***/ }),

/***/ "./src/components/RoasterCard/index.tsx":
/*!**********************************************!*\
  !*** ./src/components/RoasterCard/index.tsx ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ RoasterCard; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);




function RoasterCard(_ref) {
  var _roaster$description;
  var roaster = _ref.roaster,
    _ref$index = _ref.index,
    index = _ref$index === void 0 ? 0 : _ref$index,
    trailing = _ref.trailing,
    _ref$hideArrow = _ref.hideArrow,
    hideArrow = _ref$hideArrow === void 0 ? false : _ref$hideArrow;
  var handleTap = function handleTap() {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().navigateTo({
      url: "/pages/roaster-detail/index?id=".concat(roaster.id)
    });
  };
  var delayStyle = index < 8 ? {
    animationDelay: "".concat(index * 0.05, "s")
  } : {};
  var description = (_roaster$description = roaster.description) === null || _roaster$description === void 0 ? void 0 : _roaster$description.trim();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
    className: "roaster-card",
    style: delayStyle,
    hoverClass: "roaster-card--active",
    hoverStartTime: 20,
    hoverStayTime: 70,
    onClick: handleTap,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
      className: "roaster-card__media",
      children: roaster.logoUrl ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Image, {
        src: roaster.logoUrl,
        mode: "aspectFit",
        lazyLoad: true,
        className: "roaster-card__logo"
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
        className: "roaster-card__seal",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
          className: "roaster-card__initial",
          children: roaster.name.charAt(0).toUpperCase()
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
      className: "roaster-card__body",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
        className: "roaster-card__eyebrow",
        children: "Brand Directory"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
        className: "roaster-card__name",
        children: roaster.name
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
        className: "roaster-card__meta",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
          className: "roaster-card__city",
          children: roaster.city || '城市待补充'
        }), roaster.beanCount != null ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
          className: "roaster-card__count",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
            className: "roaster-card__count-num",
            children: roaster.beanCount
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
            className: "roaster-card__count-label",
            children: "\u6B3E\u8C46\u5355"
          })]
        }) : null]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
        className: "roaster-card__desc ".concat(description ? '' : 'roaster-card__desc--muted'),
        children: description || '收录当季代表豆单与品牌信息。'
      })]
    }), trailing ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
      className: "roaster-card__trailing",
      children: trailing
    }) : null, !hideArrow ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Text, {
      className: "roaster-card__arrow",
      children: "\u2197"
    }) : null]
  });
}

/***/ }),

/***/ "./src/components/SearchBar/index.tsx":
/*!********************************************!*\
  !*** ./src/components/SearchBar/index.tsx ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ SearchBar; }
/* harmony export */ });
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@3.6.30_@swc+helpers@0.5.15_@tarojs+components@3.6.30_@tarojs+he_ylqvpfizk55ntz3dpgxvqjkpiy/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _Icon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Icon */ "./src/components/Icon/index.tsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);




function SearchBar(_ref) {
  var value = _ref.value,
    _ref$placeholder = _ref.placeholder,
    placeholder = _ref$placeholder === void 0 ? '搜索咖啡豆...' : _ref$placeholder,
    _onInput = _ref.onInput;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.View, {
    className: "search-bar",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_Icon__WEBPACK_IMPORTED_MODULE_1__["default"], {
      name: "search",
      size: 18,
      color: "rgba(139, 115, 85, 0.72)",
      className: "search-bar__icon"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_0__.Input, {
      className: "search-bar__input",
      value: value,
      placeholder: placeholder,
      placeholderClass: "search-bar__placeholder",
      onInput: function onInput(e) {
        return _onInput(e.detail.value);
      }
    })]
  });
}

/***/ }),

/***/ "./src/services/api.ts":
/*!*****************************!*\
  !*** ./src/services/api.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addFavorite: function() { return /* binding */ addFavorite; },
/* harmony export */   getApiBaseUrlState: function() { return /* reexport safe */ _utils_api_config__WEBPACK_IMPORTED_MODULE_5__.getApiBaseUrlState; },
/* harmony export */   getApiHealth: function() { return /* binding */ getApiHealth; },
/* harmony export */   getBeanById: function() { return /* binding */ getBeanById; },
/* harmony export */   getBeans: function() { return /* binding */ getBeans; },
/* harmony export */   getFavorites: function() { return /* binding */ getFavorites; },
/* harmony export */   getMe: function() { return /* binding */ getMe; },
/* harmony export */   getRoasterById: function() { return /* binding */ getRoasterById; },
/* harmony export */   getRoasters: function() { return /* binding */ getRoasters; },
/* harmony export */   removeFavorite: function() { return /* binding */ removeFavorite; },
/* harmony export */   syncFavorites: function() { return /* binding */ syncFavorites; },
/* harmony export */   wechatLogin: function() { return /* binding */ wechatLogin; }
/* harmony export */ });
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/objectSpread2.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_storage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/storage */ "./src/utils/storage.ts");
/* harmony import */ var _utils_api_config__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/api-config */ "./src/utils/api-config.ts");
/* provided dependency */ var URLSearchParams = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime")["URLSearchParams"];






var PLACEHOLDER_PATTERN = /YOUR_LAN_IP|your-domain\.com/i;
function getErrorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  return '请求失败，请稍后重试';
}

function request(_x, _x2) {
  return _request.apply(this, arguments);
} // 咖啡豆
function _request() {
  _request = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee(endpoint, options) {
    var apiState, baseUrl, token, headers, res, _error, body, data, _t;
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          apiState = (0,_utils_api_config__WEBPACK_IMPORTED_MODULE_5__.getApiBaseUrlState)();
          baseUrl = apiState.baseUrl;
          if (baseUrl) {
            _context.n = 1;
            break;
          }
          throw new Error('未配置 API 地址。可在“我的 > API 联调”里填写云端 HTTPS 域名。');
        case 1:
          if (!PLACEHOLDER_PATTERN.test(baseUrl)) {
            _context.n = 2;
            break;
          }
          throw new Error('当前 TARO_APP_API_URL 还是占位值，请改成真实地址。');
        case 2:
          token = (0,_utils_storage__WEBPACK_IMPORTED_MODULE_4__.getToken)();
          headers = {
            'Content-Type': 'application/json'
          };
          if (token) headers['Authorization'] = "Bearer ".concat(token);
          _context.p = 3;
          _context.n = 4;
          return _tarojs_taro__WEBPACK_IMPORTED_MODULE_3___default().request((0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
            url: "".concat(baseUrl).concat(endpoint),
            header: headers
          }, options));
        case 4:
          res = _context.v;
          if (!(res.statusCode >= 200 && res.statusCode < 300)) {
            _context.n = 6;
            break;
          }
          body = res.data;
          if (!body.ok) {
            _context.n = 5;
            break;
          }
          return _context.a(2, body.data);
        case 5:
          throw new Error(((_error = body.error) === null || _error === void 0 ? void 0 : _error.message) || '请求失败');
        case 6:
          data = res.data;
          throw new Error((data === null || data === void 0 ? void 0 : data.error) || "\u8BF7\u6C42\u5931\u8D25: ".concat(res.statusCode));
        case 7:
          _context.p = 7;
          _t = _context.v;
          throw new Error(getErrorMessage(_t));
        case 8:
          return _context.a(2);
      }
    }, _callee, null, [[3, 7]]);
  }));
  return _request.apply(this, arguments);
}
function getBeans(_x3) {
  return _getBeans.apply(this, arguments);
}
function _getBeans() {
  _getBeans = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee2(params) {
    var query, qs;
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          query = new URLSearchParams();
          if (params !== null && params !== void 0 && params.pageSize) query.set('pageSize', String(params.pageSize));
          if (params !== null && params !== void 0 && params.page) query.set('page', String(params.page));
          if (params !== null && params !== void 0 && params.q) query.set('q', params.q);
          if (params !== null && params !== void 0 && params.originCountry) query.set('originCountry', params.originCountry);
          if (params !== null && params !== void 0 && params.process) query.set('process', params.process);
          if (params !== null && params !== void 0 && params.roastLevel) query.set('roastLevel', params.roastLevel);
          qs = query.toString();
          return _context2.a(2, request("/api/v1/beans".concat(qs ? "?".concat(qs) : '')));
      }
    }, _callee2);
  }));
  return _getBeans.apply(this, arguments);
}
function getBeanById(_x4) {
  return _getBeanById.apply(this, arguments);
}

// 烘焙商
function _getBeanById() {
  _getBeanById = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee3(id) {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          return _context3.a(2, request("/api/v1/beans/".concat(id)));
      }
    }, _callee3);
  }));
  return _getBeanById.apply(this, arguments);
}
function getRoasters(_x5) {
  return _getRoasters.apply(this, arguments);
}
function _getRoasters() {
  _getRoasters = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee4(params) {
    var query, qs;
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          query = new URLSearchParams();
          if (params !== null && params !== void 0 && params.pageSize) query.set('pageSize', String(params.pageSize));
          if (params !== null && params !== void 0 && params.page) query.set('page', String(params.page));
          if (params !== null && params !== void 0 && params.q) query.set('q', params.q);
          if (params !== null && params !== void 0 && params.city) query.set('city', params.city);
          qs = query.toString();
          return _context4.a(2, request("/api/v1/roasters".concat(qs ? "?".concat(qs) : '')));
      }
    }, _callee4);
  }));
  return _getRoasters.apply(this, arguments);
}
function getRoasterById(_x6) {
  return _getRoasterById.apply(this, arguments);
}
function _getRoasterById() {
  _getRoasterById = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee5(id) {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          return _context5.a(2, request("/api/v1/roasters/".concat(id)));
      }
    }, _callee5);
  }));
  return _getRoasterById.apply(this, arguments);
}
function getApiHealth() {
  return _getApiHealth.apply(this, arguments);
}
function _getApiHealth() {
  _getApiHealth = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee6() {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          return _context6.a(2, request('/api/v1/health'));
      }
    }, _callee6);
  }));
  return _getApiHealth.apply(this, arguments);
}
function getMe() {
  return _getMe.apply(this, arguments);
}

// 认证
function _getMe() {
  _getMe = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee7() {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          return _context7.a(2, request('/api/v1/me'));
      }
    }, _callee7);
  }));
  return _getMe.apply(this, arguments);
}
function wechatLogin(_x7, _x8) {
  return _wechatLogin.apply(this, arguments);
}

// 收藏
function _wechatLogin() {
  _wechatLogin = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee8(code, userInfo) {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          return _context8.a(2, request('/api/v1/auth/wechat/login', {
            method: 'POST',
            data: (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
              code: code
            }, userInfo)
          }));
      }
    }, _callee8);
  }));
  return _wechatLogin.apply(this, arguments);
}
function getFavorites() {
  return _getFavorites.apply(this, arguments);
}
function _getFavorites() {
  _getFavorites = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee9() {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context9) {
      while (1) switch (_context9.n) {
        case 0:
          return _context9.a(2, request('/api/v1/me/favorites'));
      }
    }, _callee9);
  }));
  return _getFavorites.apply(this, arguments);
}
function addFavorite(_x9, _x0) {
  return _addFavorite.apply(this, arguments);
}
function _addFavorite() {
  _addFavorite = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee0(targetType, targetId) {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context0) {
      while (1) switch (_context0.n) {
        case 0:
          return _context0.a(2, request('/api/v1/me/favorites', {
            method: 'POST',
            data: {
              targetType: targetType,
              targetId: targetId
            }
          }));
      }
    }, _callee0);
  }));
  return _addFavorite.apply(this, arguments);
}
function removeFavorite(_x1, _x10) {
  return _removeFavorite.apply(this, arguments);
}
function _removeFavorite() {
  _removeFavorite = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee1(targetType, targetId) {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context1) {
      while (1) switch (_context1.n) {
        case 0:
          _context1.n = 1;
          return request("/api/v1/me/favorites/".concat(targetType, "/").concat(targetId), {
            method: 'DELETE'
          });
        case 1:
          return _context1.a(2);
      }
    }, _callee1);
  }));
  return _removeFavorite.apply(this, arguments);
}
function syncFavorites(_x11) {
  return _syncFavorites.apply(this, arguments);
}
function _syncFavorites() {
  _syncFavorites = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee10(items) {
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context10) {
      while (1) switch (_context10.n) {
        case 0:
          return _context10.a(2, request('/api/v1/me/favorites/sync', {
            method: 'POST',
            data: {
              items: items
            }
          }));
      }
    }, _callee10);
  }));
  return _syncFavorites.apply(this, arguments);
}

/***/ }),

/***/ "./src/utils/api-config.ts":
/*!*********************************!*\
  !*** ./src/utils/api-config.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearApiBaseUrlOverride: function() { return /* binding */ clearApiBaseUrlOverride; },
/* harmony export */   getApiBaseUrlState: function() { return /* binding */ getApiBaseUrlState; },
/* harmony export */   setApiBaseUrlOverride: function() { return /* binding */ setApiBaseUrlOverride; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);

var API_BASE_URL_OVERRIDE_KEY = 'api_base_url_override';
function normalizeBaseUrl(url) {
  return (url !== null && url !== void 0 ? url : '').trim().replace(/\/+$/, '').replace(/\/api$/, '');
}
function getHostname(url) {
  return url.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
}
function isPrivateIpv4(hostname) {
  return /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}
function getMode(baseUrl) {
  if (!baseUrl) return 'unset';
  var hostname = getHostname(baseUrl);
  if (/^http:\/\//i.test(baseUrl) || hostname === 'localhost' || hostname.endsWith('.local') || isPrivateIpv4(hostname)) {
    return 'local';
  }
  return 'cloud';
}
function getWarning(baseUrl) {
  if (!baseUrl) {
    return '未配置 API 地址，可在这里填入云端 HTTPS 域名。';
  }
  var hostname = getHostname(baseUrl);
  if (hostname === 'localhost' || hostname.endsWith('.local') || isPrivateIpv4(hostname)) {
    return '当前仍是本地或局域网地址，切到云端联调时请改成 HTTPS 域名。';
  }
  if (/^http:\/\//i.test(baseUrl)) {
    return '微信云端联调建议使用 HTTPS 域名。';
  }
  return null;
}
function getApiBaseUrlState() {
  var runtimeBaseUrl = normalizeBaseUrl(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(API_BASE_URL_OVERRIDE_KEY));
  var buildBaseUrl = normalizeBaseUrl("http://100.99.64.161:3000");
  var baseUrl = runtimeBaseUrl || buildBaseUrl;
  return {
    baseUrl: baseUrl,
    source: runtimeBaseUrl ? 'runtime' : 'build',
    mode: getMode(baseUrl),
    warning: getWarning(baseUrl)
  };
}
function setApiBaseUrlOverride(url) {
  var normalized = normalizeBaseUrl(url);
  if (!normalized) {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().removeStorageSync(API_BASE_URL_OVERRIDE_KEY);
  } else {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(API_BASE_URL_OVERRIDE_KEY, normalized);
  }
  return getApiBaseUrlState();
}
function clearApiBaseUrlOverride() {
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().removeStorageSync(API_BASE_URL_OVERRIDE_KEY);
  return getApiBaseUrlState();
}

/***/ }),

/***/ "./src/utils/auth.ts":
/*!***************************!*\
  !*** ./src/utils/auth.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isLoggedIn: function() { return /* binding */ isLoggedIn; },
/* harmony export */   login: function() { return /* binding */ login; },
/* harmony export */   logout: function() { return /* binding */ logout; }
/* harmony export */ });
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _services_api__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/api */ "./src/services/api.ts");
/* harmony import */ var _storage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./storage */ "./src/utils/storage.ts");





function isLoggedIn() {
  return Boolean((0,_storage__WEBPACK_IMPORTED_MODULE_4__.getToken)());
}
function login(_x) {
  return _login.apply(this, arguments);
}
function _login() {
  _login = (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().m(function _callee(userInfo) {
    var _yield$Taro$login, code, _yield$wechatLogin, token, user, pending, _t;
    return (0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_0__["default"])().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.n = 1;
          return _tarojs_taro__WEBPACK_IMPORTED_MODULE_2___default().login();
        case 1:
          _yield$Taro$login = _context.v;
          code = _yield$Taro$login.code;
          _context.n = 2;
          return (0,_services_api__WEBPACK_IMPORTED_MODULE_3__.wechatLogin)(code, userInfo);
        case 2:
          _yield$wechatLogin = _context.v;
          token = _yield$wechatLogin.token;
          user = _yield$wechatLogin.user;
          (0,_storage__WEBPACK_IMPORTED_MODULE_4__.setToken)(token);
          (0,_storage__WEBPACK_IMPORTED_MODULE_4__.setStoredUser)(user);

          // 首次登录后同步本地收藏队列
          pending = (0,_storage__WEBPACK_IMPORTED_MODULE_4__.getPendingFavorites)();
          if (!(pending.length > 0)) {
            _context.n = 6;
            break;
          }
          _context.p = 3;
          _context.n = 4;
          return (0,_services_api__WEBPACK_IMPORTED_MODULE_3__.syncFavorites)(pending);
        case 4:
          (0,_storage__WEBPACK_IMPORTED_MODULE_4__.clearPendingFavorites)();
          _context.n = 6;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
        case 6:
          return _context.a(2, user);
      }
    }, _callee, null, [[3, 5]]);
  }));
  return _login.apply(this, arguments);
}
function logout() {
  (0,_storage__WEBPACK_IMPORTED_MODULE_4__.clearToken)();
  (0,_storage__WEBPACK_IMPORTED_MODULE_4__.clearStoredUser)();
}

/***/ }),

/***/ "./src/utils/formatters.ts":
/*!*********************************!*\
  !*** ./src/utils/formatters.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatSalesCount: function() { return /* binding */ formatSalesCount; }
/* harmony export */ });
function formatSalesCount(value) {
  if (value === null) return null;
  if (value >= 10000) {
    return "".concat((value / 10000).toFixed(value >= 100000 ? 0 : 1), "\u4E07");
  }
  if (value >= 1000) {
    return "".concat((value / 1000).toFixed(1), "K");
  }
  return String(value);
}

/***/ }),

/***/ "./src/utils/storage.ts":
/*!******************************!*\
  !*** ./src/utils/storage.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addToHistory: function() { return /* binding */ addToHistory; },
/* harmony export */   clearPendingFavorites: function() { return /* binding */ clearPendingFavorites; },
/* harmony export */   clearStoredUser: function() { return /* binding */ clearStoredUser; },
/* harmony export */   clearToken: function() { return /* binding */ clearToken; },
/* harmony export */   getBeanFavorites: function() { return /* binding */ getBeanFavorites; },
/* harmony export */   getHistory: function() { return /* binding */ getHistory; },
/* harmony export */   getPendingFavorites: function() { return /* binding */ getPendingFavorites; },
/* harmony export */   getRoasterFavorites: function() { return /* binding */ getRoasterFavorites; },
/* harmony export */   getStoredUser: function() { return /* binding */ getStoredUser; },
/* harmony export */   getToken: function() { return /* binding */ getToken; },
/* harmony export */   isBeanFavorite: function() { return /* binding */ isBeanFavorite; },
/* harmony export */   isRoasterFavorite: function() { return /* binding */ isRoasterFavorite; },
/* harmony export */   setStoredUser: function() { return /* binding */ setStoredUser; },
/* harmony export */   setToken: function() { return /* binding */ setToken; },
/* harmony export */   toggleBeanFavorite: function() { return /* binding */ toggleBeanFavorite; },
/* harmony export */   toggleRoasterFavorite: function() { return /* binding */ toggleRoasterFavorite; }
/* harmony export */ });
/* unused harmony exports getFavorites, isFavorite, toggleFavorite */
/* harmony import */ var _Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/objectSpread2.js */ "../../node_modules/.pnpm/@babel+runtime@7.28.6/node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);


var FAVORITES_KEY = 'coffee_favorites';
var ROASTER_FAVORITES_KEY = 'roaster_favorites';
var HISTORY_KEY = 'coffee_history';
var TOKEN_KEY = 'app_token';
var USER_KEY = 'auth_user';
var PENDING_FAVORITES_KEY = 'pending_favorites';
var MAX_HISTORY = 20;
// Token
function getToken() {
  return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getStorageSync(TOKEN_KEY) || null;
}
function setToken(token) {
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().setStorageSync(TOKEN_KEY, token);
}
function clearToken() {
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().removeStorageSync(TOKEN_KEY);
}
function getStoredUser() {
  return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getStorageSync(USER_KEY) || null;
}
function setStoredUser(user) {
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().setStorageSync(USER_KEY, user);
}
function clearStoredUser() {
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().removeStorageSync(USER_KEY);
}
function getStoredList(key) {
  return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getStorageSync(key) || [];
}
function setStoredList(key, value) {
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().setStorageSync(key, value);
}
function addPendingFavorite(targetType, targetId) {
  var pending = getPendingFavorites();
  if (!pending.some(function (item) {
    return item.targetType === targetType && item.targetId === targetId;
  })) {
    pending.push({
      targetType: targetType,
      targetId: targetId
    });
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().setStorageSync(PENDING_FAVORITES_KEY, pending);
  }
}
function removePendingFavorite(targetType, targetId) {
  var pending = getPendingFavorites().filter(function (item) {
    return !(item.targetType === targetType && item.targetId === targetId);
  });
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().setStorageSync(PENDING_FAVORITES_KEY, pending);
}

// 本地豆款收藏（未登录时使用）
function getBeanFavorites() {
  return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getStorageSync(FAVORITES_KEY) || [];
}
function isBeanFavorite(id) {
  return getBeanFavorites().some(function (favorite) {
    return favorite.id === id;
  });
}
function toggleBeanFavorite(bean) {
  var favorites = getBeanFavorites();
  var index = favorites.findIndex(function (favorite) {
    return favorite.id === bean.id;
  });
  if (index >= 0) {
    favorites.splice(index, 1);
    setStoredList(FAVORITES_KEY, favorites);
    removePendingFavorite('bean', bean.id);
    return false;
  }
  favorites.unshift(bean);
  setStoredList(FAVORITES_KEY, favorites);
  addPendingFavorite('bean', bean.id);
  return true;
}
function getRoasterFavorites() {
  return getStoredList(ROASTER_FAVORITES_KEY);
}
function isRoasterFavorite(id) {
  return getRoasterFavorites().some(function (favorite) {
    return favorite.id === id;
  });
}
function toggleRoasterFavorite(roaster) {
  var favorites = getRoasterFavorites();
  var index = favorites.findIndex(function (favorite) {
    return favorite.id === roaster.id;
  });
  if (index >= 0) {
    favorites.splice(index, 1);
    setStoredList(ROASTER_FAVORITES_KEY, favorites);
    removePendingFavorite('roaster', roaster.id);
    return false;
  }
  favorites.unshift(roaster);
  setStoredList(ROASTER_FAVORITES_KEY, favorites);
  addPendingFavorite('roaster', roaster.id);
  return true;
}
function getFavorites() {
  return getBeanFavorites();
}
function isFavorite(id) {
  return isBeanFavorite(id);
}
function toggleFavorite(bean) {
  return toggleBeanFavorite(bean);
}

// 待同步收藏队列（登录后合并到云端）

function getPendingFavorites() {
  return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getStorageSync(PENDING_FAVORITES_KEY) || [];
}
function clearPendingFavorites() {
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().removeStorageSync(PENDING_FAVORITES_KEY);
}

// 浏览历史

function getHistory() {
  return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getStorageSync(HISTORY_KEY) || [];
}
function addToHistory(bean) {
  var history = getHistory().filter(function (h) {
    return h.id !== bean.id;
  });
  history.unshift((0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_Users_gabi_CoffeeAtlas_Web_node_modules_pnpm_babel_runtime_7_28_6_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_0__["default"])({}, bean), {}, {
    viewedAt: Date.now()
  }));
  _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().setStorageSync(HISTORY_KEY, history.slice(0, MAX_HISTORY));
}

/***/ })

}]);
//# sourceMappingURL=common.js.map