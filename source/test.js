var profile_image_input = document.getElementById("upload-profile-photo");
profile_image_input.addEventListener("change", update_profile_img);
var tracks_placeholder = document.getElementById("tracks_placeholder");
var player_placeholder = document.getElementById("player_placeholder");

const server_host = "https://sports.delivery-aboba.repl.co";

const methods = ["POST", "PUT", "PATCH", "DELETE"]
can_preload = true;

var playlist = null;
var myPlaylist = null;
var current_alb = null;

const inactive_color = "#58524e";
const active_color = "#c54b36";

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

function player_color(id){
    var button_el = document.getElementById(id);
    if (button_el.getAttribute("stroke") == inactive_color) button_el.setAttribute("stroke", active_color);
    else button_el.setAttribute("stroke", inactive_color);
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

function my_albums(){
    var xhr = CustomXHR("GET", "/artists/albums");
    var lcl_place = document.getElementById("my-albums-list");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            items = JSON.parse(xhr.responseText)[0];
            print(items);
            lcl_place.textContent = "";
            items.forEach((element) =>{
                lcl_place.innerHTML += '<div class="col-6 col-sm-4 col-lg-2"><div class="album" onclick="fill_album('+ element.Albums.id +', true);" data-bs-toggle="modal" data-bs-target="#modal-own-album"><div class="album__cover"><img src="' + server_host + '/songs/image/' + element.Images.id + '"></div><div class="album__title"><h3><a href="'+ server_host +'">' + element.Albums.name + '</a></h3><span>' + element.Users.username + '</span></div></div></div>';
            });
        }
        if (xhr.readyState === 4 && xhr.status === 404){
            lcl_place.innerHTML = "<div>You have no albums</div>";
        }
    }
    xhr.send();
}

function create_album(){
    console.log(1);
    var img = document.getElementById("upload-album-img");
    var name = document.getElementById("album_name_id").value;
    var desc = document.getElementById("album_description_id").value;
    if (name.length == 0) {alert("Название не может быть пустым"); return;}
    if (desc.length == 0) {alert("Описание не может быть пустым"); return;}

    var local_files = img.files;
    if (local_files.length == 0) {alert("Постер не может быть пустым"); return;}
    else local_files = local_files[0];

    var formData = new FormData();
    formData.append("image", local_files);
    $.ajax({url: server_host + "/albums/create/" + name + "/" + desc,
        type: 'POST',
        headers: {'authorization': 'Bearer ' + getCookie("token")},
        data: formData,
        async: false, cache: false, contentType: false, processData: false,
        success: function (data){ alert("Альбом создан"); }
    });
}

function search(btn){
    var lcl_place = document.getElementById("search-list");

    var text = document.getElementById("search-input").value;
    if (text.length == 0) {alert("Текст не может быть пустым"); return;}
    var xhr = CustomXHR("GET", "/songs/search/" + btn + "/" + text);

    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            items = JSON.parse(xhr.responseText);
            print(items);
            lcl_place.textContent = "";
            items.forEach((element) =>{
                if (btn == 1){
                    lcl_place.innerHTML += '<div class="single-item"><a class="single-item__cover" data-img="source/images/music.svg"><img src="'+ server_host + '/songs/image/' + element.Songs.image + '"></a><div class="single-item__title"><h4>'+element.Users.username+'</h4><span>'+element.Songs.name+'</span></div><span class="single-item__time">'+element.Songs.duration+'</span><div class="dropdown"><a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></a><ul class="dropdown-menu" data-popper-placement="top-end" style="position: absolute; inset: auto 0px 0px auto; margin: 0px; transform: translate3d(0px, -20px, 0px);"><li><a class="dropdown-item d-flex align-items-center" href="#" onclick="add_track_to_favorites(' + element.Songs.id + ');"><span class="me-auto">Add</span><div class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.71,8.29a1,1,0,0,0-1.42,0L12,10.59,9.71,8.29A1,1,0,0,0,8.29,9.71L10.59,12l-2.3,2.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L13.41,12l2.3-2.29A1,1,0,0,0,15.71,8.29Zm3.36-3.36A10,10,0,1,0,4.93,19.07,10,10,0,1,0,19.07,4.93ZM17.66,17.66A8,8,0,1,1,20,12,7.95,7.95,0,0,1,17.66,17.66Z"></path></svg></div></a></li></ul></div></div>';
                }
                else if (btn == 2){
                    lcl_place.innerHTML += '<div class="col-6 col-sm-4 col-lg-2"><div class="album"><div class="album__cover"><img src="' + server_host + '/songs/image/' + element.Albums.image + '"><a href="#" onclick="play_album('+element.Albums.id+');"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.54,9,8.88,3.46a3.42,3.42,0,0,0-5.13,3V17.58A3.42,3.42,0,0,0,7.17,21a3.43,3.43,0,0,0,1.71-.46L18.54,15a3.42,3.42,0,0,0,0-5.92Zm-1,4.19L7.88,18.81a1.44,1.44,0,0,1-1.42,0,1.42,1.42,0,0,1-.71-1.23V6.42a1.42,1.42,0,0,1,.71-1.23A1.51,1.51,0,0,1,7.17,5a1.54,1.54,0,0,1,.71.19l9.66,5.58a1.42,1.42,0,0,1,0,2.46Z"></path></svg></a></div><div class="album__title"><h3><a href="#" onclick="play_album('+element.Albums.id+');">' + element.Albums.name + '</a></h3><span>' + element.Users.username + '</span></div></div></div>';
                }
                else {
                    lcl_place.innerHTML += '<div class="col-6 col-sm-4 col-md-3 col-xl-2"><a class="artist" onclick="fill_profile('+element.id+');" data-bs-toggle="modal" data-bs-target="#modal-user-profile"><div class="artist__cover"><img src="'+ server_host + '/songs/image/' + element.image + '" alt=""></div><h3 class="artist__title">'+element.username+'</h3></a></div>';
                }
            });
        }
        if (xhr.readyState === 4 && xhr.status === 404){
            lcl_place.innerHTML = "<div>Nothing found thy another request</div>";
        }
    }
    xhr.send();
}

function favorites(){
    var lcl_place = document.getElementById("favorites-list");
    var xhr = CustomXHR("GET", "/playlists/favorites");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            items = JSON.parse(xhr.responseText);
            print(items);
            lcl_place.textContent = "";
            var count = 0;
            items.forEach((element) =>{
                if (element.Albums != null){
                    lcl_place.innerHTML += '<div class="col-6 col-sm-4 col-lg-2"><div class="album"><div class="album__cover"><img src="' + server_host + '/songs/image/' + element.Albums.image + '"><a href="#" onclick="play_album('+element.Albums.id+', true);"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.54,9,8.88,3.46a3.42,3.42,0,0,0-5.13,3V17.58A3.42,3.42,0,0,0,7.17,21a3.43,3.43,0,0,0,1.71-.46L18.54,15a3.42,3.42,0,0,0,0-5.92Zm-1,4.19L7.88,18.81a1.44,1.44,0,0,1-1.42,0,1.42,1.42,0,0,1-.71-1.23V6.42a1.42,1.42,0,0,1,.71-1.23A1.51,1.51,0,0,1,7.17,5a1.54,1.54,0,0,1,.71.19l9.66,5.58a1.42,1.42,0,0,1,0,2.46Z"></path></svg></a></div><div class="album__title"><h3 style="text-align: center;"><a href="#" onclick="play_album('+element.Albums.id+', true);">' + element.Albums.name + '</a></h3></div></div></div>';
                }
                if (element.Users != null) count += 1;
            });
            if (count > 0){
                lcl_place.innerHTML += '<div style="margin-top: 10px; margin-left: auto; margin-right: auto; text-align: center;">Artists</div>';
            }
            items.forEach((element) =>{
                if (element.Users != null){
                    lcl_place.innerHTML += '<div class="col-6 col-sm-4 col-md-3 col-xl-2"><a class="artist" onclick="fill_profile('+element.Users.id+');" data-bs-toggle="modal" data-bs-target="#modal-user-profile"><div class="artist__cover"><img src="'+ server_host + '/songs/image/' + element.Users.image + '" alt=""></div><h3 class="artist__title">'+element.Users.username+'</h3></a></div>';
                }
            });
        }
        if (xhr.readyState === 4 && xhr.status === 404){
            lcl_place.innerHTML = "<div>Empty favorites list</div>";
        }
    }
    xhr.send();
}

function fill_own_profile(){
    var name = document.getElementById("profile_settings_name");
    var username = document.getElementById("profile_settings_username");
    var profile_img = document.getElementById("profile_settings_img");
    var syst = document.getElementById("system-el");
    var brows = document.getElementById("browser-el");
    var xhr = CustomXHR("GET", "/auth/me");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            items = JSON.parse(xhr.responseText);
            name.textContent = items.login;
            username.textContent = items.username;
            profile_img.src = items.image;
            syst.textContent = "Unknown OS";
            browserName = "Unknown Browser";
            var nAgt = navigator.userAgent;
            if (navigator.userAgent.indexOf("Win") != -1) syst.textContent = "Windows OS";
            else if (navigator.userAgent.indexOf("Mac") != -1) syst.textContent = "Macintosh";
            else if (navigator.userAgent.indexOf("Linux") != -1) syst.textContent = "Linux OS";
            else if (navigator.userAgent.indexOf("Android") != -1) syst.textContent = "Android OS";
            else if (navigator.userAgent.indexOf("like Mac") != -1) syst.textContent = "iOS";
            if ((verOffset=nAgt.indexOf("OPR"))!=-1) {
             browserName = "Opera";
             fullVersion = nAgt.substring(verOffset+4);
             if ((verOffset=nAgt.indexOf("Version"))!=-1)
               fullVersion = nAgt.substring(verOffset+8);
            }
            // In MS Edge, the true version is after "Edg" in userAgent
            else if ((verOffset=nAgt.indexOf("Edg"))!=-1) {
             browserName = "Microsoft Edge";
             fullVersion = nAgt.substring(verOffset+4);
            }
            // In MSIE, the true version is after "MSIE" in userAgent
            else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
             browserName = "Microsoft Internet Explorer";
             fullVersion = nAgt.substring(verOffset+5);
            }
            // In Chrome, the true version is after "Chrome"
            else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
             browserName = "Chrome";
             fullVersion = nAgt.substring(verOffset+7);
            }
            // In Safari, the true version is after "Safari" or after "Version"
            else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
             browserName = "Safari";
             fullVersion = nAgt.substring(verOffset+7);
             if ((verOffset=nAgt.indexOf("Version"))!=-1)
               fullVersion = nAgt.substring(verOffset+8);
            }
            // In Firefox, the true version is after "Firefox"
            else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
             browserName = "Firefox";
             fullVersion = nAgt.substring(verOffset+8);
            }
            // In most other browsers, "name/version" is at the end of userAgent
            else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
                      (verOffset=nAgt.lastIndexOf('/')) )
            {
             browserName = nAgt.substring(nameOffset,verOffset);
             fullVersion = nAgt.substring(verOffset+1);
             if (browserName.toLowerCase()==browserName.toUpperCase()) {
              browserName = navigator.appName;
             }
            }
            brows.textContent = "Now ⋅ Browser: " + browserName;
        }
    }
    xhr.send();
}

function fill_profile(id){
    var btn = document.getElementById("subscribe_button");
    var img = document.getElementById("user-profile-image");
    var lcl_name = document.getElementById("user-profile-name");
    var alb = document.getElementById("user-albums");

    var xhr = CustomXHR("GET", "/artists/albums?artist_id=" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            items = JSON.parse(xhr.responseText)[0];
            is_sub = JSON.parse(xhr.responseText)[1];
            img.src = server_host + "/songs/image/" + items[0].Users.image;
            lcl_name.textContent = items[0].Users.username;
            alb.textContent = "";
            if (is_sub == true){
                btn.textContent = "Unsubscribe";
                btn.setAttribute("onclick", "unsubscribe("+id+");");
            }
            else{
                btn.textContent = "Subscribe";
                btn.setAttribute("onclick", "subscribe("+id+");");
            }
            items.forEach((element) =>{
                alb.innerHTML += '<div class="col-6 col-sm-4 col-lg-2"><div class="album"><div class="album__cover"><img src="' + server_host + '/songs/image/' + element.Albums.image + '"><a href="#" onclick="play_album('+element.Albums.id+');"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.54,9,8.88,3.46a3.42,3.42,0,0,0-5.13,3V17.58A3.42,3.42,0,0,0,7.17,21a3.43,3.43,0,0,0,1.71-.46L18.54,15a3.42,3.42,0,0,0,0-5.92Zm-1,4.19L7.88,18.81a1.44,1.44,0,0,1-1.42,0,1.42,1.42,0,0,1-.71-1.23V6.42a1.42,1.42,0,0,1,.71-1.23A1.51,1.51,0,0,1,7.17,5a1.54,1.54,0,0,1,.71.19l9.66,5.58a1.42,1.42,0,0,1,0,2.46Z"></path></svg></a></div><div class="album__title"><h3 style="text-align: center;"><a href="'+ server_host +'">' + element.Albums.name + '</a></h3></div></div></div>';
            });
        }
    }
    xhr.send();
}

function track_block_constructor(track, own=false){
    var single_item = document.createElement("div");
    single_item.className = "single-item";

    var img_play_a = document.createElement("a");
    var track_index = playlist.indexOf(track);
    img_play_a.id = "track_" + track_index;
    img_play_a.className = "single-item__cover";
    img_play_a.setAttribute("data-img", "source/images/music.svg");
    img_play_a.setAttribute("onclick", "play_selected_track(" + track_index + ");");
    var track_poster = document.createElement("img");
    if (track.poster != null) track_poster.src = track.poster;
    else track_poster.src = "source/images/music.svg";
    img_play_a.appendChild(track_poster);
    img_play_a.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.54,9,8.88,3.46a3.42,3.42,0,0,0-5.13,3V17.58A3.42,3.42,0,0,0,7.17,21a3.43,3.43,0,0,0,1.71-.46L18.54,15a3.42,3.42,0,0,0,0-5.92Zm-1,4.19L7.88,18.81a1.44,1.44,0,0,1-1.42,0,1.42,1.42,0,0,1-.71-1.23V6.42a1.42,1.42,0,0,1,.71-1.23A1.51,1.51,0,0,1,7.17,5a1.54,1.54,0,0,1,.71.19l9.66,5.58a1.42,1.42,0,0,1,0,2.46Z"></path></svg>';
    img_play_a.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16,2a3,3,0,0,0-3,3V19a3,3,0,0,0,6,0V5A3,3,0,0,0,16,2Zm1,17a1,1,0,0,1-2,0V5a1,1,0,0,1,2,0ZM8,2A3,3,0,0,0,5,5V19a3,3,0,0,0,6,0V5A3,3,0,0,0,8,2ZM9,19a1,1,0,0,1-2,0V5A1,1,0,0,1,9,5Z"></path></svg>';

    var item_title = document.createElement("div");
    item_title.className = "single-item__title";
    var title_header = document.createElement("h4");
    title_header.textContent = track.artist;
    var title_name = document.createElement("span");
    if (track.title.length > 20) title_name.textContent = track.title.substring(0, 19) + "...";
    else title_name.textContent = track.title;
    item_title.appendChild(title_header);
    item_title.appendChild(title_name);

    single_item.appendChild(img_play_a);
    single_item.appendChild(item_title);
    var track_length = document.createElement("span");
    track_length.className = "single-item__time";
    if (track.duration != null) track_length.textContent = track.duration;
    else track_length.textContent = "2:28";
    single_item.appendChild(track_length);
    if (own == false){
        var add_to_favs = document.createElement("a");
        add_to_favs.className = "single-item__add";
        add_to_favs.href = "javascript:add_track_to_favorites(" + track.id + ");";
        add_to_favs.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"></path></svg>';
        single_item.appendChild(add_to_favs);
    }
    else {
        var track_actions = document.createElement("a");
        track_actions.className = "single-item__export";
        var local_dropdown = document.createElement("div");
        local_dropdown.className = "dropdown";
        var local_dropdown_collapse_button = document.createElement("a");
        local_dropdown_collapse_button.className = "icon text-muted";
        local_dropdown_collapse_button.href = "#";
        local_dropdown_collapse_button.setAttribute("role", "button");
        local_dropdown_collapse_button.setAttribute("data-bs-toggle", "dropdown");
        local_dropdown_collapse_button.setAttribute("aria-expanded", "false");
        local_dropdown_collapse_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
        local_dropdown.appendChild(local_dropdown_collapse_button);
        var local_dropdown_content = document.createElement("ul");
        local_dropdown_content.className = "dropdown-menu";
        var local_item_1 = document.createElement("li");
        var local_item_1_a = document.createElement("a");
        local_item_1_a.className = "dropdown-item d-flex align-items-center";
        local_item_1_a.href = "#";
        local_item_1_a.setAttribute("onclick", "cache_action(" + track_index + ");");
        var local_item_1_span = document.createElement("span");
        local_item_1_span.className = "me-auto";
        local_item_1_span.textContent = "Save";
        local_item_1_a.appendChild(local_item_1_span);
        var local_item_1_icon = document.createElement("div");
        local_item_1_icon.className = "icon";
        local_item_1_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Zm-9.71,1.71a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l4-4a1,1,0,0,0-1.42-1.42L13,12.59V3a1,1,0,0,0-2,0v9.59l-2.29-2.3a1,1,0,1,0-1.42,1.42Z"></path></svg>';
        local_item_1_a.appendChild(local_item_1_icon);
        local_item_1.appendChild(local_item_1_a);
        local_dropdown_content.appendChild(local_item_1);
        var local_item_2 = document.createElement("li");
        var local_item_2_a = document.createElement("a");
        local_item_2_a.className = "dropdown-item d-flex align-items-center";
        local_item_2_a.href = "#";
        local_item_2_a.setAttribute("onclick", "remove_track_from_favorites(" + track.id + ");");
        var local_item_2_span = document.createElement("span");
        local_item_2_span.className = "me-auto";
        local_item_2_span.textContent = "Remove";
        local_item_2_a.appendChild(local_item_2_span);
        var local_item_2_icon = document.createElement("div");
        local_item_2_icon.className = "icon";
        local_item_2_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.71,8.29a1,1,0,0,0-1.42,0L12,10.59,9.71,8.29A1,1,0,0,0,8.29,9.71L10.59,12l-2.3,2.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L13.41,12l2.3-2.29A1,1,0,0,0,15.71,8.29Zm3.36-3.36A10,10,0,1,0,4.93,19.07,10,10,0,1,0,19.07,4.93ZM17.66,17.66A8,8,0,1,1,20,12,7.95,7.95,0,0,1,17.66,17.66Z"></path></svg>';
        local_item_2_a.appendChild(local_item_2_icon);
        local_item_2.appendChild(local_item_2_a);
        local_dropdown_content.appendChild(local_item_2);
        local_dropdown.appendChild(local_dropdown_content);
        track_actions.appendChild(local_dropdown);
        single_item.appendChild(track_actions);
    }
    return single_item;
}

function player_constructor(temp=false) {
    var player = document.createElement("div");
    player.className = "music-player";
    var player_info = document.createElement("div");
    player_info.className = "info";
    var player_left = document.createElement("div");
    player_left.className = "left";
    if (temp == false){
        var player_heart = document.createElement("a");
        player_heart.className = "icon-heart jp-repeat";
        player_heart.href = "#";
        var temp_color = inactive_color;
        player_heart.innerHTML = '<svg id="icon-heart" xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + active_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
        player_left.appendChild(player_heart);
    }
    player_info.appendChild(player_left);
    var player_center = document.createElement("div");
    player_center.className = "center";
    var player_playlist = document.createElement("div");
    player_playlist.className = "jp-playlist";
    var player_playlist_div = document.createElement("div");
    var player_playlist_li = document.createElement("ul");
    player_playlist_div.appendChild(player_playlist_li);
    player_playlist.appendChild(player_playlist_div);
    player_center.appendChild(player_playlist);
    player_info.appendChild(player_center);
    var player_right = document.createElement("div");
    player_right.className = "right";
    var player_repeat = document.createElement("a");
    player_repeat.className = "icon-repeat";
    player_repeat.href = "#";
    player_repeat.innerHTML = '<svg id="icon-repeat" xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + active_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>';
    player_right.appendChild(player_repeat);
    player_info.appendChild(player_right);
    var player_progress = document.createElement("div");
    player_progress.className = "progress";
    player_info.appendChild(player_progress);
    player.appendChild(player_info);
    var player_controls = document.createElement("div");
    player_controls.className = "controls";
    var player_time = document.createElement("div");
    player_time.className = "current jp-current-time";
    player_time.textContent = "00:00";
    player_controls.appendChild(player_time);
    var player_play = document.createElement("div");
    player_play.className = "play-controls";
    var player_prev = document.createElement("a");
    player_prev.className = "jp-previous";
    player_prev.href = "#";
    player_prev.title = "previous";
    player_prev.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>';
    player_play.appendChild(player_prev);
    var player_play_play = document.createElement("a");
    player_play_play.className = "jp-play";
    player_play_play.href = "#";
    player_play_play.title = "play";
    player_play_play.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    player_play.appendChild(player_play_play);
    var player_pause = document.createElement("a");
    player_pause.className = "jp-pause";
    player_pause.href = "#";
    player_pause.title = "pause";
    player_pause.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    player_play.appendChild(player_pause);
    var player_next = document.createElement("a");
    player_next.className = "jp-next";
    player_next.href = "#";
    player_next.title = "next";
    player_next.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>';
    player_play.appendChild(player_next);
    player_controls.appendChild(player_play);
    var player_volume = document.createElement("div");
    player_volume.className = "volume-level";
    var player_volume_up = document.createElement("a");
    player_volume_up.className = "icon-player-volume-up";
    player_volume_up.href = "javascript:;";
    player_volume_up.title = "max volume";
    player_volume_up.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + inactive_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    player_volume.appendChild(player_volume_up);
    var player_volume_down = document.createElement("a");
    player_volume_down.className = "icon-player-volume-down";
    player_volume_down.href = "javascript:;";
    player_volume_down.title = "mute";
    player_volume_down.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + inactive_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>';
    player_volume.appendChild(player_volume_down);
    player_controls.appendChild(player_volume);
    player.appendChild(player_controls);
    var jquery_player = document.createElement("div");
    jquery_player.id = "jquery_jplayer";
    jquery_player.className = "jp-jplayer";
    player.appendChild(jquery_player);
    return player;
}

function highlight_track(track_id){
    var track_blocks = document.querySelectorAll(".single-item__cover");
    for (var i = 0; i < track_blocks.length; i++) {
        track_blocks[i].className = "single-item__cover";
    }
    document.getElementById('track_' + track_id).className = "single-item__cover active play";
}

function add_track_to_favorites(id){
    var xhr = CustomXHR("PATCH", "/playlists/add-track/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            alert('ok');
        }
    }
    xhr.send();
}

function remove_track_from_favorites(id){
    var xhr = CustomXHR("DELETE", "/playlists/remove-track/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            alert('ok');
        }
    }
    xhr.send();
}

function cache_track(url){
    print("caching " + url);
    var cache = document.createElement("audio");
    cache.setAttribute("id", "cache_" + url);
    cache.setAttribute("muted", "");
    cache.src = url;
    cache.setAttribute("onended", "remove_cache_player('" + url + "');");
    document.body.appendChild(cache);
    cache.volume = 0;
    cache.playbackRate = 15;
    cache.play();
}

function remove_cache_player(url){
    var block = document.getElementById("cache_" + url);
    block.parentNode.removeChild(block);
    print("removed");
}

function cache_action(track_id){
    cache_track(playlist[track_id].mp3);
}

function preload_track(track_id){  // todo test
    if (track_id == playlist.length - 1) track_id = 0;
    else track_id = track_id + 1;
    cache_track(playlist[track_id].mp3);
}

function player_start(playlist){
    var songDuration = -1;
    var cssSelector={
        jPlayer: "#jquery_jplayer",
        cssSelectorAncestor: ".music-player"
    };
    var options={
        swfPath: "/source/lib/jquery.jplayer.swf",
        supplied: "ogv, m4v, oga, mp3",
        loop: true,
        volumechange: function(event){
            $(".volume-level").slider("value", event.jPlayer.options.volume);
        },
        timeupdate: function(event){
            $(".progress").slider("value", event.jPlayer.status.currentPercentAbsolute);
            if (event.jPlayer.status.currentPercentAbsolute > 75 && can_preload == true){
                can_preload = false;
                preload_track(myPlaylist.current);
            }
        },
        ended: function(event){
            can_preload = true;
            highlight_track(myPlaylist.current);
        },
        pause: function(event){
            document.getElementById('track_' + myPlaylist.current).className = "single-item__cover active pause";
        },
        play: function(event){
            document.getElementById('track_' + myPlaylist.current).className = "single-item__cover active play";
        },
        loadeddata: function(event){
            songDuration = event.jPlayer.status.duration;
        }
    };
    myPlaylist = new jPlayerPlaylist(cssSelector, playlist, options);
    var PlayerData = $(cssSelector.jPlayer).data("jPlayer");

    $(".jp-next").click(function(){
        highlight_track(myPlaylist.current);
    });
    $(".jp-previous").click(function(){
        highlight_track(myPlaylist.current);
    });
    $(".volume-level").slider({
        animate: "fast",
		max: 1,
		range: "min",
		step: 0.01,
		value : $.jPlayer.prototype.options.volume,
		slide: function(event, ui){
			$(cssSelector.jPlayer).jPlayer("option", "muted", false);
			$(cssSelector.jPlayer).jPlayer("option", "volume", ui.value);
		}
    });
    $(".progress").slider({
		animate: "fast",
		max: 100,
		range: "min",
		step: 0.1,
		value : 0,
		slide: function(event, ui){
			$(cssSelector.jPlayer).jPlayer("play", ui.value * (songDuration / 100));
		}
	});
}

function player(hard=false){
    current_alb = null;
    if (tracks_placeholder.textContent != "" && hard == false){
        return;
    }
    var xhr = CustomXHR("GET", "/playlists/");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            playlist = JSON.parse(xhr.responseText);
            print(playlist);
            player_placeholder.textContent = "";
            player_placeholder.appendChild(player_constructor(true));
            tracks_placeholder.textContent = "";
            playlist.forEach((element) =>{
                tracks_placeholder.appendChild(track_block_constructor(element, true));
            });
            player_start(playlist);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
        else if (xhr.readyState === 4 && xhr.status === 404){
            tracks_placeholder.textContent = "";
            var results_div = document.createElement("div");
            results_div.className = "single-item";
            var search_div = document.createElement("div");
            search_div.style = "font-weight: bold;";
            search_div.textContent = "Playlist is empty";
            results_div.appendChild(search_div);
            tracks_placeholder.appendChild(results_div);
        }
    }
    xhr.send();
}

function update_profile_img(){
    var url = "/auth/image";
    var formData = new FormData();
    formData.append("data", profile_image_input.files[0]);
    $.ajax({url: server_host + url,
        type: 'POST',
        headers: {'authorization': 'Bearer ' + getCookie("token")},
        data: formData,
        async: false, cache: false, contentType: false, processData: false,
        success: function (data){ fill_own_profile(); }
    });
}

function play_selected_track(track_id){
    var track_block = document.getElementById('track_' + track_id);
    if (track_block.className == "single-item__cover"){
        myPlaylist.play(track_id);
        var track_blocks = document.querySelectorAll(".single-item__cover");
        for (var i = 0; i < track_blocks.length; i++) {
            track_blocks[i].className = "single-item__cover";
        }
        track_block.className = "single-item__cover active pause";
    }
    else if (track_block.className == "single-item__cover active pause"){
        myPlaylist.play();
        track_block.className = "single-item__cover active play";
    }
    else if (track_block.className == "single-item__cover active play"){
        myPlaylist.pause();
        track_block.className = "single-item__cover active pause"
    }
}

function play_album(id, from_favs=false){
    current_alb = id;
    var xhr = CustomXHR("GET", "/albums/get/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            playlist = JSON.parse(xhr.responseText);
            print(playlist);
            player_placeholder.textContent = "";
            player_placeholder.appendChild(player_constructor());
            tracks_placeholder.textContent = "";
            playlist.forEach((element) =>{
                tracks_placeholder.appendChild(track_block_constructor(element));
            });
            player_start(playlist);
            var button_el = document.getElementById("icon-heart");
            if (from_favs == true){
                button_el.setAttribute("stroke", active_color);
                button_el.parentNode.setAttribute("onclick", "remove_from_favs_func("+id+")");
            }
            else{
                button_el.setAttribute("stroke", inactive_color);
                button_el.parentNode.setAttribute("onclick", "add_to_favs_func("+id+")");
            }
        }
    }
    xhr.send();
}

function remove_from_favs_func(id){
    var button_el = document.getElementById("icon-heart");
    button_el.setAttribute("stroke", inactive_color);
    button_el.parentNode.setAttribute("onclick", "add_to_favs_func("+id+")");

    var xhr = CustomXHR("DELETE", "/playlists/album/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){}
    }
    xhr.send();
}

function add_to_favs_func(id){
    var button_el = document.getElementById("icon-heart");
    button_el.setAttribute("stroke", active_color);
    button_el.parentNode.setAttribute("onclick", "remove_from_favs_func("+id+")");

    var xhr = CustomXHR("Post", "/playlists/album/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){}
    }
    xhr.send();
}

function subscribe(id){
    var btn = document.getElementById("subscribe_button");

    btn.textContent = "Unsubscribe";
    btn.setAttribute("onclick", "unsubscribe("+id+");");

    var xhr = CustomXHR("POST", "/playlists/artist/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){}
    }
    xhr.send();
}

function unsubscribe(id){
    var btn = document.getElementById("subscribe_button");

    btn.textContent = "Subscribe";
    btn.setAttribute("onclick", "subscribe("+id+");");

    var xhr = CustomXHR("DELETE", "/playlists/artist/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){}
    }
    xhr.send();
}

function add_track_to_alb(){
    var song_img = document.getElementById("upload-song-img").files;
    var song_file = document.getElementById("upload-song-file").files;
    var song_name = document.getElementById("upload-song-name").value;

    if (song_name.length == 0) {alert("Название не может быть пустым"); return;}
    if (song_img.length == 0) {alert("Постер не может быть пустым"); return;}
    song_img = song_img[0]
    if (song_file.length == 0) {alert("Файл песни не может быть пустым"); return;}
    song_file = song_file[0]

    var formData = new FormData();
    formData.append("image", song_img);
    formData.append("file", song_file);
    $.ajax({url: server_host + "/albums/add-track/" + current_alb + "/" + song_name,
        type: 'POST',
        headers: {'authorization': 'Bearer ' + getCookie("token")},
        data: formData,
        async: false, cache: false, contentType: false, processData: false,
        success: function (data){ alert("Трек добавлен"); }
    });
}

function delete_alb(id){
    var xhr = CustomXHR("DELETE", "/albums/delete/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){alert("Альбом удален");}
    }
    xhr.send();
}

function remove_from_alb(id){
    var xhr = CustomXHR("DELETE", "/albums/remove-track/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){alert("Трек удален");}
    }
    xhr.send();
}

function fill_album(id, own=false){
    current_alb = id;
    document.getElementById("delete_alb_btn").setAttribute("onclick", "delete_alb(" + id + ");");
    var xhr = CustomXHR("GET", "/albums/get/" + id);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            var data = JSON.parse(xhr.responseText);
            var lcl_place = document.getElementById("own-tracks");
            lcl_place.textContent = "";
            data.forEach((element) =>{
                lcl_place.innerHTML += '<div class="single-item"><a class="single-item__cover" data-img="source/images/music.svg"><img src="'+ element.poster + '"></a><div class="single-item__title"><span>'+element.title+'</span></div><span class="single-item__time">'+element.duration+'</span><div class="dropdown"><a class="icon text-muted" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></a><ul class="dropdown-menu" style="position: absolute; inset: 0px 0px auto auto; margin: 0px; transform: translate3d(0px, 20px, 0px);" data-popper-placement="bottom-end"><li><a class="dropdown-item d-flex align-items-center" href="#" onclick="remove_from_alb('+element.id+');"><span class="me-auto">Remove</span><div class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.71,8.29a1,1,0,0,0-1.42,0L12,10.59,9.71,8.29A1,1,0,0,0,8.29,9.71L10.59,12l-2.3,2.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L13.41,12l2.3-2.29A1,1,0,0,0,15.71,8.29Zm3.36-3.36A10,10,0,1,0,4.93,19.07,10,10,0,1,0,19.07,4.93ZM17.66,17.66A8,8,0,1,1,20,12,7.95,7.95,0,0,1,17.66,17.66Z"></path></svg></div></a></li></ul></div></div>';
            });
        }
        if (xhr.readyState === 4 && xhr.status === 404){
            lcl_place.textContent = "Album is empty";
        }
    }
    xhr.send();
}

fill_own_profile();
