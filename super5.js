/***********************************
> 联通超级星期五多账号秒杀（Shadowrocket专用）
> 支持多账户循环、自动通知
> 更新时间：2025-09-13
***********************************/

/* ===================== 配置区 ===================== */
// 每个账号的 ticket，从抓包获得
const tickets = [
  "87376127394be89c1e4f42ce388992", // 账号1 ticket
  "ticket_for_account2"               // 账号2 ticket
];

// 活动参数
const itemCode = "AWARD_AHFridaySecKill_10_tx";
const range = 10;

// 请求间隔（ms）
const INTERVAL_MS = 1200;

/* ===================== 主流程 ===================== */
(async () => {
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const url = `http://123.138.11.116:8080/wxopen/app-activity/AHSecKill/lotteryAction?ticket=${ticket}&itemCode=${itemCode}&range=${range}`;
    const referer = `http://123.138.11.116:8080/wxopen/hh/activity/superFriday/index?ticket=${ticket}`;
    const headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) unicom{version:iphone_c@12.0600};ltst;OSVersion/18.6.2",
      "Content-Type": "application/json",
      "Origin": "http://123.138.11.116:8080",
      "Referer": referer
    };
    const body = "{}";

    try {
      const resp = await $task.fetch({ url, method: "POST", headers, body });
      let result = {};
      try { result = JSON.parse(resp.body || "{}"); } catch(e) {}
      if(result.success){
        $notify(`账号${i+1} 秒杀成功`, "", JSON.stringify(result.data));
        console.log(`账号${i+1} 秒杀成功:`, result.data);
      } else {
        $notify(`账号${i+1} 秒杀失败`, "", result.alertMsg || JSON.stringify(result));
        console.log(`账号${i+1} 秒杀失败:`, result.alertMsg || JSON.stringify(result));
      }
    } catch(err){
      console.log(`账号${i+1} 请求失败:`, err);
      $notify(`账号${i+1} 秒杀异常`, "", "网络或解析错误");
    }

    if(i < tickets.length - 1){
      await new Promise(r => setTimeout(r, INTERVAL_MS));
    }
  }
  $done();
})();
