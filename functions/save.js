module.exports = function(path,data){
  return  require('fs').writeFileSync("./db/"+path , JSON.stringify(data))
}