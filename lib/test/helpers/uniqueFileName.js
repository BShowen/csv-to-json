// A method for generating a unique filename.
// This method returns a string in the format "number-number.json".
module.exports.getUniqueName = (() => {
  let seed = Math.floor(Math.pow(Math.random() * 10, Math.random() * 10));
  return () => {
    return `${Date.now()}-${seed++}.json`;
  };
})();
