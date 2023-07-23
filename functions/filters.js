const Menu = []
function addUser(UserID,menu){
        let user = {
            UserID,
            menu
        }
        Menu.push(user)
        return user
    }

    function removeUser(userID,menu){
        let user = Menu.find(x=>x.UserID===userID&&x.menu===menu)
        if (user){
            Menu.shift(user)
            return true 
        }
        return false 
    }
    function checkUser(userID,menu){
        let user = Menu.find(x=>x.UserID===userID&&x.menu===menu)
        if (user){
            return true 
        }else { 
            return false 
        }
    }
    function getUsers(){
        return Menu
    }
module.exports ={
        addUser,
        removeUser,
        getUsers,checkUser
}