exports.cl = (tag = "", message) => {
  if (process.env.log == 1) console.log("👀 ", tag, message);
};
