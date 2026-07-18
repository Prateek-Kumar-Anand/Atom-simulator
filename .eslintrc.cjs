module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "detect" } },
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // react-three-fiber renders Three.js objects as JSX intrinsics (mesh,
    // sphereGeometry, meshStandardMaterial, ...) whose props aren't DOM
    // attributes; this rule doesn't know about them, so the common r3f
    // properties are explicitly allow-listed rather than disabling the
    // check (and its useful DOM-typo detection) entirely.
    "react/no-unknown-property": ["error", {
      ignore: [
        "args", "position", "rotation", "scale", "geometry", "material",
        "intensity", "distance", "emissive", "emissiveIntensity",
        "roughness", "metalness", "transparent", "opacity", "color",
        "dpr", "camera", "side", "attach", "count", "array", "itemSize",
        "linewidth", "wireframe",
      ],
    }],
  },
};
