var profile_image_input = document.getElementById("upload-profile-photo");
var tracks_placeholder = document.getElementById("tracks_placeholder");
var player_placeholder = document.getElementById("player_placeholder");

const server_host = "https://sports.delivery-aboba.repl.co";

const methods = ["POST", "PUT", "PATCH", "DELETE"]

function print(text){
    console.log(text);
}

function not_found_handler(){
    window.location.href = "./404";
}

function forbidden_handler(){
    window.location.href = "./auth";
}

function logout(){
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.location.href = "./auth";
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else{
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}

if (getCookie("token") == null){
    forbidden_handler();
}

function CustomXHR(method, path, authorization=true){
    var xhr = new XMLHttpRequest();
    xhr.open(method, server_host + path);
    if (methods.includes(method)){ xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); }
    if (authorization == true){ xhr.setRequestHeader('authorization', 'Bearer ' + getCookie("token")); }
    return xhr;
}

function SportV(endpoint, sport){
    var xhr = CustomXHR("GET", "/sport/"+"?endpoint="+endpoint+"&sport="+sport);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            items = JSON.parse(xhr.responseText);
            items.forEach((item)=>{
                document.getElementById("user-profile-name").textContent=items.events[0].T1[0].Nm
            });
        }
        if (xhr.readyState === 4 && xhr.status === 404){
            lcl_place.innerHTML = "<div>Empty favorites list</div>";
        }
    }
    xhr.send();
}
