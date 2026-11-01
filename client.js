window.__ModuleLoader__.load({id:"dsh-doc-converter",factory(require){
const __dshReact=require('react');const module={exports:{}};const exports=module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/entry.tsx
var entry_exports = {};
__export(entry_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(entry_exports);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/createReactComponent.mjs
var import_react = require("react");

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/defaultAttributes.mjs
var defaultAttributes = {
  outline: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
  filled: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    stroke: "none"
  }
};

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/createReactComponent.mjs
var createReactComponent = (type, iconName, iconNamePascal, iconNode) => {
  const Component = (0, import_react.forwardRef)(
    ({ color = "currentColor", size = 24, stroke = 2, title, className, children, ...rest }, ref) => (0, import_react.createElement)(
      "svg",
      {
        ref,
        ...defaultAttributes[type],
        width: size,
        height: size,
        className: [`tabler-icon`, `tabler-icon-${iconName}`, className].filter(Boolean).join(" "),
        ...type === "filled" ? {
          fill: color
        } : {
          strokeWidth: stroke,
          stroke: color
        },
        ...rest
      },
      [
        title && (0, import_react.createElement)("title", { key: "svg-title" }, title),
        ...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    )
  );
  Component.displayName = `${iconNamePascal}`;
  return Component;
};

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconAdjustments.mjs
var __iconNode = [["path", { "d": "M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0", "key": "svg-0" }], ["path", { "d": "M6 4v4", "key": "svg-1" }], ["path", { "d": "M6 12v8", "key": "svg-2" }], ["path", { "d": "M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0", "key": "svg-3" }], ["path", { "d": "M12 4v10", "key": "svg-4" }], ["path", { "d": "M12 18v2", "key": "svg-5" }], ["path", { "d": "M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0", "key": "svg-6" }], ["path", { "d": "M18 4v1", "key": "svg-7" }], ["path", { "d": "M18 9v11", "key": "svg-8" }]];
var IconAdjustments = createReactComponent("outline", "adjustments", "Adjustments", __iconNode);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconAlertCircle.mjs
var __iconNode2 = [["path", { "d": "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "key": "svg-0" }], ["path", { "d": "M12 8v4", "key": "svg-1" }], ["path", { "d": "M12 16h.01", "key": "svg-2" }]];
var IconAlertCircle = createReactComponent("outline", "alert-circle", "AlertCircle", __iconNode2);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconCheck.mjs
var __iconNode3 = [["path", { "d": "M5 12l5 5l10 -10", "key": "svg-0" }]];
var IconCheck = createReactComponent("outline", "check", "Check", __iconNode3);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconDownload.mjs
var __iconNode4 = [["path", { "d": "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2", "key": "svg-0" }], ["path", { "d": "M7 11l5 5l5 -5", "key": "svg-1" }], ["path", { "d": "M12 4l0 12", "key": "svg-2" }]];
var IconDownload = createReactComponent("outline", "download", "Download", __iconNode4);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconFileText.mjs
var __iconNode5 = [["path", { "d": "M14 3v4a1 1 0 0 0 1 1h4", "key": "svg-0" }], ["path", { "d": "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2", "key": "svg-1" }], ["path", { "d": "M9 9l1 0", "key": "svg-2" }], ["path", { "d": "M9 13l6 0", "key": "svg-3" }], ["path", { "d": "M9 17l6 0", "key": "svg-4" }]];
var IconFileText = createReactComponent("outline", "file-text", "FileText", __iconNode5);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconLoader2.mjs
var __iconNode6 = [["path", { "d": "M12 3a9 9 0 1 0 9 9", "key": "svg-0" }]];
var IconLoader2 = createReactComponent("outline", "loader-2", "Loader2", __iconNode6);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs
var __iconNode7 = [["path", { "d": "M7 4v16l13 -8l-13 -8", "key": "svg-0" }]];
var IconPlayerPlay = createReactComponent("outline", "player-play", "PlayerPlay", __iconNode7);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconPlus.mjs
var __iconNode8 = [["path", { "d": "M12 5l0 14", "key": "svg-0" }], ["path", { "d": "M5 12l14 0", "key": "svg-1" }]];
var IconPlus = createReactComponent("outline", "plus", "Plus", __iconNode8);

// node_modules/.pnpm/@tabler+icons-react@3.47.0_react@19.3.1/node_modules/@tabler/icons-react/dist/esm/icons/IconRefresh.mjs
var __iconNode9 = [["path", { "d": "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4", "key": "svg-0" }], ["path", { "d": "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4", "key": "svg-1" }]];
var IconRefresh = createReactComponent("outline", "refresh", "Refresh", __iconNode9);

// client/App.tsx
var import_react4 = require("react");

// client/api.ts
var ROOT = "/api/dsh-doc-converter";
var ApiError = class extends Error {
  constructor(message, code) {
    const missingPythonDependency = message.startsWith("\u6587\u6863\u8F6C\u6362\u5DE5\u4F5C\u8FDB\u7A0B\u5DF2\u9000\u51FA\u3002") && message.includes("Traceback (most recent call last):") && /\bModuleNotFoundError:\s*No module named\b/.test(message);
    super(missingPythonDependency ? "\u8F6C\u6362\u4F9D\u8D56\u5C1A\u672A\u51C6\u5907\u597D\uFF0C\u8BF7\u5148\u5B8C\u6210\u672C\u5B9E\u4F8B\u7684 Python \u73AF\u5883\u51C6\u5907\u540E\u91CD\u8BD5\u3002" : message);
    this.code = code;
    this.name = "ApiError";
  }
};
async function unwrap(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(`\u670D\u52A1\u8FD4\u56DE\u4E86\u65E0\u6CD5\u8BFB\u53D6\u7684\u54CD\u5E94\uFF08HTTP ${response.status}\uFF09\u3002`, "INVALID_RESPONSE");
  }
  if (payload && payload.ok === false) {
    throw new ApiError(payload.error?.message || "\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002", payload.error?.code || "REQUEST_FAILED");
  }
  if (!response.ok || !payload || payload.ok !== true) {
    throw new ApiError(`\u8BF7\u6C42\u672A\u5B8C\u6210\uFF08HTTP ${response.status}\uFF09\u3002`, "HTTP_ERROR");
  }
  return payload.result;
}
async function rpc(action, params = {}, signal) {
  return unwrap(await fetch(`${ROOT}/rpc`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ action, params }),
    cache: "no-store",
    signal
  }));
}
function listStylePacks(signal) {
  return rpc("list_styles", {}, signal);
}
function createStylePack(payload) {
  return rpc("create_style", payload);
}
function reviseStylePack(pack, payload) {
  return rpc("revise_style", { id: pack.id, base_version: pack.version, ...payload });
}
function deleteStylePack(pack) {
  return rpc("delete_style", { id: pack.id });
}
function getDependencies(signal) {
  return rpc("dependencies", {}, signal);
}
async function importFile(file, pack, signal) {
  const data = new FormData();
  data.append("file", file);
  data.append("style_pack_id", pack.id);
  data.append("style_pack_version", String(pack.version));
  return unwrap(await fetch(`${ROOT}/import`, {
    method: "POST",
    credentials: "same-origin",
    body: data,
    signal
  }));
}
function importPath(sourcePath, pack) {
  return rpc("import_file", {
    source_path: sourcePath,
    style_pack_id: pack.id,
    style_pack_version: pack.version
  });
}
function convertJob(jobId, pack) {
  return rpc("convert", { job_id: jobId, style_pack_id: pack.id, style_pack_version: pack.version });
}
function getJob(jobId, signal) {
  return rpc("get_job", { job_id: jobId }, signal);
}
function artifactUrl(jobId, name) {
  return `${ROOT}/artifact?${new URLSearchParams({ job_id: jobId, name }).toString()}`;
}

// client/i18n.tsx
var import_react2 = require("react");
var TEXT = {
  "\u6587\u6863\u8F6C\u6362": "Document conversion",
  "\u6587\u4EF6": "File",
  "\u9009\u62E9\u6587\u4EF6": "Choose file",
  "\u672A\u9009\u62E9\u6587\u4EF6": "No file selected",
  "\u652F\u6301 Markdown\u3001DOCX \u548C DOC\u3002": "Markdown, DOCX and DOC are supported.",
  "\u4F7F\u7528\u672C\u673A\u8DEF\u5F84": "Use a local path",
  "\u672C\u673A\u6587\u4EF6\u8DEF\u5F84": "Local file path",
  "\u8F6C\u6362\u6587\u4EF6\u6240\u5728 Host \u4E0A\u7684\u5B8C\u6574\u8DEF\u5F84": "Full path on the Host performing the conversion",
  "\u4F7F\u7528\u6587\u4EF6\u9009\u62E9": "Choose a file instead",
  "\u6837\u5F0F\u9884\u8BBE": "Style preset",
  "\u9009\u62E9\u6837\u5F0F\u9884\u8BBE": "Choose a style preset",
  "\u6B63\u5728\u8BFB\u53D6\u6837\u5F0F\u2026": "Loading styles\u2026",
  "\u5C1A\u65E0\u6837\u5F0F\u9884\u8BBE\u3002\u521B\u5EFA\u4E00\u4E2A\u9884\u8BBE\u540E\u5373\u53EF\u8F6C\u6362\u3002": "Create a style preset to start converting documents.",
  "\u521B\u5EFA\u9884\u8BBE": "Create preset",
  "\u9884\u8BBE\u540D\u79F0": "Preset name",
  "\u521B\u5EFA": "Create",
  "\u6B63\u5728\u521B\u5EFA\u2026": "Creating\u2026",
  "\u53D6\u6D88": "Cancel",
  "\u5C55\u5F00\u6837\u5F0F\u8BBE\u7F6E": "Edit styles",
  "\u6536\u8D77\u6837\u5F0F\u8BBE\u7F6E": "Collapse style settings",
  "\u6837\u5F0F\u89D2\u8272": "Style roles",
  "\u9875\u9762\u8BBE\u7F6E": "Page setup",
  "\u4FDD\u5B58\u6837\u5F0F\u65B0\u7248\u672C": "Save new style version",
  "\u5220\u9664\u6B64\u6837\u5F0F": "Delete this style",
  "\u5220\u9664\u6837\u5F0F": "Delete style",
  "\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\u3002": "This cannot be undone.",
  "\u6B63\u5728\u4FDD\u5B58\u2026": "Saving\u2026",
  "\u6837\u5F0F\u4FDD\u5B58\u5931\u8D25\u3002": "The style could not be saved.",
  "\u5DF2\u4FDD\u5B58": "Saved",
  "\u7248\u672C": "Version",
  "\u6837\u5F0F\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u8BF7\u5148\u4FDD\u5B58\u65B0\u7248\u672C\u3002": "Save the edited style as a new version before continuing.",
  "\u5F00\u59CB\u8F6C\u6362": "Start conversion",
  "\u6B63\u5728\u5BFC\u5165\u2026": "Importing\u2026",
  "\u6B63\u5728\u542F\u52A8\u2026": "Starting\u2026",
  "\u6B63\u5728\u6062\u590D\u4EFB\u52A1\u2026": "Restoring task\u2026",
  "\u6B63\u5728\u8F6C\u6362\u2026": "Converting\u2026",
  "\u5F85\u8F6C\u6362": "Ready",
  "\u8F6C\u6362\u5B8C\u6210": "Completed",
  "\u8F6C\u6362\u5931\u8D25": "Failed",
  "\u5F53\u524D\u4EFB\u52A1": "Current task",
  "\u4E0B\u8F7D DOCX": "Download DOCX",
  "\u5176\u4ED6\u4EA7\u7269": "Other files",
  "\u91CD\u8BD5": "Retry",
  "\u91CD\u8BD5\u72B6\u6001\u67E5\u8BE2": "Retry status check",
  "\u8F6C\u6362\u73AF\u5883": "Conversion environment",
  "\u5DF2\u627E\u5230": "Available",
  "\u672A\u627E\u5230": "Not found",
  "\u672A\u80FD\u8BFB\u53D6\u8F6C\u6362\u73AF\u5883\uFF0C\u8BF7\u91CD\u8BD5\u3002": "The conversion environment could not be checked. Please retry.",
  "\u5237\u65B0\u73AF\u5883": "Refresh environment",
  "\u5C1A\u672A\u627E\u5230 Pandoc\uFF0CMarkdown \u8F6C\u6362\u6682\u4E0D\u53EF\u7528\u3002": "Pandoc was not found. Markdown conversion is unavailable.",
  "DOC \u8F6C\u6362\u9700\u8981 Pandoc \u548C LibreOffice\u3002": "DOC conversion requires Pandoc and LibreOffice.",
  "\u4EC5\u652F\u6301 .md\u3001.markdown\u3001.docx \u548C .doc \u6587\u4EF6\u3002": "Choose an .md, .markdown, .docx or .doc file.",
  "\u8BF7\u9009\u62E9\u6587\u4EF6\u6216\u586B\u5199\u672C\u673A\u8DEF\u5F84\u3002": "Choose a file or enter a local path.",
  "\u8BF7\u9009\u62E9\u6837\u5F0F\u9884\u8BBE\u3002": "Choose a style preset.",
  "\u65E0\u6CD5\u8BFB\u53D6\u4EFB\u52A1\u72B6\u6001\uFF0C\u8BF7\u91CD\u8BD5\u3002": "The task status could not be loaded. Please retry.",
  "\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002": "The operation could not be completed. Please retry.",
  "\u672A\u80FD\u8BFB\u53D6\u6837\u5F0F\uFF0C\u8BF7\u91CD\u8BD5\u3002": "Styles could not be loaded. Please retry.",
  "\u5F53\u524D\u4EFB\u52A1\u5DF2\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\u5207\u6362\u9875\u9762\u540E\u53EF\u7EE7\u7EED\u67E5\u770B\u72B6\u6001\u3002": "This task runs in the background. Its status is restored when you return.",
  "\u6837\u5F0F\u89D2\u8272\u5206\u533A": "Style sections",
  "\u6837\u5F0F\u76EE\u5F55": "Style roles",
  "\u6587\u524D\u90E8\u5206": "Front matter",
  "\u6B63\u6587\u90E8\u5206": "Main text",
  "\u6587\u540E\u90E8\u5206": "Back matter",
  "\u6807\u9898\u4E0E\u5143\u6570\u636E": "Title and metadata",
  "\u6458\u8981": "Abstract",
  "\u5173\u952E\u8BCD": "Keywords",
  "\u6807\u9898\u5C42\u7EA7": "Headings",
  "\u6B63\u6587": "Body",
  "\u8868\u683C": "Tables",
  "\u56FE\u7247": "Images",
  "\u53C2\u8003\u6587\u732E\uFF08\u68C0\u6D4B\u5230\u201C\u53C2\u8003\u6587\u732E\u201D\u6807\u9898\u540E\u751F\u6548\uFF09": "References (after a references heading)",
  "\u6587\u6863\u6807\u9898": "Document title",
  "\u526F\u6807\u9898": "Subtitle",
  "\u5355\u4F4D/\u90E8\u95E8": "Organization / department",
  "\u4F5C\u8005": "Author",
  "\u65E5\u671F": "Date",
  "\u6458\u8981\u6807\u7B7E": "Abstract label",
  "\u6458\u8981\u5185\u5BB9": "Abstract text",
  "\u5173\u952E\u8BCD\u6807\u7B7E": "Keywords label",
  "\u5173\u952E\u8BCD\u5185\u5BB9": "Keywords text",
  "\u4E00\u7EA7\u6807\u9898": "Heading 1",
  "\u4E8C\u7EA7\u6807\u9898": "Heading 2",
  "\u4E09\u7EA7\u6807\u9898": "Heading 3",
  "\u56DB\u7EA7\u6807\u9898": "Heading 4",
  "\u4E94\u7EA7\u6807\u9898": "Heading 5",
  "\u516D\u7EA7\u6807\u9898": "Heading 6",
  "\u6BB5\u843D\u6B63\u6587": "Body paragraph",
  "\u8868\u683C\u6B63\u6587": "Table body",
  "\u8981\u70B9": "Emphasis",
  "\u8868\u683C\u6807\u9898": "Table caption",
  "\u5236\u8868\u4EBA": "Table credit",
  "\u884C\u6807\u9898": "Row heading",
  "\u5217\u6807\u9898": "Column heading",
  "\u56FE\u7247\u6807\u9898": "Figure caption",
  "\u5236\u56FE\u4EBA": "Figure credit",
  "\u56FE\u7247\u6837\u5F0F": "Image style",
  "\u53C2\u8003\u6587\u732E\u6807\u9898": "References heading",
  "\u53C2\u8003\u6587\u732E\u6761\u76EE": "Reference entry",
  "\u9875\u811A": "Footer",
  "\u4E2D\u6587\u5B57\u4F53": "Chinese font",
  "\u897F\u6587\u5B57\u4F53": "Western font",
  "\u5B57\u53F7": "Font size",
  "\u7C97\u4F53": "Bold",
  "\u659C\u4F53": "Italic",
  "\u5BF9\u9F50": "Alignment",
  "\u5DE6\u5BF9\u9F50": "Left",
  "\u5C45\u4E2D": "Center",
  "\u53F3\u5BF9\u9F50": "Right",
  "\u4E24\u7AEF\u5BF9\u9F50": "Justify",
  "\u6700\u5927\u5BBD\u5EA6\uFF08\u5398\u7C73\uFF09": "Maximum width (cm)",
  "\u6309\u6B63\u6587\u5BBD\u5EA6\u9002\u914D": "Fit the body width",
  "\u7559\u7A7A\u65F6\u6309\u6B63\u6587\u5BBD\u5EA6\u9002\u914D\uFF0C\u8F83\u5C0F\u56FE\u7247\u4E0D\u4F1A\u653E\u5927\u3002": "Leave empty to fit the body width. Smaller images are not enlarged.",
  "\u9996\u884C\u7F29\u8FDB": "First-line indent",
  "\u5DE6\u7F29\u8FDB": "Left indent",
  "\u53F3\u7F29\u8FDB": "Right indent",
  "\u6BB5\u524D\uFF08\u78C5\uFF09": "Space before (pt)",
  "\u6BB5\u540E\uFF08\u78C5\uFF09": "Space after (pt)",
  "\u5355\u4F4D": "Unit",
  "\u5B57\u7B26": "Characters",
  "\u78C5": "pt",
  "\u5398\u7C73": "cm",
  "\u884C\u8DDD": "Line spacing",
  "\u884C\u8DDD\u7C7B\u578B": "Line spacing rule",
  "\u884C\u8DDD\uFF08\u500D\u6570\uFF09": "Line spacing (multiple)",
  "\u884C\u8DDD\uFF08\u78C5\uFF09": "Line spacing (pt)",
  "\u6700\u5927\u503C": "Maximum",
  "\u6700\u5C0F\u503C": "Minimum",
  "\u56FA\u5B9A\u503C": "Exactly",
  "\u591A\u500D": "Multiple",
  "\u81EA\u5B9A\u4E49": "Custom",
  "\u521D\u53F7": "Initial",
  "\u5C0F\u521D": "Small initial",
  "\u4E00\u53F7": "No. 1",
  "\u5C0F\u4E00": "Small No. 1",
  "\u4E8C\u53F7": "No. 2",
  "\u5C0F\u4E8C": "Small No. 2",
  "\u4E09\u53F7": "No. 3",
  "\u5C0F\u4E09": "Small No. 3",
  "\u56DB\u53F7": "No. 4",
  "\u5C0F\u56DB": "Small No. 4",
  "\u4E94\u53F7": "No. 5",
  "\u5C0F\u4E94": "Small No. 5",
  "\u516D\u53F7": "No. 6",
  "\u5C0F\u516D": "Small No. 6",
  "\u4E03\u53F7": "No. 7",
  "\u516B\u53F7": "No. 8",
  "\u4E0A\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09": "Top margin (cm)",
  "\u4E0B\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09": "Bottom margin (cm)",
  "\u5DE6\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09": "Left margin (cm)",
  "\u53F3\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09": "Right margin (cm)",
  "\u9875\u9762\u5BBD\u5EA6\uFF08\u5398\u7C73\uFF09": "Page width (cm)",
  "\u9875\u9762\u9AD8\u5EA6\uFF08\u5398\u7C73\uFF09": "Page height (cm)"
};
var entries = Object.entries(TEXT);
var keys = new Map(entries.map(([source], index) => [source, `message${index}`]));
var dictionaries = {
  zh: Object.fromEntries(entries.map(([source], index) => [`message${index}`, source])),
  en: Object.fromEntries(entries.map(([, translated], index) => [`message${index}`, translated]))
};
var TextContext = (0, import_react2.createContext)((source) => source);
function createTextTranslator(translate) {
  const prefixes = entries.map(([source]) => source).sort((a, b) => b.length - a.length);
  const resolve = (source) => {
    const key = keys.get(source);
    if (key) return translate(key);
    for (const prefix of prefixes) {
      if (source.length > prefix.length && source.startsWith(prefix)) {
        const suffix = source.slice(prefix.length);
        const translatedPrefix = resolve(prefix);
        const translatedSuffix = resolve(suffix);
        if (translatedPrefix !== prefix || translatedSuffix !== suffix) return `${translatedPrefix} ${translatedSuffix}`;
      }
    }
    return source;
  };
  return resolve;
}
function I18nProvider({ source, children }) {
  const snapshot = (0, import_react2.useSyncExternalStore)(source.subscribe, source.getSnapshot, source.getSnapshot);
  const text = (0, import_react2.useMemo)(() => createTextTranslator(source.translate), [source, snapshot.active, snapshot.revision]);
  return /* @__PURE__ */ __dshReact.createElement(TextContext.Provider, { value: text }, children);
}
function useText() {
  return (0, import_react2.useContext)(TextContext);
}

// client/StyleEditor.tsx
var import_react3 = require("react");
var ROLE_LABELS = {
  "document-title": "\u6587\u6863\u6807\u9898",
  "document-subtitle": "\u526F\u6807\u9898",
  "organization-department": "\u5355\u4F4D/\u90E8\u95E8",
  author: "\u4F5C\u8005",
  date: "\u65E5\u671F",
  "abstract-label": "\u6458\u8981\u6807\u7B7E",
  "abstract-content": "\u6458\u8981\u5185\u5BB9",
  "keywords-label": "\u5173\u952E\u8BCD\u6807\u7B7E",
  "keywords-content": "\u5173\u952E\u8BCD\u5185\u5BB9",
  "heading-1": "\u4E00\u7EA7\u6807\u9898",
  "heading-2": "\u4E8C\u7EA7\u6807\u9898",
  "heading-3": "\u4E09\u7EA7\u6807\u9898",
  "heading-4": "\u56DB\u7EA7\u6807\u9898",
  "heading-5": "\u4E94\u7EA7\u6807\u9898",
  "heading-6": "\u516D\u7EA7\u6807\u9898",
  "body-paragraph": "\u6BB5\u843D\u6B63\u6587",
  "body-table": "\u8868\u683C\u6B63\u6587",
  point: "\u8981\u70B9",
  "table-caption": "\u8868\u683C\u6807\u9898",
  "table-credit": "\u5236\u8868\u4EBA",
  "table-row-header": "\u884C\u6807\u9898",
  "table-column-header": "\u5217\u6807\u9898",
  "figure-caption": "\u56FE\u7247\u6807\u9898",
  "figure-credit": "\u5236\u56FE\u4EBA",
  image: "\u56FE\u7247\u6837\u5F0F",
  "reference-heading": "\u53C2\u8003\u6587\u732E\u6807\u9898",
  "reference-entry": "\u53C2\u8003\u6587\u732E\u6761\u76EE",
  footer: "\u9875\u811A"
};
var ROLE_SECTIONS = [
  { key: "pre", label: "\u6587\u524D\u90E8\u5206" },
  { key: "body", label: "\u6B63\u6587\u90E8\u5206" },
  { key: "post", label: "\u6587\u540E\u90E8\u5206" }
];
var GROUPS = {
  pre: [
    { title: "\u6807\u9898\u4E0E\u5143\u6570\u636E", roles: ["document-title", "document-subtitle", "organization-department", "author", "date"] },
    { title: "\u6458\u8981", roles: ["abstract-label", "abstract-content"] },
    { title: "\u5173\u952E\u8BCD", roles: ["keywords-label", "keywords-content"] }
  ],
  body: [
    { title: "\u6807\u9898\u5C42\u7EA7", roles: ["heading-1", "heading-2", "heading-3", "heading-4", "heading-5", "heading-6"] },
    { title: "\u6B63\u6587", roles: ["body-paragraph", "point"] },
    { title: "\u8868\u683C", roles: ["table-caption", "table-credit", "table-row-header", "table-column-header", "body-table"] },
    { title: "\u56FE\u7247", roles: ["figure-caption", "figure-credit", "image"] }
  ],
  post: [
    { title: "\u53C2\u8003\u6587\u732E\uFF08\u68C0\u6D4B\u5230\u201C\u53C2\u8003\u6587\u732E\u201D\u6807\u9898\u540E\u751F\u6548\uFF09", roles: ["reference-heading", "reference-entry"] },
    { title: "\u9875\u811A", roles: ["footer"] }
  ]
};
var FONT_SIZE_PRESETS = [
  { label: "\u521D\u53F7", pt: 42 },
  { label: "\u5C0F\u521D", pt: 36 },
  { label: "\u4E00\u53F7", pt: 26 },
  { label: "\u5C0F\u4E00", pt: 24 },
  { label: "\u4E8C\u53F7", pt: 22 },
  { label: "\u5C0F\u4E8C", pt: 18 },
  { label: "\u4E09\u53F7", pt: 16 },
  { label: "\u5C0F\u4E09", pt: 15 },
  { label: "\u56DB\u53F7", pt: 14 },
  { label: "\u5C0F\u56DB", pt: 12 },
  { label: "\u4E94\u53F7", pt: 10.5 },
  { label: "\u5C0F\u4E94", pt: 9 },
  { label: "\u516D\u53F7", pt: 7.5 },
  { label: "\u5C0F\u516D", pt: 6.5 },
  { label: "\u4E03\u53F7", pt: 5.5 },
  { label: "\u516B\u53F7", pt: 5 }
];
var INDENT_UNITS = [
  { value: "character", label: "\u5B57\u7B26" },
  { value: "pt", label: "\u78C5" },
  { value: "cm", label: "\u5398\u7C73" }
];
var LINE_SPACING_RULES = [
  { value: "maximum", label: "\u6700\u5927\u503C" },
  { value: "minimum", label: "\u6700\u5C0F\u503C" },
  { value: "exact", label: "\u56FA\u5B9A\u503C" },
  { value: "multiple", label: "\u591A\u500D" }
];
var INDENT_KEYS = ["first_line_indent_pt", "left_indent_pt", "right_indent_pt"];
function StyleEditor({ disabled, onDelete, onSaved, onDirtyChange, pack, section = "roles" }) {
  const t = useText();
  const id = (0, import_react3.useId)();
  const [roles, setRoles] = (0, import_react3.useState)(() => editableRolesFor(pack));
  const [savedRoles, setSavedRoles] = (0, import_react3.useState)(() => editableRolesFor(pack));
  const [savedVersion, setSavedVersion] = (0, import_react3.useState)(null);
  const inspectorRef = (0, import_react3.useRef)(null);
  const reportedDirty = (0, import_react3.useRef)(void 0);
  const [saving, setSaving] = (0, import_react3.useState)(false);
  const [error, setError] = (0, import_react3.useState)(null);
  const [roleSection, setRoleSection] = (0, import_react3.useState)("pre");
  const [activeRole, setActiveRole] = (0, import_react3.useState)("document-title");
  const visibleGroups = GROUPS[roleSection];
  const visibleKeys = visibleGroups.flatMap((group) => group.roles);
  const selectedRole = visibleKeys.includes(activeRole) ? activeRole : visibleKeys[0] ?? "document-title";
  (0, import_react3.useEffect)(() => {
    const nextRoles = editableRolesFor(pack);
    setRoles(nextRoles);
    setSavedRoles(nextRoles);
    setError(null);
  }, [pack]);
  (0, import_react3.useEffect)(() => {
    if (inspectorRef.current) inspectorRef.current.scrollTop = 0;
  }, [selectedRole, section]);
  (0, import_react3.useEffect)(() => {
    if (savedVersion === null) return;
    const timer = window.setTimeout(() => setSavedVersion(null), 4e3);
    return () => window.clearTimeout(timer);
  }, [savedVersion]);
  const hasChanges = JSON.stringify(roles) !== JSON.stringify(savedRoles);
  (0, import_react3.useEffect)(() => {
    if (reportedDirty.current === hasChanges) return;
    reportedDirty.current = hasChanges;
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);
  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled || saving || !hasChanges) return;
    setSaving(true);
    setError(null);
    setSavedVersion(null);
    try {
      const saved = await reviseStylePack(pack, { name: pack.name, roles });
      const nextRoles = editableRolesFor(saved);
      setRoles(nextRoles);
      setSavedRoles(nextRoles);
      setSavedVersion(saved.version);
      onSaved(saved);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("\u6837\u5F0F\u4FDD\u5B58\u5931\u8D25\u3002"));
    } finally {
      setSaving(false);
    }
  }
  function selectSection(next) {
    setRoleSection(next);
    setActiveRole(next === "pre" ? "document-title" : next === "body" ? "body-paragraph" : "reference-heading");
  }
  const isDisabled = disabled || saving;
  return /* @__PURE__ */ __dshReact.createElement("form", { className: "style-editor", noValidate: true, onSubmit: handleSubmit }, section === "roles" ? /* @__PURE__ */ __dshReact.createElement(__dshReact.Fragment, null, /* @__PURE__ */ __dshReact.createElement("div", { className: "style-navigation" }, /* @__PURE__ */ __dshReact.createElement("div", { "aria-label": t("\u6837\u5F0F\u89D2\u8272\u5206\u533A"), className: "role-section-tabs", role: "tablist" }, ROLE_SECTIONS.map((item, index) => /* @__PURE__ */ __dshReact.createElement(
    "button",
    {
      "aria-controls": `${id}-roles`,
      "aria-selected": roleSection === item.key,
      className: "role-section-tab",
      id: `${id}-${item.key}`,
      key: item.key,
      onClick: () => selectSection(item.key),
      onKeyDown: (event) => {
        const nextIndex = event.key === "ArrowRight" ? (index + 1) % ROLE_SECTIONS.length : event.key === "ArrowLeft" ? (index + ROLE_SECTIONS.length - 1) % ROLE_SECTIONS.length : event.key === "Home" ? 0 : event.key === "End" ? ROLE_SECTIONS.length - 1 : -1;
        const next = ROLE_SECTIONS[nextIndex];
        if (!next) return;
        event.preventDefault();
        selectSection(next.key);
        event.currentTarget.parentElement?.querySelector(`#${CSS.escape(`${id}-${next.key}`)}`)?.focus();
      },
      role: "tab",
      tabIndex: roleSection === item.key ? 0 : -1,
      type: "button"
    },
    t(item.label)
  )))), /* @__PURE__ */ __dshReact.createElement("div", { "aria-labelledby": `${id}-${roleSection}`, className: "role-workspace", id: `${id}-roles`, role: "tabpanel" }, /* @__PURE__ */ __dshReact.createElement("nav", { "aria-label": t("\u6837\u5F0F\u76EE\u5F55"), className: "role-directory" }, visibleGroups.map((group) => /* @__PURE__ */ __dshReact.createElement("div", { key: group.title }, /* @__PURE__ */ __dshReact.createElement("p", null, t(group.title)), group.roles.map((key) => /* @__PURE__ */ __dshReact.createElement("button", { "aria-pressed": key === selectedRole, key, onClick: () => {
    setActiveRole(key);
    if (inspectorRef.current) inspectorRef.current.scrollTop = 0;
  }, type: "button" }, t(ROLE_LABELS[key] ?? key)))))), /* @__PURE__ */ __dshReact.createElement("div", { className: "role-inspector", ref: inspectorRef }, /* @__PURE__ */ __dshReact.createElement("h3", { className: "role-inspector-heading" }, t(ROLE_LABELS[selectedRole] ?? selectedRole)), visibleGroups.map((group) => /* @__PURE__ */ __dshReact.createElement("fieldset", { className: "style-group inspector-group", key: group.title }, /* @__PURE__ */ __dshReact.createElement("legend", null, t(group.title)), /* @__PURE__ */ __dshReact.createElement("div", { className: "role-grid" }, group.roles.map((roleKey) => /* @__PURE__ */ __dshReact.createElement("div", { hidden: roleKey !== selectedRole, key: roleKey }, /* @__PURE__ */ __dshReact.createElement(RoleEditor, { disabled: isDisabled, onChange: (field, value) => updateRole(setRoles, roleKey, field, value), roleKey, role: roles[roleKey] }))))))))) : null, section === "page" ? /* @__PURE__ */ __dshReact.createElement("fieldset", { className: "style-group page-settings" }, /* @__PURE__ */ __dshReact.createElement("legend", null, t("\u9875\u9762\u8BBE\u7F6E")), /* @__PURE__ */ __dshReact.createElement("div", { className: "style-grid" }, ["page_width_cm", "page_height_cm", "margin_top_cm", "margin_bottom_cm", "margin_left_cm", "margin_right_cm"].map((key) => /* @__PURE__ */ __dshReact.createElement("label", { key }, t(pageLabel(key)), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(pageLabel(key)), disabled: isDisabled, min: "0", onChange: (event) => updateRole(setRoles, "page", ["page", key], Number(event.target.value)), step: "0.1", type: "number", value: numberValue(roles.page?.page?.[key], 2.8) }))))) : null, /* @__PURE__ */ __dshReact.createElement("div", { className: "style-savebar" }, error ? /* @__PURE__ */ __dshReact.createElement("p", { className: "error-message", role: "alert" }, error) : null, /* @__PURE__ */ __dshReact.createElement("span", { className: "style-save-status", role: "status" }, !hasChanges && !error && savedVersion !== null ? `${t("\u5DF2\u4FDD\u5B58")} \xB7 ${t("\u7248\u672C")} ${savedVersion}` : ""), /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-button dc-button-danger", disabled: disabled || saving, onClick: onDelete, type: "button" }, t("\u5220\u9664\u6B64\u6837\u5F0F")), /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-button dc-button-primary", disabled: isDisabled || !hasChanges, type: "submit" }, t(saving ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u4FDD\u5B58\u6837\u5F0F\u65B0\u7248\u672C"))));
}
function RoleEditor({ disabled, onChange, roleKey, role }) {
  const t = useText();
  const label = ROLE_LABELS[roleKey] ?? roleKey;
  const font = role.font ?? {};
  const paragraph = role.paragraph ?? {};
  const image = role.image ?? {};
  const characterOnly = role.role_type === "character";
  const fontSize = numberValue(font.size_pt, 16);
  const lineSpacingRule = lineSpacingRuleValue(paragraph.line_spacing_rule);
  const lineSpacingValue = lineSpacingRule === "multiple" ? numberValue(paragraph.line_spacing_multiple, 1.5) : numberValue(paragraph.line_spacing_pt, 29);
  if (role.role_type === "image") {
    return /* @__PURE__ */ __dshReact.createElement("article", { className: "role-card" }, /* @__PURE__ */ __dshReact.createElement("div", { className: "style-grid" }, /* @__PURE__ */ __dshReact.createElement("label", null, t("\u5BF9\u9F50"), /* @__PURE__ */ __dshReact.createElement("select", { "aria-label": t(`${label}\u5BF9\u9F50`), disabled, onChange: (event) => onChange(["image", "alignment"], event.target.value), value: stringValue(image.alignment, "center") }, /* @__PURE__ */ __dshReact.createElement("option", { value: "left" }, t("\u5DE6\u5BF9\u9F50")), /* @__PURE__ */ __dshReact.createElement("option", { value: "center" }, t("\u5C45\u4E2D")), /* @__PURE__ */ __dshReact.createElement("option", { value: "right" }, t("\u53F3\u5BF9\u9F50")))), /* @__PURE__ */ __dshReact.createElement("label", null, t("\u6700\u5927\u5BBD\u5EA6\uFF08\u5398\u7C73\uFF09"), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(`${label}\u6700\u5927\u5BBD\u5EA6\uFF08\u5398\u7C73\uFF09`), disabled, min: "0.1", onChange: (event) => onChange(["image", "max_width_cm"], event.target.value === "" ? null : Number(event.target.value)), placeholder: t("\u6309\u6B63\u6587\u5BBD\u5EA6\u9002\u914D"), step: "0.1", type: "number", value: typeof image.max_width_cm === "number" ? image.max_width_cm : "" })), ["space_before_pt", "space_after_pt"].map((key) => /* @__PURE__ */ __dshReact.createElement("label", { key }, t(paragraphLabel("", key)), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(paragraphLabel(label, key)), disabled, min: "0", onChange: (event) => onChange(["image", key], Number(event.target.value)), step: "0.5", type: "number", value: numberValue(image[key], 0) })))), /* @__PURE__ */ __dshReact.createElement("p", { className: "field-help" }, t("\u7559\u7A7A\u65F6\u6309\u6B63\u6587\u5BBD\u5EA6\u9002\u914D\uFF0C\u8F83\u5C0F\u56FE\u7247\u4E0D\u4F1A\u653E\u5927\u3002")));
  }
  return /* @__PURE__ */ __dshReact.createElement("article", { className: "role-card" }, /* @__PURE__ */ __dshReact.createElement("div", { className: "style-grid" }, /* @__PURE__ */ __dshReact.createElement("label", null, t("\u4E2D\u6587\u5B57\u4F53"), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(`${label}\u4E2D\u6587\u5B57\u4F53`), disabled, onChange: (event) => onChange(["font", "chinese_font"], event.target.value), value: stringValue(font.chinese_font, "\u4EFF\u5B8B") })), /* @__PURE__ */ __dshReact.createElement("label", null, t("\u897F\u6587\u5B57\u4F53"), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(`${label}\u897F\u6587\u5B57\u4F53`), disabled, onChange: (event) => onChange(["font", "western_font"], event.target.value), value: stringValue(font.western_font, "Times New Roman") })), /* @__PURE__ */ __dshReact.createElement("label", null, t("\u5B57\u53F7"), /* @__PURE__ */ __dshReact.createElement("select", { "aria-label": t(`${label}\u5B57\u53F7`), disabled, onChange: (event) => {
    const nextSize = Number(event.target.value);
    onChange(["font", "size_pt"], nextSize);
    INDENT_KEYS.forEach((key) => {
      const unitKey = indentUnitKey(key);
      if (indentUnitValue(paragraph[unitKey]) === "character") {
        const characters = indentDisplayValue(paragraph[key], "character", fontSize);
        onChange(["paragraph", key], pointsFromIndent(characters, "character", nextSize));
      }
    });
  }, value: String(fontSize) }, fontSizeOptions(fontSize).map((option) => /* @__PURE__ */ __dshReact.createElement("option", { key: option.pt, value: String(option.pt) }, t(option.label), " (", formatNumber(option.pt), " ", t("\u78C5"), ")")))), /* @__PURE__ */ __dshReact.createElement("div", { className: "font-options" }, /* @__PURE__ */ __dshReact.createElement("label", { className: "checkbox-label" }, /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(`${label}\u7C97\u4F53`), checked: booleanValue(font.bold), disabled, onChange: (event) => onChange(["font", "bold"], event.target.checked), type: "checkbox" }), t("\u7C97\u4F53")), /* @__PURE__ */ __dshReact.createElement("label", { className: "checkbox-label" }, /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(`${label}\u659C\u4F53`), checked: booleanValue(font.italic), disabled, onChange: (event) => onChange(["font", "italic"], event.target.checked), type: "checkbox" }), t("\u659C\u4F53"))), !characterOnly ? /* @__PURE__ */ __dshReact.createElement(__dshReact.Fragment, null, /* @__PURE__ */ __dshReact.createElement("label", null, t("\u5BF9\u9F50"), /* @__PURE__ */ __dshReact.createElement("select", { "aria-label": t(`${label}\u5BF9\u9F50`), disabled, onChange: (event) => onChange(["paragraph", "alignment"], event.target.value), value: stringValue(paragraph.alignment, "left") }, /* @__PURE__ */ __dshReact.createElement("option", { value: "left" }, t("\u5DE6\u5BF9\u9F50")), /* @__PURE__ */ __dshReact.createElement("option", { value: "center" }, t("\u5C45\u4E2D")), /* @__PURE__ */ __dshReact.createElement("option", { value: "right" }, t("\u53F3\u5BF9\u9F50")), /* @__PURE__ */ __dshReact.createElement("option", { value: "justify" }, t("\u4E24\u7AEF\u5BF9\u9F50")))), INDENT_KEYS.map((key) => {
    const unitKey = indentUnitKey(key);
    const unit = indentUnitValue(paragraph[unitKey]);
    return /* @__PURE__ */ __dshReact.createElement("div", { className: "measurement-control", key }, /* @__PURE__ */ __dshReact.createElement("label", null, t(paragraphLabel("", key)), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(paragraphLabel(label, key)), disabled, min: "0", onChange: (event) => onChange(["paragraph", key], pointsFromIndent(Number(event.target.value), unit, fontSize)), step: indentStep(unit), type: "number", value: indentDisplayValue(paragraph[key], unit, fontSize) })), /* @__PURE__ */ __dshReact.createElement("label", null, t("\u5355\u4F4D"), /* @__PURE__ */ __dshReact.createElement("select", { "aria-label": t(indentUnitLabel(label, key)), className: "unit-select", disabled, onChange: (event) => onChange(["paragraph", unitKey], event.target.value), value: unit }, INDENT_UNITS.map((option) => /* @__PURE__ */ __dshReact.createElement("option", { key: option.value, value: option.value }, t(option.label))))));
  }), /* @__PURE__ */ __dshReact.createElement("label", null, t("\u884C\u8DDD\u7C7B\u578B"), /* @__PURE__ */ __dshReact.createElement("select", { "aria-label": t(`${label}\u884C\u8DDD\u7C7B\u578B`), disabled, onChange: (event) => {
    const nextRule = event.target.value;
    onChange(["paragraph", "line_spacing_rule"], nextRule);
    if (nextRule === "multiple" && typeof paragraph.line_spacing_multiple !== "number") onChange(["paragraph", "line_spacing_multiple"], 1.5);
    if (nextRule !== "multiple" && typeof paragraph.line_spacing_pt !== "number") onChange(["paragraph", "line_spacing_pt"], 29);
  }, value: lineSpacingRule }, LINE_SPACING_RULES.map((option) => /* @__PURE__ */ __dshReact.createElement("option", { key: option.value, value: option.value }, t(option.label))))), /* @__PURE__ */ __dshReact.createElement("label", null, t(lineSpacingLabel("", lineSpacingRule)), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(lineSpacingLabel(label, lineSpacingRule)), disabled, min: "0", onChange: (event) => onChange(["paragraph", lineSpacingRule === "multiple" ? "line_spacing_multiple" : "line_spacing_pt"], Number(event.target.value)), step: lineSpacingRule === "multiple" ? "0.1" : "0.5", type: "number", value: lineSpacingValue })), ["space_before_pt", "space_after_pt"].map((key) => /* @__PURE__ */ __dshReact.createElement("label", { key }, t(paragraphLabel("", key)), /* @__PURE__ */ __dshReact.createElement("input", { "aria-label": t(paragraphLabel(label, key)), disabled, min: "0", onChange: (event) => onChange(["paragraph", key], Number(event.target.value)), step: "0.5", type: "number", value: numberValue(paragraph[key], 0) })))) : null));
}
function editableRolesFor(pack) {
  const roles = {};
  Object.entries(pack.roles).forEach(([key, value]) => {
    roles[key] = {
      ...value,
      role_type: roleType(value.role_type),
      font: { ...value.font },
      paragraph: { ...value.paragraph },
      page: { ...value.page },
      image: { ...value.image }
    };
  });
  const defaults = defaultRoleMap();
  if (roles.body && !roles["body-paragraph"]) roles["body-paragraph"] = roles.body;
  const metadataRolePairs = [["abstract", "abstract-label", "abstract-content"], ["keywords", "keywords-label", "keywords-content"]];
  metadataRolePairs.forEach(([legacyKey, labelKey, contentKey]) => {
    const labelRole = roles[labelKey];
    const contentRole = roles[contentKey];
    const legacyRole = roles[legacyKey];
    const paragraphRole = labelRole?.role_type === "paragraph" ? labelRole : contentRole?.role_type === "paragraph" ? contentRole : legacyRole;
    const contentFontRole = contentRole?.font ? contentRole : legacyRole;
    roles[labelKey] = {
      ...defaults[labelKey],
      ...labelRole,
      role_type: "paragraph",
      font: { ...defaults[labelKey].font, ...labelRole?.font },
      paragraph: { ...defaults[labelKey].paragraph, ...paragraphRole?.paragraph }
    };
    roles[contentKey] = {
      ...defaults[contentKey],
      ...contentRole,
      role_type: "character",
      font: { ...defaults[contentKey].font, ...contentFontRole?.font },
      paragraph: {}
    };
    delete roles[legacyKey];
  });
  Object.entries(defaults).forEach(([key, value]) => {
    const role = roles[key];
    roles[key] = {
      ...value,
      ...role,
      font: { ...value.font, ...role?.font },
      paragraph: role?.role_type === "character" ? {} : { ...value.paragraph, ...role?.paragraph },
      page: { ...value.page, ...role?.page },
      image: { ...value.image, ...role?.image }
    };
  });
  return roles;
}
function defaultRoleMap() {
  const paragraph = {
    alignment: "left",
    first_line_indent_pt: 0,
    first_line_indent_unit: "character",
    left_indent_pt: 0,
    left_indent_unit: "character",
    right_indent_pt: 0,
    right_indent_unit: "character",
    line_spacing_pt: 29,
    line_spacing_rule: "exact",
    line_spacing_multiple: 1.5,
    space_before_pt: 0,
    space_after_pt: 0
  };
  const font = { chinese_font: "\u4EFF\u5B8B", western_font: "Times New Roman", size_pt: 16, bold: false, italic: false };
  const roles = {};
  Object.keys(ROLE_LABELS).forEach((key) => {
    roles[key] = key === "image" ? { role_type: "image", image: { alignment: "center", space_before_pt: 0, space_after_pt: 0 } } : { role_type: key === "point" ? "character" : "paragraph", font: { ...font }, paragraph: { ...paragraph } };
  });
  roles["document-title"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u5B8B\u4F53", size_pt: 22, bold: true }, paragraph: { ...paragraph, alignment: "center" } };
  roles["document-subtitle"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u6977\u4F53", bold: true }, paragraph: { ...paragraph, alignment: "center" } };
  roles["organization-department"] = { ...roles["document-subtitle"] };
  roles.author = { ...roles["document-subtitle"] };
  roles.date = { ...roles["document-subtitle"] };
  roles["abstract-label"] = {
    role_type: "paragraph",
    font: { ...font, chinese_font: "\u9ED1\u4F53", size_pt: 9, bold: true },
    paragraph: { ...paragraph, alignment: "justify", first_line_indent_pt: 0, left_indent_pt: 18, right_indent_pt: 18, line_spacing_pt: 12, line_spacing_rule: "minimum", space_before_pt: 12 }
  };
  roles["abstract-content"] = { role_type: "character", font: { ...font, chinese_font: "\u6977\u4F53", size_pt: 9 }, paragraph: {} };
  roles["keywords-label"] = {
    role_type: "paragraph",
    font: { ...font, chinese_font: "\u9ED1\u4F53", size_pt: 9, bold: true },
    paragraph: { ...paragraph, alignment: "justify", first_line_indent_pt: 0, left_indent_pt: 18, right_indent_pt: 18, line_spacing_pt: 12, line_spacing_rule: "minimum", space_after_pt: 5 }
  };
  roles["keywords-content"] = { role_type: "character", font: { ...font, chinese_font: "\u6977\u4F53", size_pt: 9 }, paragraph: {} };
  roles["heading-1"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Times New Roman", size_pt: 14, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, space_before_pt: 5, line_spacing_pt: 18, line_spacing_rule: "minimum" } };
  roles["heading-2"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Times New Roman", size_pt: 12, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, space_before_pt: 5, line_spacing_pt: 12, line_spacing_rule: "minimum" } };
  roles["heading-3"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Times New Roman", size_pt: 10.5, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, space_before_pt: 5, line_spacing_pt: 12, line_spacing_rule: "minimum" } };
  roles["heading-4"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Times New Roman", size_pt: 9, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, space_before_pt: 5, line_spacing_pt: 12, line_spacing_rule: "minimum" } };
  roles["heading-5"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Times New Roman", size_pt: 7.5, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, space_before_pt: 5, line_spacing_pt: 12, line_spacing_rule: "minimum" } };
  roles["heading-6"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Times New Roman", size_pt: 6.5, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, space_before_pt: 5, line_spacing_pt: 12, line_spacing_rule: "minimum" } };
  roles["table-credit"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Arial", size_pt: 14 }, paragraph: { ...paragraph, alignment: "right" } };
  roles["figure-credit"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Arial", size_pt: 14 }, paragraph: { ...paragraph, alignment: "right" } };
  roles["body-table"] = { role_type: "paragraph", font: { ...font, size_pt: 14 }, paragraph: { ...paragraph, first_line_indent_pt: 0 } };
  roles["table-row-header"] = { ...roles["body-table"], font: { ...font, size_pt: 14, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, alignment: "left" } };
  roles["table-column-header"] = { ...roles["body-table"], font: { ...font, size_pt: 14, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, alignment: "center" } };
  roles["reference-heading"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u9ED1\u4F53", western_font: "Times New Roman", size_pt: 14, bold: true }, paragraph: { ...paragraph, first_line_indent_pt: 0, space_before_pt: 5, line_spacing_pt: 18, line_spacing_rule: "minimum" } };
  roles["reference-entry"] = { role_type: "paragraph", font: { ...font, chinese_font: "\u5B8B\u4F53", western_font: "Times New Roman", size_pt: 7.5 }, paragraph: { ...paragraph, alignment: "justify", first_line_indent_pt: 0, space_before_pt: 0, line_spacing_pt: 12, line_spacing_rule: "minimum" } };
  roles.footer = { role_type: "paragraph", font: { ...font, chinese_font: "\u5B8B\u4F53", size_pt: 14 }, paragraph: { ...paragraph, alignment: "center" } };
  roles.page = { role_type: "page", page: { margin_top_cm: 3.5, margin_bottom_cm: 3.5, margin_left_cm: 2.8, margin_right_cm: 2.8, page_width_cm: 21, page_height_cm: 29.7 } };
  return roles;
}
function updateRole(setRoles, roleKey, field, value) {
  const path = Array.isArray(field) ? field : [field];
  setRoles((current) => {
    const next = { ...current, [roleKey]: { ...current[roleKey] } };
    let cursor = next[roleKey];
    path.slice(0, -1).forEach((part) => {
      cursor[part] = { ...cursor[part] };
      cursor = cursor[part];
    });
    cursor[path[path.length - 1]] = value;
    return next;
  });
}
function roleType(value) {
  return value === "character" || value === "page" || value === "image" ? value : "paragraph";
}
function stringValue(value, fallback) {
  return typeof value === "string" ? value : fallback;
}
function numberValue(value, fallback) {
  return typeof value === "number" ? value : fallback;
}
function booleanValue(value) {
  return value === true;
}
function paragraphLabel(label, key) {
  const names = {
    first_line_indent_pt: "\u9996\u884C\u7F29\u8FDB",
    left_indent_pt: "\u5DE6\u7F29\u8FDB",
    right_indent_pt: "\u53F3\u7F29\u8FDB",
    line_spacing_pt: "\u884C\u8DDD",
    space_before_pt: "\u6BB5\u524D\uFF08\u78C5\uFF09",
    space_after_pt: "\u6BB5\u540E\uFF08\u78C5\uFF09"
  };
  return `${label}${names[key] ?? key}`;
}
function fontSizeOptions(sizePt) {
  return FONT_SIZE_PRESETS.some((option) => option.pt === sizePt) ? FONT_SIZE_PRESETS : [{ label: "\u81EA\u5B9A\u4E49", pt: sizePt }, ...FONT_SIZE_PRESETS];
}
function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}
function indentUnitKey(key) {
  return key.replace(/_pt$/, "_unit");
}
function indentUnitValue(value) {
  return value === "pt" || value === "cm" || value === "character" ? value : "character";
}
function indentUnitLabel(label, key) {
  return `${paragraphLabel(label, key)}\u5355\u4F4D`;
}
function indentDisplayValue(value, unit, fontSize) {
  const points = numberValue(value, 0);
  if (unit === "character") return round(points / Math.max(fontSize, 1));
  if (unit === "cm") return round(points / 28.3464567);
  return round(points);
}
function pointsFromIndent(value, unit, fontSize) {
  if (unit === "character") return round(value * Math.max(fontSize, 1));
  if (unit === "cm") return round(value * 28.3464567);
  return round(value);
}
function indentStep(unit) {
  return unit === "character" ? "0.1" : unit === "cm" ? "0.01" : "0.5";
}
function round(value) {
  return Math.round(value * 100) / 100;
}
function lineSpacingRuleValue(value) {
  return value === "maximum" || value === "minimum" || value === "multiple" || value === "exact" ? value : "exact";
}
function lineSpacingLabel(label, rule) {
  return `${label}\u884C\u8DDD\uFF08${rule === "multiple" ? "\u500D\u6570" : "\u78C5"}\uFF09`;
}
function pageLabel(key) {
  const names = {
    margin_top_cm: "\u4E0A\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09",
    margin_bottom_cm: "\u4E0B\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09",
    margin_left_cm: "\u5DE6\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09",
    margin_right_cm: "\u53F3\u8FB9\u8DDD\uFF08\u5398\u7C73\uFF09",
    page_width_cm: "\u9875\u9762\u5BBD\u5EA6\uFF08\u5398\u7C73\uFF09",
    page_height_cm: "\u9875\u9762\u9AD8\u5EA6\uFF08\u5398\u7C73\uFF09"
  };
  return names[key] ?? key;
}

// client/styles.css
var styles_default = '.dc-page {\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  min-height: 0;\n  overflow: auto;\n  padding: 24px 28px 40px;\n  background: var(--dsw-alias-bg-base);\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 14px;\n  line-height: 1.5;\n  accent-color: var(--dsw-alias-brand-primary);\n  scrollbar-color: var(--dsw-alias-border-l2) var(--dsw-alias-bg-base);\n  scrollbar-width: thin;\n}\n.dc-page *, .dc-page *::before, .dc-page *::after { box-sizing: border-box; }\n.dc-page [hidden] { display: none !important; }\n.dc-page button, .dc-page input, .dc-page select { font: inherit; }\n.dc-page button, .dc-page a, .dc-page summary { -webkit-tap-highlight-color: transparent; }\n.dc-page button { cursor: pointer; }\n.dc-page button:disabled, .dc-page input:disabled, .dc-page select:disabled { cursor: not-allowed; opacity: .5; }\n.dc-page :is(button, input, select, a, summary):focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 3px; }\n.dc-page input { caret-color: var(--dsw-alias-brand-primary); }\n.dc-page ::selection { background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }\n.dc-page h1, .dc-page h2, .dc-page h3, .dc-page p { margin: 0; }\n.dc-page h1 { font-size: 20px; font-weight: 600; line-height: 1.4; }\n.dc-page h2, .dc-page h3 { font-size: 14px; font-weight: 600; line-height: 1.5; }\n.dc-page .dc-content { max-width: 1040px; margin: 0 auto; }\n.dc-page .dc-heading { margin-bottom: 8px; }\n.dc-page .dc-section { padding: 20px 0; border-bottom: 1px solid var(--dsw-alias-border-l1); }\n.dc-page .dc-section > h2 { margin-bottom: 12px; }\n.dc-page :is(input:not([type="checkbox"]), select) { min-width: 0; min-height: 36px; padding: 7px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }\n.dc-page input::placeholder { color: var(--dsw-alias-label-secondary); opacity: 1; }\n.dc-page select { max-width: 100%; }\n.dc-page input[type="file"] { width: 100%; padding: 5px 8px; }\n.dc-page input[type="file"]::file-selector-button { margin-right: 12px; padding: 5px 10px; border: 0; border-radius: 4px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; cursor: pointer; }\n.dc-page .dc-source-help { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .dc-path-field { display: grid; gap: 6px; }\n.dc-page .dc-path-field > span { color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .dc-preset-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }\n.dc-page .dc-preset-row > select { flex: 1 1 220px; }\n.dc-page .dc-button { display: inline-flex; justify-content: center; align-items: center; gap: 7px; min-height: 36px; padding: 7px 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-weight: 500; text-decoration: none; white-space: nowrap; transition: background-color 150ms ease, border-color 150ms ease; }\n.dc-page .dc-button:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }\n.dc-page .dc-button-primary { border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }\n.dc-page .dc-button-primary:hover:not(:disabled) { background: var(--dsw-alias-brand-primary); opacity: .88; }\n.dc-page .dc-button-danger { border-color: var(--dsw-alias-danger-primary, #c62828); color: var(--dsw-alias-danger-primary, #c62828); }\n.dc-page .dc-button-danger:hover:not(:disabled) { background: var(--dsw-alias-danger-bg, rgba(198, 40, 40, .1)); border-color: var(--dsw-alias-danger-primary, #c62828); }\n.dc-page .dc-button svg, .dc-page .dc-text-button svg { flex: 0 0 auto; }\n.dc-page .dc-text-button { display: inline-flex; align-items: center; gap: 5px; padding: 2px 0; border: 0; background: transparent; color: var(--dsw-alias-brand-primary); text-align: left; text-decoration: none; text-underline-offset: 3px; }\n.dc-page .dc-text-button:hover:not(:disabled) { text-decoration: underline; }\n.dc-page .dc-new-preset { margin-top: 14px; }\n.dc-page .dc-new-preset > label { display: block; margin-bottom: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .dc-new-preset > div { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }\n.dc-page .dc-new-preset input { flex: 1 1 200px; max-width: 440px; }\n.dc-page .dc-muted, .dc-page .field-help { color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .dc-muted, .dc-page .field-help, .dc-page .dc-warning { margin-top: 10px; }\n.dc-page .dc-warning { color: var(--dsw-alias-state-warn-primary); font-size: 12px; }\n.dc-page .dc-error, .dc-page .error-message, .dc-page .dc-inline-error { color: var(--dsw-alias-state-error-primary); font-size: 13px; overflow-wrap: anywhere; }\n.dc-page .dc-error { display: flex; align-items: flex-start; gap: 7px; margin-top: 12px; }\n.dc-page .dc-error > svg { margin-top: 1px; flex: 0 0 auto; }\n.dc-page .dc-inline-error { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 14px; margin-top: 10px; }\n.dc-page .dc-inline-error > span { min-width: 0; }\n.dc-page .dc-style-settings { margin-top: 18px; }\n.dc-page .dc-settings-tabs { display: flex; gap: 18px; border-bottom: 1px solid var(--dsw-alias-border-l1); }\n.dc-page .dc-settings-tabs > button { min-height: 36px; padding: 5px 0 8px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--dsw-alias-label-secondary); }\n.dc-page .dc-settings-tabs > button[aria-selected="true"] { border-bottom-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary); font-weight: 600; }\n.dc-page .style-editor { display: flex; flex-direction: column; gap: 16px; min-width: 0; padding-top: 16px; }\n.dc-page .style-navigation { min-width: 0; }\n.dc-page .role-section-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 2px; }\n.dc-page .role-section-tab { min-height: 32px; padding: 5px 12px; border: 0; border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary); white-space: nowrap; }\n.dc-page .role-section-tab:hover { background: var(--dsw-alias-bg-layer-1); }\n.dc-page .role-section-tab[aria-selected="true"] { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; }\n.dc-page .role-workspace { display: grid; grid-template-columns: 172px minmax(0, 1fr); align-items: start; gap: 24px; min-width: 0; }\n.dc-page .role-directory { min-width: 0; padding-right: 14px; border-right: 1px solid var(--dsw-alias-border-l1); }\n.dc-page .role-directory > div + div { margin-top: 18px; }\n.dc-page .role-directory p { margin: 0 0 5px; color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .role-directory button { display: block; width: 100%; min-height: 32px; padding: 6px 9px; border: 0; border-radius: 4px; background: transparent; color: var(--dsw-alias-label-primary); text-align: left; font-size: 13px; }\n.dc-page .role-directory button:hover { background: var(--dsw-alias-bg-layer-1); }\n.dc-page .role-directory button[aria-pressed="true"] { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-brand-primary); font-weight: 600; }\n.dc-page .role-inspector { min-width: 0; }\n.dc-page .role-inspector-heading { margin-bottom: 14px; }\n.dc-page .style-group { min-width: 0; margin: 0; padding: 0; border: 0; }\n.dc-page .inspector-group > legend, .dc-page .dc-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }\n.dc-page .style-group > legend { color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .role-card { min-width: 0; }\n.dc-page .style-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 14px 16px; }\n.dc-page .style-grid label { display: grid; gap: 5px; min-width: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .style-grid :is(input, select) { width: 100%; color: var(--dsw-alias-label-primary); font-size: 13px; }\n.dc-page .font-options { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; align-self: end; min-height: 36px; }\n.dc-page .font-options .checkbox-label { display: inline-flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-primary); }\n.dc-page .checkbox-label input { width: 15px; height: 15px; margin: 0; }\n.dc-page .measurement-control { display: grid; grid-template-columns: minmax(0, 1fr) 72px; gap: 6px; min-width: 0; }\n.dc-page .page-settings > legend { padding: 0 0 12px; }\n.dc-page .style-savebar { display: flex; justify-content: flex-end; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding-top: 14px; border-top: 1px solid var(--dsw-alias-border-l1); }\n.dc-page .style-savebar .error-message { flex: 1 1 240px; }\n.dc-page .style-save-status { margin-right: auto; color: var(--dsw-alias-state-success-primary); font-size: 12px; }\n.dc-page .dc-convert-row { display: flex; padding-top: 20px; }\n.dc-page .dc-task { margin-top: 24px; padding: 18px 0; border-top: 1px solid var(--dsw-alias-border-l1); }\n.dc-page .dc-task-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; }\n.dc-page .dc-status { display: inline-flex; align-items: center; gap: 5px; color: var(--dsw-alias-state-idle-primary); font-size: 12px; }\n.dc-page .dc-status-running { color: var(--dsw-alias-brand-primary); }\n.dc-page .dc-status-completed { color: var(--dsw-alias-state-success-primary); }\n.dc-page .dc-status-failed { color: var(--dsw-alias-state-error-primary); }\n.dc-page .dc-task-name { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; margin-top: 10px; overflow-wrap: anywhere; }\n.dc-page .dc-task-name > span { color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .dc-result-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }\n.dc-page .dc-artifacts { margin-top: 14px; }\n.dc-page summary { width: fit-content; max-width: 100%; cursor: pointer; color: var(--dsw-alias-label-secondary); font-size: 12px; }\n.dc-page .dc-artifacts ul { list-style: none; margin: 8px 0 0; padding: 0; }\n.dc-page .dc-artifacts li + li { margin-top: 6px; }\n.dc-page .dc-artifacts a { display: inline-flex; align-items: baseline; gap: 7px; max-width: 100%; padding: 3px 0; color: var(--dsw-alias-brand-primary); font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }\n.dc-page .dc-artifacts a > span { overflow-wrap: anywhere; }\n.dc-page .dc-artifacts svg { flex: 0 0 auto; align-self: center; }\n.dc-page .dc-environment { padding-top: 20px; margin-top: 8px; border-top: 1px solid var(--dsw-alias-border-l1); }\n.dc-page .dc-environment dl { display: grid; gap: 10px; margin: 12px 0; font-size: 12px; }\n.dc-page .dc-environment dl > div { display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 12px; }\n.dc-page .dc-environment dt { color: var(--dsw-alias-label-secondary); }\n.dc-page .dc-environment dd { margin: 0; overflow-wrap: anywhere; }\n.dc-page .dc-dependency-path { display: block; margin-top: 3px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }\n.dc-page .dc-spinner { animation: dc-converter-spin 1s linear infinite; }\n@keyframes dc-converter-spin { to { transform: rotate(360deg); } }\n@media (max-width: 760px) {\n  .dc-page { padding: 20px 18px 32px; }\n  .dc-page .role-workspace { grid-template-columns: 142px minmax(0, 1fr); gap: 16px; }\n  .dc-page .style-grid { grid-template-columns: 1fr; }\n  .dc-page .page-settings .style-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n}\n@media (max-width: 480px) {\n  .dc-page { padding: 16px 12px 24px; }\n  .dc-page .dc-preset-row > select { flex-basis: 100%; }\n  .dc-page .role-workspace { grid-template-columns: 110px minmax(0, 1fr); gap: 12px; }\n  .dc-page .role-directory { padding-right: 9px; }\n  .dc-page .role-directory button { padding: 6px; font-size: 12px; overflow-wrap: anywhere; }\n  .dc-page .measurement-control { grid-template-columns: minmax(0, 1fr) 62px; }\n  .dc-page .page-settings .style-grid { grid-template-columns: 1fr; }\n  .dc-page .dc-result-actions > .dc-button { flex: 1 1 auto; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .dc-page .dc-spinner { animation: none; }\n  .dc-page .dc-button { transition: none; }\n}\n';

// client/App.tsx
var JOB_STORAGE_KEY = "dsh-doc-converter:current-job:v1";
var ACCEPT = ".md,.markdown,.docx,.doc";
function rememberJob(jobId) {
  try {
    if (jobId) window.sessionStorage.setItem(JOB_STORAGE_KEY, jobId);
    else window.sessionStorage.removeItem(JOB_STORAGE_KEY);
  } catch {
  }
}
function rememberedJob() {
  try {
    return window.sessionStorage.getItem(JOB_STORAGE_KEY);
  } catch {
    return null;
  }
}
function sourceFormat(name) {
  const suffix = name.trim().toLowerCase().split(".").pop();
  return suffix === "docx" ? "docx" : suffix === "doc" ? "doc" : suffix === "md" || suffix === "markdown" ? "markdown" : null;
}
function errorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}
function App() {
  const t = useText();
  const id = (0, import_react4.useId)();
  const [packs, setPacks] = (0, import_react4.useState)([]);
  const [selectedId, setSelectedId] = (0, import_react4.useState)("");
  const [loadingStyles, setLoadingStyles] = (0, import_react4.useState)(true);
  const [stylesError, setStylesError] = (0, import_react4.useState)(null);
  const [dependencies, setDependencies] = (0, import_react4.useState)(null);
  const [dependenciesError, setDependenciesError] = (0, import_react4.useState)(null);
  const [file, setFile] = (0, import_react4.useState)(null);
  const [path, setPath] = (0, import_react4.useState)("");
  const [pathMode, setPathMode] = (0, import_react4.useState)(false);
  const [editorOpen, setEditorOpen] = (0, import_react4.useState)(false);
  const [editorVisited, setEditorVisited] = (0, import_react4.useState)(false);
  const [editorSection, setEditorSection] = (0, import_react4.useState)("roles");
  const [editorDirty, setEditorDirty] = (0, import_react4.useState)(false);
  const [creating, setCreating] = (0, import_react4.useState)(false);
  const [deleting, setDeleting] = (0, import_react4.useState)(false);
  const [newPresetOpen, setNewPresetOpen] = (0, import_react4.useState)(false);
  const [newName, setNewName] = (0, import_react4.useState)("");
  const [job, setJob] = (0, import_react4.useState)(null);
  const [jobError, setJobError] = (0, import_react4.useState)(null);
  const [error, setError] = (0, import_react4.useState)(null);
  const [phase, setPhase] = (0, import_react4.useState)(null);
  const [pollGeneration, setPollGeneration] = (0, import_react4.useState)(0);
  const [restoring, setRestoring] = (0, import_react4.useState)(Boolean(rememberedJob()));
  const nameRef = (0, import_react4.useRef)(null);
  const starting = (0, import_react4.useRef)(false);
  const selectedPack = packs.find((pack) => pack.id === selectedId) ?? null;
  const running = job?.status === "running";
  const busy = phase !== null || running || restoring;
  const sourceName = pathMode ? path.trim() : file?.name ?? "";
  const format = sourceFormat(sourceName);
  const capability = format ? dependencies?.capabilities?.[format] : void 0;
  const dependencyBlock = capability === false ? format === "markdown" ? t("\u5C1A\u672A\u627E\u5230 Pandoc\uFF0CMarkdown \u8F6C\u6362\u6682\u4E0D\u53EF\u7528\u3002") : format === "doc" ? t("DOC \u8F6C\u6362\u9700\u8981 Pandoc \u548C LibreOffice\u3002") : null : null;
  const acceptJob = (0, import_react4.useCallback)((next) => {
    rememberJob(next.id);
    setJob(next);
  }, []);
  (0, import_react4.useEffect)(() => {
    const controller = new AbortController();
    let active = true;
    const stored = rememberedJob();
    async function initialize() {
      const [stylesResult, dependenciesResult, jobResult] = await Promise.allSettled([
        listStylePacks(controller.signal),
        getDependencies(controller.signal),
        stored ? getJob(stored, controller.signal) : Promise.resolve(null)
      ]);
      if (!active) return;
      if (stylesResult.status === "fulfilled") {
        setPacks(stylesResult.value);
        const restoredPack = jobResult.status === "fulfilled" ? jobResult.value?.style_pack_id : void 0;
        setSelectedId((current) => current || (stylesResult.value.some((pack) => pack.id === restoredPack) ? restoredPack : stylesResult.value[0]?.id ?? ""));
      } else {
        setStylesError(errorMessage(stylesResult.reason, t("\u672A\u80FD\u8BFB\u53D6\u6837\u5F0F\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
      }
      if (dependenciesResult.status === "fulfilled") setDependencies(dependenciesResult.value);
      else setDependenciesError(errorMessage(dependenciesResult.reason, t("\u672A\u80FD\u8BFB\u53D6\u8F6C\u6362\u73AF\u5883\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
      if (jobResult.status === "fulfilled") {
        if (jobResult.value) acceptJob(jobResult.value);
      } else {
        setJobError(errorMessage(jobResult.reason, t("\u65E0\u6CD5\u8BFB\u53D6\u4EFB\u52A1\u72B6\u6001\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
      }
      setLoadingStyles(false);
      setRestoring(false);
    }
    void initialize();
    return () => {
      active = false;
      controller.abort();
    };
  }, [acceptJob]);
  (0, import_react4.useEffect)(() => {
    if (!job || job.status !== "running") return;
    const jobId = job.id;
    const controller = new AbortController();
    let active = true;
    let timer;
    let failures = 0;
    async function poll() {
      try {
        const next = await getJob(jobId, controller.signal);
        if (!active) return;
        failures = 0;
        setJobError(null);
        acceptJob(next);
        if (next.status === "running") timer = setTimeout(poll, 1200);
      } catch (pollError) {
        if (!active) return;
        failures += 1;
        setJobError(errorMessage(pollError, t("\u65E0\u6CD5\u8BFB\u53D6\u4EFB\u52A1\u72B6\u6001\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
        if (failures < 3) timer = setTimeout(poll, 1800 * failures);
      }
    }
    timer = setTimeout(poll, 900);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [job?.id, job?.status, pollGeneration, acceptJob]);
  (0, import_react4.useEffect)(() => {
    if (newPresetOpen) nameRef.current?.focus();
  }, [newPresetOpen]);
  async function reloadStyles() {
    setLoadingStyles(true);
    setStylesError(null);
    try {
      const next = await listStylePacks();
      setPacks(next);
      setSelectedId((current) => next.some((pack) => pack.id === current) ? current : next[0]?.id ?? "");
    } catch (loadError) {
      setStylesError(errorMessage(loadError, t("\u672A\u80FD\u8BFB\u53D6\u6837\u5F0F\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
    } finally {
      setLoadingStyles(false);
    }
  }
  async function reloadDependencies() {
    setDependenciesError(null);
    try {
      setDependencies(await getDependencies());
    } catch (loadError) {
      setDependenciesError(errorMessage(loadError, t("\u672A\u80FD\u8BFB\u53D6\u8F6C\u6362\u73AF\u5883\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
    }
  }
  async function retryJob() {
    setJobError(null);
    const jobId = job?.id ?? rememberedJob();
    if (!jobId) return;
    try {
      acceptJob(await getJob(jobId));
      setPollGeneration((current) => current + 1);
    } catch (loadError) {
      setJobError(errorMessage(loadError, t("\u65E0\u6CD5\u8BFB\u53D6\u4EFB\u52A1\u72B6\u6001\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
    }
  }
  function selectNewSource() {
    setError(null);
    setJobError(null);
    setJob(null);
    rememberJob(null);
  }
  async function createPreset(event) {
    event.preventDefault();
    if (creating || busy || editorDirty || !newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const pack = await createStylePack({ name: newName.trim() });
      setPacks((current) => [...current, pack]);
      setSelectedId(pack.id);
      setNewName("");
      setNewPresetOpen(false);
      setEditorVisited(true);
      setEditorOpen(true);
    } catch (createError) {
      setError(errorMessage(createError, t("\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
    } finally {
      setCreating(false);
    }
  }
  function savedPreset(pack) {
    setPacks((current) => current.map((item) => item.id === pack.id ? pack : item));
    setEditorDirty(false);
  }
  async function deleteSelectedPreset() {
    if (!selectedPack || busy || creating || deleting) return;
    if (!window.confirm(`${t("\u5220\u9664\u6837\u5F0F")}\u300C${selectedPack.name}\u300D\uFF1F${t("\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\u3002")}`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteStylePack(selectedPack);
      setPacks((current) => {
        const next = current.filter((item) => item.id !== selectedPack.id);
        setSelectedId(next[0]?.id ?? "");
        return next;
      });
      setEditorOpen(false);
      setEditorVisited(false);
      setEditorDirty(false);
    } catch (deleteError) {
      setError(errorMessage(deleteError, t("\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
    } finally {
      setDeleting(false);
    }
  }
  async function startConversion() {
    if (starting.current || busy || creating || editorDirty) return;
    setError(null);
    setJobError(null);
    if (!selectedPack) {
      setError(t("\u8BF7\u9009\u62E9\u6837\u5F0F\u9884\u8BBE\u3002"));
      return;
    }
    if (dependencyBlock) {
      setError(dependencyBlock);
      return;
    }
    const resumable = job?.status === "ready" ? job : null;
    if (!resumable && !sourceName) {
      setError(t("\u8BF7\u9009\u62E9\u6587\u4EF6\u6216\u586B\u5199\u672C\u673A\u8DEF\u5F84\u3002"));
      return;
    }
    if (!resumable && !format) {
      setError(t("\u4EC5\u652F\u6301 .md\u3001.markdown\u3001.docx \u548C .doc \u6587\u4EF6\u3002"));
      return;
    }
    starting.current = true;
    try {
      setPhase(resumable ? "starting" : "importing");
      const imported = resumable ?? (pathMode ? await importPath(path.trim(), selectedPack) : await importFile(file, selectedPack));
      acceptJob(imported);
      setPhase("starting");
      acceptJob(await convertJob(imported.id, selectedPack));
    } catch (convertError) {
      setError(errorMessage(convertError, t("\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002")));
    } finally {
      starting.current = false;
      setPhase(null);
    }
  }
  const statusText = restoring ? t("\u6B63\u5728\u6062\u590D\u4EFB\u52A1\u2026") : phase === "importing" ? t("\u6B63\u5728\u5BFC\u5165\u2026") : phase === "starting" ? t("\u6B63\u5728\u542F\u52A8\u2026") : job?.status === "running" ? t("\u6B63\u5728\u8F6C\u6362\u2026") : job?.status === "completed" ? t("\u8F6C\u6362\u5B8C\u6210") : job?.status === "failed" ? t("\u8F6C\u6362\u5931\u8D25") : t("\u5F85\u8F6C\u6362");
  const outputName = job?.output_name;
  const docxArtifact = job?.artifacts.find((name) => name === outputName) ?? job?.artifacts.find((name) => name.toLowerCase().endsWith(".docx"));
  const otherArtifacts = job?.artifacts.filter((name) => name !== docxArtifact) ?? [];
  return /* @__PURE__ */ __dshReact.createElement("section", { "aria-label": t("\u6587\u6863\u8F6C\u6362"), className: "dc-page" }, /* @__PURE__ */ __dshReact.createElement("style", null, styles_default), /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-content" }, /* @__PURE__ */ __dshReact.createElement("header", { className: "dc-heading" }, /* @__PURE__ */ __dshReact.createElement("h1", null, t("\u6587\u6863\u8F6C\u6362"))), /* @__PURE__ */ __dshReact.createElement("section", { "aria-labelledby": `${id}-file-title`, className: "dc-section" }, /* @__PURE__ */ __dshReact.createElement("h2", { id: `${id}-file-title` }, t("\u6587\u4EF6")), !pathMode ? /* @__PURE__ */ __dshReact.createElement(__dshReact.Fragment, null, /* @__PURE__ */ __dshReact.createElement("label", { className: "dc-sr-only", htmlFor: `${id}-file` }, t("\u9009\u62E9\u6587\u4EF6")), /* @__PURE__ */ __dshReact.createElement("input", { accept: ACCEPT, className: "dc-file-input", disabled: busy, id: `${id}-file`, onChange: (event) => {
    const chosen = event.target.files?.[0] ?? null;
    selectNewSource();
    setFile(chosen);
    if (chosen && !sourceFormat(chosen.name)) setError(t("\u4EC5\u652F\u6301 .md\u3001.markdown\u3001.docx \u548C .doc \u6587\u4EF6\u3002"));
  }, type: "file" })) : /* @__PURE__ */ __dshReact.createElement("label", { className: "dc-path-field", htmlFor: `${id}-path` }, /* @__PURE__ */ __dshReact.createElement("span", null, t("\u672C\u673A\u6587\u4EF6\u8DEF\u5F84")), /* @__PURE__ */ __dshReact.createElement("input", { autoComplete: "off", disabled: busy, id: `${id}-path`, onChange: (event) => {
    selectNewSource();
    setPath(event.target.value);
  }, placeholder: t("\u8F6C\u6362\u6587\u4EF6\u6240\u5728 Host \u4E0A\u7684\u5B8C\u6574\u8DEF\u5F84"), type: "text", value: path })), /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-source-help" }, /* @__PURE__ */ __dshReact.createElement("span", null, t("\u652F\u6301 Markdown\u3001DOCX \u548C DOC\u3002")), /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-text-button", disabled: busy, onClick: () => {
    selectNewSource();
    setPathMode((current) => !current);
  }, type: "button" }, t(pathMode ? "\u4F7F\u7528\u6587\u4EF6\u9009\u62E9" : "\u4F7F\u7528\u672C\u673A\u8DEF\u5F84"))), dependencyBlock ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-warning", role: "status" }, dependencyBlock) : null), /* @__PURE__ */ __dshReact.createElement("section", { "aria-labelledby": `${id}-style-title`, className: "dc-section" }, /* @__PURE__ */ __dshReact.createElement("h2", { id: `${id}-style-title` }, t("\u6837\u5F0F\u9884\u8BBE")), /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-preset-row" }, /* @__PURE__ */ __dshReact.createElement("label", { className: "dc-sr-only", htmlFor: `${id}-preset` }, t("\u9009\u62E9\u6837\u5F0F\u9884\u8BBE")), /* @__PURE__ */ __dshReact.createElement("select", { disabled: busy || creating || editorDirty || loadingStyles || !packs.length, id: `${id}-preset`, onChange: (event) => setSelectedId(event.target.value), value: selectedId }, !packs.length ? /* @__PURE__ */ __dshReact.createElement("option", { value: "" }, t(loadingStyles ? "\u6B63\u5728\u8BFB\u53D6\u6837\u5F0F\u2026" : "\u9009\u62E9\u6837\u5F0F\u9884\u8BBE")) : null, packs.map((pack) => /* @__PURE__ */ __dshReact.createElement("option", { key: pack.id, value: pack.id }, pack.name, " \xB7 v", pack.version))), /* @__PURE__ */ __dshReact.createElement("button", { "aria-controls": `${id}-new-preset`, "aria-expanded": newPresetOpen, className: "dc-button", disabled: busy || creating || editorDirty, onClick: () => setNewPresetOpen((current) => !current), type: "button" }, /* @__PURE__ */ __dshReact.createElement(IconPlus, { "aria-hidden": "true", size: 17 }), t("\u521B\u5EFA\u9884\u8BBE")), /* @__PURE__ */ __dshReact.createElement("button", { "aria-controls": `${id}-editor`, "aria-expanded": editorOpen, className: "dc-button", disabled: !selectedPack, onClick: () => {
    setEditorVisited(true);
    setEditorOpen((current) => !current);
  }, type: "button" }, /* @__PURE__ */ __dshReact.createElement(IconAdjustments, { "aria-hidden": "true", size: 17 }), t(editorOpen ? "\u6536\u8D77\u6837\u5F0F\u8BBE\u7F6E" : "\u5C55\u5F00\u6837\u5F0F\u8BBE\u7F6E"))), stylesError ? /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-inline-error", role: "alert" }, /* @__PURE__ */ __dshReact.createElement("span", null, stylesError), /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-text-button", disabled: loadingStyles || busy || editorDirty, onClick: () => void reloadStyles(), type: "button" }, t("\u91CD\u8BD5"))) : null, !loadingStyles && !stylesError && !packs.length ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-muted" }, t("\u5C1A\u65E0\u6837\u5F0F\u9884\u8BBE\u3002\u521B\u5EFA\u4E00\u4E2A\u9884\u8BBE\u540E\u5373\u53EF\u8F6C\u6362\u3002")) : null, newPresetOpen ? /* @__PURE__ */ __dshReact.createElement("form", { className: "dc-new-preset", id: `${id}-new-preset`, onSubmit: createPreset }, /* @__PURE__ */ __dshReact.createElement("label", { htmlFor: `${id}-new-name` }, t("\u9884\u8BBE\u540D\u79F0")), /* @__PURE__ */ __dshReact.createElement("div", null, /* @__PURE__ */ __dshReact.createElement("input", { disabled: creating || busy || editorDirty, id: `${id}-new-name`, maxLength: 80, onChange: (event) => setNewName(event.target.value), ref: nameRef, required: true, value: newName }), /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-button", disabled: creating || busy || editorDirty || !newName.trim(), type: "submit" }, t(creating ? "\u6B63\u5728\u521B\u5EFA\u2026" : "\u521B\u5EFA")), /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-text-button", disabled: creating, onClick: () => setNewPresetOpen(false), type: "button" }, t("\u53D6\u6D88")))) : null, editorDirty ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-warning", role: "status" }, t("\u6837\u5F0F\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u8BF7\u5148\u4FDD\u5B58\u65B0\u7248\u672C\u3002")) : null, /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-style-settings", hidden: !editorOpen, id: `${id}-editor` }, editorVisited && selectedPack ? /* @__PURE__ */ __dshReact.createElement(__dshReact.Fragment, null, /* @__PURE__ */ __dshReact.createElement("div", { "aria-label": t("\u5C55\u5F00\u6837\u5F0F\u8BBE\u7F6E"), className: "dc-settings-tabs", role: "tablist" }, ["roles", "page"].map((section, index) => /* @__PURE__ */ __dshReact.createElement("button", { "aria-controls": `${id}-settings-content`, "aria-selected": editorSection === section, id: `${id}-settings-${section}`, key: section, onClick: () => setEditorSection(section), onKeyDown: (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "roles" : event.key === "End" ? "page" : index === 0 ? "page" : "roles";
    setEditorSection(next);
    event.currentTarget.parentElement?.querySelector(`#${CSS.escape(`${id}-settings-${next}`)}`)?.focus();
  }, role: "tab", tabIndex: editorSection === section ? 0 : -1, type: "button" }, t(section === "roles" ? "\u6837\u5F0F\u89D2\u8272" : "\u9875\u9762\u8BBE\u7F6E")))), /* @__PURE__ */ __dshReact.createElement("div", { "aria-labelledby": `${id}-settings-${editorSection}`, id: `${id}-settings-content`, role: "tabpanel" }, /* @__PURE__ */ __dshReact.createElement(StyleEditor, { disabled: busy || creating || deleting, onDelete: () => void deleteSelectedPreset(), onDirtyChange: setEditorDirty, onSaved: savedPreset, pack: selectedPack, section: editorSection }))) : null)), /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-convert-row" }, /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-button dc-button-primary", disabled: busy || creating || editorDirty || !selectedPack || Boolean(dependencyBlock) || !sourceName && job?.status !== "ready", onClick: () => void startConversion(), type: "button" }, busy ? /* @__PURE__ */ __dshReact.createElement(IconLoader2, { "aria-hidden": "true", className: "dc-spinner", size: 18 }) : /* @__PURE__ */ __dshReact.createElement(IconPlayerPlay, { "aria-hidden": "true", size: 18 }), t(phase === "importing" ? "\u6B63\u5728\u5BFC\u5165\u2026" : phase === "starting" ? "\u6B63\u5728\u542F\u52A8\u2026" : running ? "\u6B63\u5728\u8F6C\u6362\u2026" : "\u5F00\u59CB\u8F6C\u6362"))), error ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-error", role: "alert" }, /* @__PURE__ */ __dshReact.createElement(IconAlertCircle, { "aria-hidden": "true", size: 18 }), error) : null, job || restoring || jobError || phase ? /* @__PURE__ */ __dshReact.createElement("section", { "aria-labelledby": `${id}-job-title`, className: "dc-task" }, /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-task-heading" }, /* @__PURE__ */ __dshReact.createElement("h2", { id: `${id}-job-title` }, t("\u5F53\u524D\u4EFB\u52A1")), /* @__PURE__ */ __dshReact.createElement("span", { className: `dc-status dc-status-${job?.status ?? "ready"}`, role: "status" }, job?.status === "completed" ? /* @__PURE__ */ __dshReact.createElement(IconCheck, { "aria-hidden": "true", size: 16 }) : job?.status === "failed" ? /* @__PURE__ */ __dshReact.createElement(IconAlertCircle, { "aria-hidden": "true", size: 16 }) : running || phase || restoring ? /* @__PURE__ */ __dshReact.createElement(IconLoader2, { "aria-hidden": "true", className: "dc-spinner", size: 16 }) : null, statusText)), job ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-task-name" }, job.source_name, /* @__PURE__ */ __dshReact.createElement("span", null, t("\u7248\u672C"), " ", job.style_pack_version)) : null, running ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-muted" }, t("\u5F53\u524D\u4EFB\u52A1\u5DF2\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\u5207\u6362\u9875\u9762\u540E\u53EF\u7EE7\u7EED\u67E5\u770B\u72B6\u6001\u3002")) : null, job?.status === "failed" && job.error ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-error", role: "alert" }, job.error) : null, jobError ? /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-inline-error", role: "alert" }, /* @__PURE__ */ __dshReact.createElement("span", null, jobError), /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-text-button", onClick: () => void retryJob(), type: "button" }, /* @__PURE__ */ __dshReact.createElement(IconRefresh, { "aria-hidden": "true", size: 16 }), t("\u91CD\u8BD5\u72B6\u6001\u67E5\u8BE2"))) : null, job?.status === "completed" ? /* @__PURE__ */ __dshReact.createElement(__dshReact.Fragment, null, /* @__PURE__ */ __dshReact.createElement("div", { className: "dc-result-actions" }, docxArtifact ? /* @__PURE__ */ __dshReact.createElement("a", { className: "dc-button dc-button-primary", download: true, href: artifactUrl(job.id, docxArtifact) }, /* @__PURE__ */ __dshReact.createElement(IconDownload, { "aria-hidden": "true", size: 17 }), t("\u4E0B\u8F7D DOCX")) : null), otherArtifacts.length ? /* @__PURE__ */ __dshReact.createElement("details", { className: "dc-artifacts" }, /* @__PURE__ */ __dshReact.createElement("summary", null, t("\u5176\u4ED6\u4EA7\u7269")), /* @__PURE__ */ __dshReact.createElement("ul", null, otherArtifacts.map((name) => /* @__PURE__ */ __dshReact.createElement("li", { key: name }, /* @__PURE__ */ __dshReact.createElement("a", { download: true, href: artifactUrl(job.id, name) }, /* @__PURE__ */ __dshReact.createElement(IconDownload, { "aria-hidden": "true", size: 15 }), /* @__PURE__ */ __dshReact.createElement("span", null, name)))))) : null) : null) : null, /* @__PURE__ */ __dshReact.createElement("details", { className: "dc-environment" }, /* @__PURE__ */ __dshReact.createElement("summary", null, t("\u8F6C\u6362\u73AF\u5883")), dependencies ? /* @__PURE__ */ __dshReact.createElement("dl", null, ["pandoc", "libreoffice"].map((key) => /* @__PURE__ */ __dshReact.createElement("div", { key }, /* @__PURE__ */ __dshReact.createElement("dt", null, key === "pandoc" ? "Pandoc" : "LibreOffice"), /* @__PURE__ */ __dshReact.createElement("dd", null, t(dependencies[key]?.available ? "\u5DF2\u627E\u5230" : "\u672A\u627E\u5230"), dependencies[key]?.path ? /* @__PURE__ */ __dshReact.createElement("span", { className: "dc-dependency-path" }, dependencies[key].path) : null)))) : null, dependenciesError ? /* @__PURE__ */ __dshReact.createElement("p", { className: "dc-error", role: "alert" }, dependenciesError) : null, /* @__PURE__ */ __dshReact.createElement("button", { className: "dc-text-button", onClick: () => void reloadDependencies(), type: "button" }, /* @__PURE__ */ __dshReact.createElement(IconRefresh, { "aria-hidden": "true", size: 15 }), t("\u5237\u65B0\u73AF\u5883")))));
}

// client/entry.tsx
var ID = "dsh-doc-converter";
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(ID, "zh", dictionaries.zh));
  ctx.effect(() => ctx.locale.register(ID, "en", dictionaries.en));
  const source = {
    subscribe: (listener) => ctx.locale.subscribe(listener),
    getSnapshot: () => ctx.locale.getSnapshot(),
    translate: ctx.locale.bind(ID)
  };
  const text = createTextTranslator(source.translate);
  function Page() {
    return /* @__PURE__ */ __dshReact.createElement(I18nProvider, { source }, /* @__PURE__ */ __dshReact.createElement(App, null));
  }
  function PanelIcon({ size = 20 }) {
    return /* @__PURE__ */ __dshReact.createElement(IconFileText, { "aria-hidden": "true", size, stroke: 1.75 });
  }
  ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: ID,
    order: 50,
    label: () => text("\u6587\u6863\u8F6C\u6362")
  }, PanelIcon)));
  ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({
    name: "main",
    key: ID
  }, Page)));
}
/*! Bundled license information:

@tabler/icons-react/dist/esm/defaultAttributes.mjs:
@tabler/icons-react/dist/esm/createReactComponent.mjs:
@tabler/icons-react/dist/esm/icons/IconAdjustments.mjs:
@tabler/icons-react/dist/esm/icons/IconAlertCircle.mjs:
@tabler/icons-react/dist/esm/icons/IconCheck.mjs:
@tabler/icons-react/dist/esm/icons/IconDownload.mjs:
@tabler/icons-react/dist/esm/icons/IconFileText.mjs:
@tabler/icons-react/dist/esm/icons/IconLoader2.mjs:
@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs:
@tabler/icons-react/dist/esm/icons/IconPlus.mjs:
@tabler/icons-react/dist/esm/icons/IconRefresh.mjs:
@tabler/icons-react/dist/esm/tabler-icons-react.mjs:
  (**
   * @license @tabler/icons-react v3.47.0 - MIT
   *
   * This source code is licensed under the MIT license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

return module.exports;
}});
