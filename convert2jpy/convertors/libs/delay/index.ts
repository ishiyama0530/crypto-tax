export const delay = async (index: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000 * index);
  });
};
