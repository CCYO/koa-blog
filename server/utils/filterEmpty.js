//  針對不知道 data 是否為 array 的情況下，要將 data 作為 arg，調用 fnsItem，且將其RV作為參數，投入下一個 fnsItem，進行一系列的函數調用
//  而若data為array時，會將每個item作為個別的 arg (而非整筆array)，都進行一次 fnsItem
function filterEmptyAndFranferFns(data, ...fns) {
  let res = data;
  if (!fns.length) {
    //  fns內若無任何函數
    res = init(data);
  }
  //  將data作為參數，遍歷函數
  for (let fn of fns) {
    res = init(res, fn);
  }
  return res;
}
//  若 data 是 array，將每一個item個別作為參數，都進行一次 fn 調用
//  若 data 非 array，將item作為參數，調用 fn
function init(data, fn) {
  let res;
  if (Array.isArray(data)) {
    //  若 data 為 array
    res = initDatas(data, fn);
  } else {
    //  若 data 非 array
    res = initData(data, fn);
  }
  return res;
}
//  datas 為 array
//  若無任何item，RV []
//  若fn為false，RV datas
//  若具有item，將每一個item各別都作為參數，分別調用 fn
function initDatas(datas, fn) {
  if (!datas.length) {
    return [];
  }
  if (!fn) {
    return datas;
  }
  return datas.map((data) => initData(data, fn));
}
//  data 非 array
//  若data為false，RV null
//  若fn為false，RV data
//  將data作為參數，調用 fn
function initData(data, fn) {
  if (!data) {
    return null;
  }
  if (!fn) {
    return data;
  }
  return fn(data);
}
//  針對 datas 是 array
//  若無item，RV []
//  若fn為false，直接返回 datas
//  將datas作為參數，調用fn
function initDatasForArray(datas, fn) {
  if (!datas.length) {
    return [];
  }
  if (!fn) {
    return datas;
  }
  return fn(datas);
}
//  若 data 為 array，將data整個作為一個參數（而不是將item作為參數），調用fn
//  若 data 非 array，將data作為一個參數，調用fn
function initForArray(data, fn) {
  let res;
  if (Array.isArray(data)) {
    res = initDatasForArray(data, fn);
  } else {
    res = initData(data, fn);
  }
  return res;
}

//  針對不知道 data 是否為 array 的情況下，要將 data 作為 arg，調用 fnsItem，且將其RV作為參數，投入下一個 fnsItem，進行一系列的函數調用
//  而若data為array時，會將array作為 arg (而非item)
function filterEmptyAndFranferFnsForArray(data, ...fns) {
  let res = data;
  if (!fns.length) {
    res = initForArray(data);
  }
  for (let fn of fns) {
    res = initForArray(res, fn);
  }
  return res;
}

module.exports = {
  filterEmptyAndFranferFns,
  filterEmptyAndFranferFnsForArray,
};
