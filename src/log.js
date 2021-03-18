export const log = (title, data, type = 'standar') => {
  const blackList = []
  if(!blackList.includes(type)){
    console.log(`${title} => `, data ? data : '');
  }
};
