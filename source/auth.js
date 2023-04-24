var alert_box = document.getElementById("alert-box");
var main_form = document.getElementById("main_form");
var user_login = document.getElementById("login");
var user_password = document.getElementById("password");
var username = document.getElementById("username");

var show_register = document.getElementById("show_register");
var login_div = document.getElementById("login_div");
var register_div = document.getElementById("register_div");
var password_repeat_div = document.getElementById("confirm_div");
var password_repeat = document.getElementById("password_confirm");
var username_div = document.getElementById("username_div");

const server_host = "https://back.fsdfsdfsfefeeef.repl.co";

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}

var token_exists = getCookie("token");
if (token_exists != null){
    window.location.href = "/";
}

function create_message(text){
    var block = document.createElement("div");
    block.setAttribute("class", "error");
    block.textContent = text;
    alert_box.appendChild(block);
    setTimeout(remove_message, 5000, block);
}

function login(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', server_host + '/auth/?username=' + user_login.value + '&password=' + user_password.value);
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            document.cookie = "token=" + JSON.parse(xhr.responseText).token + ";path=/;";
            window.location.href = "/";
        }
        else if(xhr.readyState === 4 && xhr.status === 403){
            create_message("Неправильный пароль");
        }
        else if(xhr.readyState === 4 && xhr.status === 404){
            create_message("Пользователь не найден");
        }
    }
    xhr.send();
}

function show_register_panel(){
    main_form.setAttribute("onsubmit", "register();");
    show_register.textContent = "Back to login";
    show_register.setAttribute("onclick", "hide_register_panel();");
    password_repeat_div.style.display = "block";
    username_div.style.display = "block";
    register_div.style.display = "block";
    login_div.style.display = "none";
}

function hide_register_panel(){
    main_form.setAttribute("onsubmit", "login();");
    show_register.textContent = "Register now";
    show_register.setAttribute("onclick", "show_register_panel();");
    password_repeat_div.style.display = "none";
    username_div.style.display = "none";
    register_div.style.display = "none";
    login_div.style.display = "block";
}

function register(){
    for (let chr of user_login.value) {
        if (123 < chr.charCodeAt(0) || 33 > chr.charCodeAt(0)) {
            create_message("Использованы неподдерживаемые символы");
            return;
        }
    }
    if (user_login.value === "user"){
        create_message("User не может быть использовано в качестве логина");
        return;
    }
    else if (user_login.value === "" || user_password.value === "" || username.value === ""){
        create_message("Не все поля заполнены");
        return;
    }
    else if (user_login.value.length < 4){
        create_message("Логин слишком короткий");
        return;
    }
    else if (user_password.value.length < 8){
        create_message("Пароль слишком короткий");
        return;
    }
    if (user_password.value != password_repeat.value){
        create_message("Пароли не совпадают");
        return;
    }
    var data = {}
    data.login = user_login.value;
    data.password = user_password.value;
    data.username = username.value;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', server_host + '/auth/');
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 201){
            document.cookie = "token=" + JSON.parse(xhr.responseText).token + ";path=/;";
            document.location.href = "/";
            create_message("Вы успешно зарегистрировались");
        }
        else if(xhr.readyState === 4 && xhr.status === 409){
            create_message(xhr.responseText);
        }
    }
    xhr.send(JSON.stringify(data));
}

function remove_message(block){ block.remove(); }

$("form").on('submit', function (e) {
   e.preventDefault();
   login();
});