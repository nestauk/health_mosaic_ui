export const fakeGet = url => {
  return new Promise(res => {
    setTimeout(() => {
      res(url);
    }, 2000);
  });
};
