export function setCache(key: string, value: any) {
  if (key === 'messages') {
    console.log(value);
  }
  localStorage.setItem(key, JSON.stringify(value));
}
  
export function setMiniProgramCache(value: any[]) {
  setCache('history', value);
  const mainList = value?.map((item, index) => {
    const first = item?.messages?.[0];
    const second = item?.messages?.[1];
    let content = {
      id: index,
      title: first?.role === 'user' ? first?.content : '无标题',
      content: (second?.role === 'assistant' && !second?.isError) ? 
      second.content : ''
    };
    return content;
  });
  (window as any).wx.miniProgram.postMessage({ data: JSON.stringify(mainList || []) })
}

export function getCache<T = any>(key: string): T | undefined {
  return JSON.parse(localStorage.getItem(key) ?? 'null') ?? undefined;
}

export function removeCache(key: string) {
  localStorage.removeItem(key);
}
