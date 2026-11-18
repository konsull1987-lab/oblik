// Облік — посередник до Prozorro (Google Apps Script).
// Браузер не може напряму читати API Prozorro (CORS), тому застосунок ходить сюди.
// Розгортання: script.google.com → Новий проєкт → вставити цей код → Розгорнути → Нове розгортання →
// тип «Вебзастосунок», «Виконувати від імені: Я», «Доступ: Усі» → скопіювати URL (…/exec) у застосунок.
var API = "https://public-api.prozorro.gov.ua/api/2.5";

function doGet(e) {
  var p = (e && e.parameter) || {}, out;
  try {
    if (p.a === "scan") out = scan(p.offset || "", p.region || "полтав");
    else if (p.a === "t" && /^[0-9a-f]{32}$/i.test(p.id || "")) out = {data: JSON.parse(UrlFetchApp.fetch(API + "/tenders/" + p.id).getContentText()).data};
    else out = {ok: true, hint: "a=scan&offset=… або a=t&id=…"};
  } catch (err) { out = {error: String(err)}; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// Проходить стрічку змін від offset, відбирає активні закупівлі регіону і повертає їхні повні дані.
function scan(offset, region) {
  var t0 = Date.now(), ids = {}, pages = 0, re = new RegExp(region, "i");
  if (!offset) offset = String(Math.floor(Date.now() / 1000 - 3 * 86400));
  while (pages < 400 && Date.now() - t0 < 200000) {
    var j = JSON.parse(UrlFetchApp.fetch(API + "/tenders?limit=1000&opt_fields=status,procuringEntity&offset=" + encodeURIComponent(offset)).getContentText());
    pages++;
    var d = j.data || [];
    for (var i = 0; i < d.length; i++) {
      var reg = ((d[i].procuringEntity || {}).address || {}).region || "";
      if (re.test(reg) && (!d[i].status || d[i].status === "active.tendering")) ids[d[i].id] = 1;
    }
    var nx = j.next_page && j.next_page.offset;
    if (!d.length || !nx || nx === offset) break;
    offset = nx;
  }
  var list = Object.keys(ids), tenders = [];
  for (var k = 0; k < list.length && Date.now() - t0 < 300000; k += 20) {
    var reqs = list.slice(k, k + 20).map(function (id) { return {url: API + "/tenders/" + id, muteHttpExceptions: true}; });
    UrlFetchApp.fetchAll(reqs).forEach(function (r) {
      try {
        var t = JSON.parse(r.getContentText()).data;
        if (!t || t.status !== "active.tendering") return;
        tenders.push({id: t.id, tenderID: t.tenderID, title: t.title, status: t.status, mainProcurementCategory: t.mainProcurementCategory,
          procurementMethodType: t.procurementMethodType, value: t.value, tenderPeriod: t.tenderPeriod, enquiryPeriod: t.enquiryPeriod,
          procuringEntity: {name: (t.procuringEntity || {}).name, identifier: (t.procuringEntity || {}).identifier, address: (t.procuringEntity || {}).address},
          items: (t.items || []).slice(0, 30).map(function (x) { return {description: x.description, quantity: x.quantity, unit: x.unit, classification: x.classification}; })});
      } catch (er) {}
    });
  }
  return {offset: offset, pages: pages, tenders: tenders};
}
