const TARO_RUNTIME_FEATURE_FLAGS = [
  'ENABLE_ADJACENT_HTML',
  'ENABLE_CLONE_NODE',
  'ENABLE_CONTAINS',
  'ENABLE_INNER_HTML',
  'ENABLE_MUTATION_OBSERVER',
  'ENABLE_SIZE_APIS',
  'ENABLE_TEMPLATE_CONTENT',
];

const PREBUNDLE_WRAPPER_REWRITES = [
  {
    match: /var m = require\('\.\/react\.core\.js'\);\s*module\.exports = m\.default;\s*exports\.default = module\.exports;\s*/g,
    replacement: "var m = require('./react.core.js');\nmodule.exports = m.default || m;\nexports.default = module.exports;\n",
  },
  {
    match: /var m = require\('\.\/react_jsx-runtime\.core\.js'\);\s*module\.exports = m\.default;\s*exports\.default = module\.exports;\s*/g,
    replacement: "var m = require('./react_jsx-runtime.core.js');\nmodule.exports = m.default || m;\nexports.default = module.exports;\n",
  },
  {
    match: /var m = require\('\.\/@tarojs_taro\.core\.js'\);\s*module\.exports = m\.default;\s*exports\.default = module\.exports;\s*/g,
    replacement: "var m = require('./@tarojs_taro.core.js');\nmodule.exports = m.default || m;\nexports.default = module.exports;\n",
  },
];

export function injectTaroRuntimeFeatureFlags(source) {
  if (typeof source !== 'string' || source.length === 0) {
    return source;
  }

  const missingFlags = TARO_RUNTIME_FEATURE_FLAGS.filter((flag) => {
    if (!source.includes(flag)) return false;
    return !new RegExp(`\\b(?:const|let|var)\\s+${flag}\\b`).test(source);
  });

  if (missingFlags.length === 0) {
    return source;
  }

  const banner = `${missingFlags.map((flag) => `const ${flag} = false;`).join('\n')}\n`;
  return `${banner}${source}`;
}

export function patchWeappPrebundleSource(source) {
  let next = injectTaroRuntimeFeatureFlags(source);

  for (const { match, replacement } of PREBUNDLE_WRAPPER_REWRITES) {
    next = next.replace(match, replacement);
  }

  return next;
}
