isUserAuthenticated = function(token){
    let validationToken = "AAAAA";
    return token == validationToken
};
allValuesNeeded = function(values){
    for(var i=0;i<values.length;i++){
        if(values[i] == "" || values[i] == null || values[i] == undefined){
            return false
        }
    }
    return true
};


module.exports = {isUserAuthenticated, allValuesNeeded};