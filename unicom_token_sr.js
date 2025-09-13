/***********************************
> 联通 - 抓取 Authorization (兼容 SR/QX/Surge/Loon)
> 请用于 Rewrite 的 script-request-header
> 上传为 raw 链接并在 Shadowrocket Rewrite 调用
> 更新时间：2025-09-13
***********************************/

/* 通用兼容头（粘贴上面那段） */
const isQX = typeof $prefs !== "undefined" && typeof $task !== "undefined";
const isSurge = typeof $httpClient !== "undefined" && typeof $notification === "undefined" && typeof $persistentStore === "undefined";
const isSR = typeof $persistentStore !== "undefined" && typeof $notification !== "undefined" && typeof $task === "undefined";
const persistRead = (key) => {
  try {
    if (isQX) return $prefs.valueForKey(key);
    if (isSR) return $persistentStore.read(key);
    if (isSurge) return $persistentStore ? $persistentStore.read(key) : null;
  } catch (e) { return null; }
};
const persistWrite = (key, val) => {
  try {
    if (isQX) return $prefs.setValueForKey(val, key);
    if (isSR) return $persistentStore.write(val, key);
    if (isSurge) return $persistentStore ? $persistentStore.write(val, key) : null;
  } catch (e) { return null; }
};
const notify = (title, subtitle, body, openUrl) => {
  try {
    if (isQX) return $notify(title, subtitle, body, openUrl ? { 'open-url': openUrl } : {});
    if (isSR) return $notification.post(title, subtitle, body);
    if (isSurge) return $notification ? $notification.post(title, subtitle, body) : null;
  } catch (e) { console.log("notify error", e); }
};

/* 实际脚本 */
const authorization = ($request && ($request.headers["Authorization"] || $request.headers["authorization"])) || null;

if (authorization) {
    persistWrite("Authorization", authorization);
    console.log("联通 Authorization 保存成功: " + authorization);
    notify("联通APP Token 获取成功", "脚本作者：Skinny Tiger", "✅ 已保存 Authorization");
} else {
    console.log("未在请求头中发现 Authorization");
    notify("联通APP Token 获取失败", "脚本作者：Skinny Tiger", "❌ 未在请求头中发现 Authorization");
}

$done({});
