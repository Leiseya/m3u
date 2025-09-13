/***********************************
> 联通 - 超级星期五 抽奖 (兼容 SR/QX/Surge/Loon)
> 上传为 raw 链接后可放到 Shadowrocket Script 列表手动运行
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
function httpRequest(req) {
  if (typeof $task !== "undefined") {
    return $task.fetch(req);
  }
  return new Promise((resolve, reject) => {
    const method = (req.method || "GET").toUpperCase();
    const opts = { url: req.url, headers: req.headers || {}, body: req.body || "" };
    const callback = (err, resp, respBody) => {
      if (err) return reject(err);
      resolve({
        statusCode: resp && (resp.status || resp.statusCode) || 0,
        body: respBody,
        headers: resp && (resp.headers || resp.allHeaders) || {}
      });
    };
    if (method === "GET") $httpClient.get(opts, callback);
    else $httpClient.post(opts, callback);
  });
}

/* 配置区（必要时改成你抓到的接口） */
// 注意：以下 URL 是常见的联通活动接口示例，实际可能有变动，抓包得到的接口请替换此处
const URL = "https://m.client.10010.com/activity/superFriday/lottery";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_10 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@12.0303}";

/* 主流程 */
(async () => {
  const token = persistRead("Authorization");
  if (!token) {
    console.log("未找到 Authorization，先登录并抓取 Token");
    notify("超级星期五 抽奖失败", "Skinny Tiger", "❌ 未找到 Authorization，请先登录并抓取 Token");
    return $done();
  }

  const req = {
    url: URL,
    method: "POST",
    headers: {
      "Authorization": token,
      "User-Agent": UA,
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: "" // 如果接口需要 body，请在这里填入 JSON 字符串
  };

  try {
    const resp = await httpRequest(req);
    let body = resp.body || "";
    try { body = typeof body === "string" ? body : JSON.stringify(body); } catch(e){}
    console.log("Response body:", body);

    // 解析
    const result = JSON.parse(body || "{}");
    const code = result.code || result.resultCode || resp.statusCode;
    const msg = result.msg || result.message || "";
    const prize = result.prizeName || result.prizesName || result.data && result.data.prizeName || "";

    if (code === 200 || String(code) === "0") {
      const prizeText = prize || (result.data && result.data && result.data.name) || "未中奖";
      notify("超级星期五 抽奖结果", "Skinny Tiger", `🎉 中奖：${prizeText}`);
      console.log("抽奖成功: " + prizeText);
    } else if (code === 401 || String(code) === "401") {
      notify("超级星期五 抽奖结果", "Skinny Tiger", "❌ Token 过期或无效，请重新登录抓取");
      console.log("Token 过期或无效: " + msg);
    } else {
      notify("超级星期五 抽奖结果", "Skinny Tiger", `⚠️ 失败: ${msg || JSON.stringify(result)}`);
      console.log("抽奖失败: " + (msg || JSON.stringify(result)));
    }
  } catch (err) {
    console.log("请求或解析错误:", JSON.stringify(err));
    notify("超级星期五 抽奖异常", "Skinny Tiger", "❌ 网络或解析错误，请看控制台日志");
  }

  $done();
})();
