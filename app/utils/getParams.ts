export function getParams() {
  let urlParams: Record<string, string> = {};
  let urlSearch = window?.location.search.substring(1);
  if (!urlSearch) return;
  let paramsArray = urlSearch.split("&");
  for (let i = 0; i < paramsArray.length; i++) {
    let param = paramsArray[i].split("=");
    let paramName = decodeURIComponent(param[0]);
    let paramValue = decodeURIComponent(param[1]);
    urlParams[paramName] = paramValue;
  }
  return urlParams;
}