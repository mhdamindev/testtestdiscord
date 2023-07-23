module.exports = function(path,data){
  return  require('fs').writeFileSync(path , JSON.stringify(data))
}